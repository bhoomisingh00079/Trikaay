/**
 * Automation Process Module
 *
 * Idempotent, re-entry-safe processing of approved volunteers.
 *
 * Design:
 *   - Google Sheets is the source of truth.
 *   - There is NO polling. The /sheets-event webhook (or a direct
 *     "approve" call from the admin route) drives processing.
 *   - A per-row in-memory lock guarantees that two simultaneous clicks
 *     for the same row can never send two emails.
 *   - The sheet itself is used as a coarse lock: when a row is being
 *     processed, its Status is set to "Processing". Other workers
 *     (the webhook, the next click) MUST skip "Processing" rows.
 *   - "Completed" is terminal. Any call that sees "Completed" exits
 *     successfully without doing work.
 *
 * Stage log markers (printed at every stage):
 *   - sheet updated
 *   - automation started
 *   - row fetched
 *   - certificate generated
 *   - mongo saved
 *   - email sent
 *   - status changed to Completed
 */

const googleSheets = require('./googleSheets');
const certificate = require('./certificate');
const emailService = require('./emailService');
const MediaAsset = require('../models/MediaAsset');
const mongoose = require('mongoose');

const STAGE = {
  AUTOMATION_STARTED: 'automation started',
  ROW_FETCHED: 'row fetched',
  CERTIFICATE_GENERATED: 'certificate generated',
  MONGO_SAVED: 'mongo saved',
  EMAIL_SENT: 'email sent',
  STATUS_COMPLETED: 'status changed to Completed',
  SHEET_UPDATED: 'sheet updated',
};

const AUTOMATION_STATUS = {
  APPROVED: 'Approved',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
};

// Per-row in-memory lock: `${sheetId}::${rowNumber}` -> Promise
const rowLocks = new Map();

// Whole-cycle lock (one automation pass at a time for the webhook path)
let isCycleRunning = false;

function nowIso() {
  return new Date().toISOString();
}

function logStage(stage, extra) {
  const tail = extra ? ` | ${extra}` : '';
  console.log(`[${nowIso()}] [automation] [${stage}]${tail}`);
}

function logError(stage, error) {
  console.error(`[${nowIso()}] [automation] [error] [${stage}]`, error);
  if (error && error.stack) {
    console.error(error.stack);
  }
}

