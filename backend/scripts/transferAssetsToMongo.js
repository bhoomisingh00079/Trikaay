require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const MediaAsset = require('../models/MediaAsset');
const Project = require('../models/Project');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const IMAGES_DIR = path.join(ROOT_DIR, 'Frontend', 'public', 'images');
const DOCS_DIR = path.join(ROOT_DIR, 'Frontend', 'public', 'docs');

const mimeByExt = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.pdf': 'application/pdf',
};

const docCategoryMap = {
  '80G.pdf': 'org',
  'Pan Card.pdf': 'org',
  'Tan Card 402109.pdf': 'org',
  'CERTIFICATE OF INCORPORATION.PDF': 'org',
  'Form 10A_ARN (3).pdf': 'org',
  'subscribersheet_MOA.pdf': 'org',
  'TRIKAY CARE AND CREATION ASSOCIATION ITR ACKNOWLEDGEMENT F.Y 22-23.pdf': 'csr',
  'TRIKEY CARE AND CREATION ASSOCIATION BALANCE SHEET CA SIGNED.pdf': 'csr',
  'Fund Utilization.pdf': 'csr',
  'TCCA Activity report Document (A4).pdf': 'project',
  'Progress Report.pdf': 'project',
  'Trikay Fund utilization and project report.pdf': 'project',
  'AAJCT7962LE20221_signed.pdf': 'project',
  'AAJCT7962LF20221_signed.pdf': 'project',
};

function toTitle(fileName) {
  return fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function upsertAsset(filePath, kind) {
  try {
    const originalName = path.basename(filePath);
    const ext = path.extname(originalName).toLowerCase();
    const mimeType = mimeByExt[ext] || 'application/octet-stream';
    const data = fs.readFileSync(filePath);

    const category = kind === 'pdf' ? (docCategoryMap[originalName] || 'general') : 'general';

    await MediaAsset.findOneAndUpdate(
      { originalName },
      {
        originalName,
        kind,
        category,
        title: toTitle(originalName),
        mimeType,
        size: data.length,
        data,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    console.error(`  ⚠️  Error uploading ${path.basename(filePath)}: ${error.message}`);
  }
}

async function relinkProjectUrls() {
  try {
    const projects = await Project.find({}).lean().exec();

    for (const project of projects) {
      if (!project.images || project.images.length === 0) continue;

      let hasChanges = false;
      const updatedImages = project.images.map((img) => {
        if (typeof img === 'string' && img.startsWith('/images/')) {
          const fileName = img.replace('/images/', '');
          hasChanges = true;
          return `/api/media/file/${encodeURIComponent(fileName)}`;
        }
        return img;
      });

      if (hasChanges) {
        await Project.updateOne({ _id: project._id }, { images: updatedImages });
      }
    }
  } catch (error) {
    console.error('Error during relinking:', error.message);
    // Continue anyway - assets are already uploaded
  }
}

async function run() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required in backend/.env');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const imageFiles = fs
      .readdirSync(IMAGES_DIR)
      .filter((name) => {
        try {
          return fs.statSync(path.join(IMAGES_DIR, name)).isFile();
        } catch {
          return false;
        }
      });
    const pdfFiles = fs
      .readdirSync(DOCS_DIR)
      .filter((name) => {
        try {
          return fs.statSync(path.join(DOCS_DIR, name)).isFile();
        } catch {
          return false;
        }
      });

    console.log(`\n📤 Uploading ${imageFiles.length} images...`);
    for (const file of imageFiles) {
      await upsertAsset(path.join(IMAGES_DIR, file), 'image');
      console.log(`   ✅ ${file}`);
    }

    console.log(`\n📄 Uploading ${pdfFiles.length} PDFs...`);
    for (const file of pdfFiles) {
      await upsertAsset(path.join(DOCS_DIR, file), 'pdf');
      console.log(`   ✅ ${file}`);
    }

    console.log('\n🔗 Relinking project URLs...');
    await relinkProjectUrls();
    console.log('   ✅ URLs relinked');

    const imageCount = await MediaAsset.countDocuments({ kind: 'image' });
    const pdfCount = await MediaAsset.countDocuments({ kind: 'pdf' });
    console.log(`\n✨ Done! MongoDB now has ${imageCount} images and ${pdfCount} PDFs.`);
  } catch (error) {
    console.error('❌ Transfer error:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed\n');
  }
}

run()
  .catch((error) => {
    console.error('❌ Fatal error:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.connection.close();
    } catch (e) {
      // Ignore
    }
  });