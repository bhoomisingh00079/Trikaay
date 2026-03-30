require('dotenv').config();
const mongoose = require('mongoose');

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }
  return `${value.toFixed(value >= 10 || idx === 0 ? 0 : 2)} ${units[idx]}`;
}

function printHeading(text) {
  console.log(`\n=== ${text} ===`);
}

async function getCollectionStats(db, collectionName) {
  try {
    const stats = await db.command({ collStats: collectionName });
    return {
      size: stats.size || 0,
      storageSize: stats.storageSize || 0,
      totalIndexSize: stats.totalIndexSize || 0,
    };
  } catch (error) {
    return {
      size: 0,
      storageSize: 0,
      totalIndexSize: 0,
      error: error.message,
    };
  }
}

async function printCollectionSummary(db) {
  const collections = await db.listCollections({}, { nameOnly: true }).toArray();

  if (!collections.length) {
    console.log('No collections found.');
    return;
  }

  printHeading('Collection Summary');
  console.log('Collection'.padEnd(24) + 'Documents'.padStart(12) + 'Data Size'.padStart(14) + 'Storage'.padStart(14));
  console.log('-'.repeat(64));

  for (const item of collections) {
    const collectionName = item.name;
    const collection = db.collection(collectionName);
    const docCount = await collection.countDocuments({});
    const stats = await getCollectionStats(db, collectionName);

    console.log(
      collectionName.padEnd(24) +
      String(docCount).padStart(12) +
      formatBytes(stats.size).padStart(14) +
      formatBytes(stats.storageSize).padStart(14)
    );
  }
}

async function printMediaAssetBreakdown(db) {
  const collectionName = 'mediaassets';
  const exists = await db.listCollections({ name: collectionName }, { nameOnly: true }).toArray();
  if (!exists.length) return;

  const media = db.collection(collectionName);
  const byKind = await media.aggregate([
    {
      $group: {
        _id: { kind: '$kind', category: '$category' },
        count: { $sum: 1 },
        totalSize: { $sum: '$size' },
      },
    },
    { $sort: { '_id.kind': 1, '_id.category': 1 } },
  ]).toArray();

  printHeading('Media Assets Breakdown (kind/category)');
  if (!byKind.length) {
    console.log('No media assets found.');
    return;
  }

  byKind.forEach((row) => {
    const kind = row._id.kind || 'unknown';
    const category = row._id.category || 'uncategorized';
    console.log(`- ${kind}/${category}: ${row.count} files, ${formatBytes(row.totalSize)}`);
  });
}

async function printProjectPreview(db) {
  const collectionName = 'projects';
  const exists = await db.listCollections({ name: collectionName }, { nameOnly: true }).toArray();
  if (!exists.length) return;

  const projects = await db.collection(collectionName)
    .find({}, { projection: { projectNumber: 1, title: 1, isVisible: 1 } })
    .sort({ projectNumber: 1, order: 1 })
    .limit(10)
    .toArray();

  printHeading('Project Preview (first 10)');
  if (!projects.length) {
    console.log('No projects found.');
    return;
  }

  projects.forEach((project) => {
    console.log(`- #${project.projectNumber || '-'} | ${project.title || '(untitled)'} | visible: ${project.isVisible ? 'yes' : 'no'}`);
  });
}

async function run() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required in backend/.env');
  }

  console.log('\nMongo Developer Report');
  console.log('Generated at:', new Date().toISOString());

  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  printHeading('Database Info');
  const dbStats = await db.stats();
  console.log('Database Name:', db.databaseName);
  console.log('Collections  :', dbStats.collections);
  console.log('Objects      :', dbStats.objects);
  console.log('Data Size    :', formatBytes(dbStats.dataSize));
  console.log('Storage Size :', formatBytes(dbStats.storageSize));
  console.log('Index Size   :', formatBytes(dbStats.indexSize));

  await printCollectionSummary(db);
  await printMediaAssetBreakdown(db);
  await printProjectPreview(db);

  await mongoose.connection.close();
  console.log('\nReport complete.\n');
}

run().catch(async (error) => {
  console.error('\nFailed to generate Mongo developer report:', error.message);
  try {
    await mongoose.connection.close();
  } catch (closeError) {
    // ignore close error
  }
  process.exit(1);
});