async function waitForMongoReady(timeoutMs = 15000) {
  const startedAt = Date.now();
  while (mongoose.connection.readyState !== 1) {
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error(
        `MongoDB is not connected (readyState=${mongoose.connection.readyState})`
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

async function withRowLock(lockKey, work) {
  const previous = rowLocks.get(lockKey) || Promise.resolve();
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  rowLocks.set(
    lockKey,
    previous.then(() => gate)
  );
  try {
    await previous;
    return await work();
  } finally {
    release();
    if (rowLocks.get(lockKey) === gate) {
      rowLocks.delete(lockKey);
    }
  }
}

/**
 * Atomically claim a row for processing.
 *
 * Returns:
 *   { state: 'claimed',    row, rowNumber, certId?, sheetTab }
 *   { state: 'already_done', row, rowNumber, certId?, sheetTab }   (Completed or certId set)
 *   { state: 'in_progress' }                                       (another worker holds it)
 *   { state: 'not_eligible', status }                              (e.g. Pending / rejected)
 */
async function claimRow(spreadsheetId, rowNumber, sheetTab) {
  const currentRow = await googleSheets.getRow(spreadsheetId, rowNumber, sheetTab);
  const status = String(currentRow[6] || '').trim();
  const existingCertId = String(currentRow[7] || '').trim();

  logStage(STAGE.ROW_FETCHED, `row=${rowNumber} status="${status}" certId="${existingCertId}"`);

  if (status === AUTOMATION_STATUS.COMPLETED) {
    return { state: 'already_done', row: currentRow, rowNumber, certId: existingCertId, sheetTab };
  }

  if (status === AUTOMATION_STATUS.PROCESSING) {
    return { state: 'in_progress' };
  }

  if (status !== AUTOMATION_STATUS.APPROVED) {
    return { state: 'not_eligible', status };
  }

  // Generate certId if missing and atomically claim by writing "Processing".
  // If two workers race here, Google Sheets' last-writer-wins on the same
  // single cell will leave exactly one winner; the loser will read back
  // "Processing" on the next read and exit.
  let certId = existingCertId;
  if (!certId) {
    certId = certificate.generateCertificateId();
    await googleSheets.updateCell(spreadsheetId, rowNumber, 7, certId, sheetTab);
    logStage(STAGE.SHEET_UPDATED, `row=${rowNumber} col=H certId=${certId}`);
  }

  await googleSheets.updateCell(spreadsheetId, rowNumber, 6, AUTOMATION_STATUS.PROCESSING, sheetTab);
  logStage(STAGE.SHEET_UPDATED, `row=${rowNumber} col=G status=${AUTOMATION_STATUS.PROCESSING}`);

  return { state: 'claimed', row: currentRow, rowNumber, certId, sheetTab };
}

/**
 * Mark a row Completed in the sheet. This is the terminal transition.
 */
async function markCompleted(spreadsheetId, rowNumber, sheetTab) {
  await googleSheets.updateCell(
    spreadsheetId,
    rowNumber,
    6,
    AUTOMATION_STATUS.COMPLETED,
    sheetTab
  );
  logStage(STAGE.STATUS_COMPLETED, `row=${rowNumber} -> ${AUTOMATION_STATUS.COMPLETED}`);
}

/**
 * Revert a row back to "Approved" so the next attempt can retry.
 * Only safe to call if we successfully wrote "Processing" — otherwise
 * we would clobber the original state.
 */
async function revertToApproved(spreadsheetId, rowNumber, sheetTab) {
  try {
    await googleSheets.updateCell(
      spreadsheetId,
      rowNumber,
      6,
      AUTOMATION_STATUS.APPROVED,
      sheetTab
    );
    logStage(STAGE.SHEET_UPDATED, `row=${rowNumber} reverted to ${AUTOMATION_STATUS.APPROVED}`);
  } catch (innerError) {
    logError('revert to Approved', innerError);
  }
}

/**
 * Process a single volunteer for certificate.
 *
 * @param {Object} _unused            - Kept for backward compatibility (ignored).
 * @param {number} rowNumber          - 1-based row number in the sheet.
 * @param {string} spreadsheetId      - Google Sheets ID.
 * @param {string} [sheetTab]         - Optional tab name override.
 * @returns {Promise<{success:boolean, skipped?:boolean, reason?:string}>}
 */
async function processVolunteerCertificate(_unused, rowNumber, spreadsheetId, sheetTab) {
  const lockKey = `${spreadsheetId}::${rowNumber}`;

  return withRowLock(lockKey, async () => {
    logStage(STAGE.AUTOMATION_STARTED, `row=${rowNumber}`);

    try {
      await waitForMongoReady();

      // 1. Claim the row (re-reads, generates certId, writes "Processing").
      const claim = await claimRow(spreadsheetId, rowNumber, sheetTab);

      if (claim.state === 'already_done') {
        logStage(STAGE.STATUS_COMPLETED, `row=${rowNumber} already Completed (idempotent no-op)`);
        return { success: true, skipped: true, reason: 'already_completed' };
      }
      if (claim.state === 'in_progress') {
        return { success: false, skipped: true, reason: 'in_progress' };
      }
      if (claim.state === 'not_eligible') {
        return { success: false, skipped: true, reason: `not_eligible:${claim.status}` };
      }

      const { row, certId } = claim;
      const name = row[0];
      const phone = row[1];
      const email = row[2];
      const position = row[3];
      const experience = row[4];
      const availability = row[5];

      if (!email) {
        await revertToApproved(spreadsheetId, rowNumber, sheetTab);
        return { success: false, skipped: true, reason: 'missing_email' };
      }

      // 2. Generate or reuse the certificate PDF.
      const safeName = name
        ? name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-]/g, '')
        : 'volunteer';
      const filename = `${certId}_${safeName}.pdf`;

      let pdfBuffer;
      const existingAsset = await MediaAsset.findOne({ originalName: filename }).lean();
      if (existingAsset && existingAsset.data) {
        pdfBuffer = existingAsset.data;
        logStage(STAGE.CERTIFICATE_GENERATED, `row=${rowNumber} reused ${filename}`);
      } else {
        pdfBuffer = await certificate.generateCertificatePDF(
          { name, phone, email, position, experience, availability },
          certId,
          process.env.NGO_NAME || 'Our NGO'
        );
        logStage(STAGE.CERTIFICATE_GENERATED, `row=${rowNumber} ${filename} (${pdfBuffer.length} bytes)`);

        await MediaAsset.findOneAndUpdate(
          { originalName: filename },
          {
            originalName: filename,
            kind: 'pdf',
            category: 'certificate',
            title: `Volunteer Certificate - ${name}`,
            mimeType: 'application/pdf',
            size: pdfBuffer.length,
            data: pdfBuffer,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        logStage(STAGE.MONGO_SAVED, `row=${rowNumber} ${filename}`);
      }

      // 3. Send the email.
      await emailService.sendCertificateEmail({
        to: email,
        volunteerName: name,
        certificateId: certId,
        certificateBuffer: pdfBuffer,
        certificateFileName: filename,
      });
      logStage(STAGE.EMAIL_SENT, `row=${rowNumber} -> ${email}`);

      // 4. Mark the row Completed (terminal).
      await markCompleted(spreadsheetId, rowNumber, sheetTab);

      return { success: true };
    } catch (error) {
      logError(`row=${rowNumber} processing`, error);
      // We claimed the row (status -> Processing). Revert so a retry works.
      await revertToApproved(spreadsheetId, rowNumber, sheetTab);
      return { success: false, reason: 'exception' };
    }
  });
}

/**
 * Webhook-driven automation cycle.
 * Finds all rows that are still "Approved" with no certId, and processes
 * each one. Idempotent: "Processing" and "Completed" rows are ignored.
 */
async function runAutomation(spreadsheetId) {
  if (isCycleRunning) {
    logStage('cycle skipped', 'another cycle is already running');
    return { skipped: true };
  }
  isCycleRunning = true;

  try {
    logStage(STAGE.AUTOMATION_STARTED, 'cycle begin');

    const pendingRows = await googleSheets.findPendingCertificates(spreadsheetId);
    logStage('cycle scan', `pending=${pendingRows.length}`);

    const results = [];
    for (const item of pendingRows) {
      // eslint-disable-next-line no-await-in-loop
      const r = await processVolunteerCertificate([], item.rowNumber, spreadsheetId);
      results.push({ rowNumber: item.rowNumber, ...r });
    }

    logStage('cycle done', `processed=${results.length}`);
    return { skipped: false, results };
  } catch (error) {
    logError('cycle', error);
    return { skipped: false, error: true };
  } finally {
    isCycleRunning = false;
  }
}

module.exports = {
  processVolunteerCertificate,
  runAutomation,
};
