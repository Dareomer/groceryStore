import mongoose from 'mongoose';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const databasePath = path.resolve(__dirname, '../../database');

// Convert MongoDB Extended JSON ($oid) into actual ObjectId values.
function restoreObjectIds(value: any): any {
  if (Array.isArray(value)) return value.map(restoreObjectIds);
  if (value !== null && typeof value === 'object') {
    if (Object.keys(value).length === 1 && typeof value.$oid === 'string') {
      return new mongoose.Types.ObjectId(value.$oid);
    }
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, restoreObjectIds(item)])
    );
  }
  return value;
}

function loadData(filename: string): any[] {
  const content = readFileSync(path.join(databasePath, filename), 'utf8');
  const documents = restoreObjectIds(JSON.parse(content));
  if (!Array.isArray(documents)) throw new Error(`${filename} must contain a JSON array`);
  return documents;
}

async function seed() {
  const stores = loadData('stores.json');
  const users = loadData('users.json');

  // Catch broken relationships before modifying the database.
  const storeIds = new Set(stores.map(store => store._id.toString()));
  for (const store of stores) {
    if (store.parentId && !storeIds.has(store.parentId.toString())) {
      throw new Error(`Missing parent store for ${store.name}`);
    }
    for (const id of store.parents) {
      if (!storeIds.has(id.toString())) throw new Error(`Invalid ancestor for ${store.name}`);
    }
  }
  for (const user of users) {
    if (!storeIds.has(user.department.toString())) {
      throw new Error(`Invalid department for ${user.username}`);
    }
    if (typeof user.password !== 'string' || !/^\$2[aby]\$\d\d\$/.test(user.password)) {
      throw new Error(`Expected a bcrypt hash for ${user.username}`);
    }
  }

  const uri = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/GroceryStore';
  await mongoose.connect(uri);

  try {
    // Insert missing documents only: rerunning the script won't overwrite edits.
    const storeResult = await mongoose.connection.db!.collection('store').bulkWrite(
      stores.map(store => ({
        updateOne: { filter: { _id: store._id }, update: { $setOnInsert: store }, upsert: true }
      }))
    );
    const userResult = await mongoose.connection.db!.collection('user').bulkWrite(
      users.map(user => ({
        updateOne: { filter: { _id: user._id }, update: { $setOnInsert: user }, upsert: true }
      }))
    );

    console.log(`Stores: ${storeResult.upsertedCount} inserted, ${stores.length - storeResult.upsertedCount} already existed`);
    console.log(`Users: ${userResult.upsertedCount} inserted, ${users.length - userResult.upsertedCount} already existed`);
    console.log('Database initialization complete.');
  } finally {
    await mongoose.disconnect();
  }
}

seed().catch(error => {
  console.error('Database initialization failed:', error);
  process.exitCode = 1;
});
