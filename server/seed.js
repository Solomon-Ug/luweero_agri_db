// ============================================================
// Native Node.js Database Seeder for Luweero Agri DB
// Runs anywhere (locally or on Render/MongoDB Atlas) via: npm run seed
// ============================================================
const { MongoClient, ObjectId } = require("mongodb");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

try {
  require("dotenv").config();
} catch (_) {}

function loadEnvFile(envPath) {
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        val = val.replace(/^["'](.*)["']$/, "$1");
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}
loadEnvFile(path.resolve(__dirname, "../.env"));
loadEnvFile(path.resolve(__dirname, ".env"));

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = process.env.DB_NAME || "luweero_agri_db";

async function runSeed() {
  const maskedUri = MONGO_URI.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:****@");
  console.log(`Connecting to MongoDB at: ${maskedUri} ...`);
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    console.log(`Connected to database: ${DB_NAME}`);

    const seedFile = path.join(__dirname, "seed_database.js");
    const code = fs.readFileSync(seedFile, "utf8");

    // Collect all documents and indexes from seed_database.js
    const collectionsData = {};
    const mockDb = new Proxy({}, {
      get: (_target, colName) => {
        if (!collectionsData[colName]) {
          collectionsData[colName] = { docs: [], indexes: [] };
        }
        return {
          drop: () => {},
          insertMany: (arr) => { collectionsData[colName].docs = arr; },
          createIndex: (spec, opts) => { collectionsData[colName].indexes.push({ spec, opts }); },
          countDocuments: () => collectionsData[colName].docs.length
        };
      }
    });

    const sandbox = {
      ObjectId: (id) => new ObjectId(id),
      Date,
      use: () => {},
      db: mockDb,
      print: () => {},
      printjson: () => {},
      console: { log: () => {}, warn: () => {}, error: () => {} }
    };

    vm.createContext(sandbox);
    vm.runInContext(code, sandbox);

    // Apply drop, insertMany, and createIndex to MongoDB
    for (const [colName, data] of Object.entries(collectionsData)) {
      const col = db.collection(colName);
      try {
        await col.drop();
      } catch (_) {}

      if (data.docs && data.docs.length > 0) {
        await col.insertMany(data.docs);
        console.log(`✅  Inserted ${data.docs.length} documents into '${colName}'`);
      }
      for (const idx of data.indexes) {
        try {
          await col.createIndex(idx.spec, idx.opts);
          console.log(`    Created index on '${colName}':`, JSON.stringify(idx.spec));
        } catch (idxErr) {
          console.warn(`    Notice: index creation warning on '${colName}':`, idxErr.message);
        }
      }
    }

    console.log(`\n🎉  Database '${DB_NAME}' successfully seeded with full dataset!`);
  } catch (err) {
    console.error("❌  Seeding failed:", err.message);
    process.exitCode = 1;
  } finally {
    try { await client.close(); } catch (_) {}
  }
}

runSeed();

