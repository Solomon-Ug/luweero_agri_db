// ============================================================
// Luweero Agri DB – Express API Server (with full CRUD & Exports)
// ============================================================
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = 3000;
const MONGO_URI = "mongodb://127.0.0.1:27017";
const DB_NAME = "luweero_agri_db";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Simple password hashing function (for demo purposes)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

let db;

// ── Connect once, reuse client ────────────────────────────────
MongoClient.connect(MONGO_URI)
  .then((client) => {
    db = client.db(DB_NAME);
    console.log(` Connected to MongoDB → ${DB_NAME}`);
    
    // Initialize default admin user if not exists
    initializeDefaultAdmin();
    
    app.listen(PORT, () =>
      console.log(`  Dashboard → http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌  MongoDB connection failed:", err.message);
    process.exit(1);
  });

// Initialize default admin user
async function initializeDefaultAdmin() {
  try {
    const adminExists = await col("users").findOne({ username: "admin" });
    if (!adminExists) {
      await col("users").insertOne({
        username: "admin",
        password: hashPassword("admin123"),
        full_name: "System Administrator",
        email: "admin@luweero.go.ug",
        role: "admin",
        created_at: new Date()
      });
      console.log(" Default admin user created (username: admin, password: admin123)");
    }
  } catch (err) {
    console.warn("Failed to initialize default admin:", err.message);
  }
}

// ── Helpers ───────────────────────────────────────────────────
const col = (name) => db.collection(name);

const toOid = (id) => {
  try { return new ObjectId(id); } catch { return null; }
};

// CSV helper for server-side exports
function buildCSV(headers, rows) {
  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    if (val instanceof Date) return `"${val.toISOString().split("T")[0]}"`;
    if (Array.isArray(val)) val = val.join("; ");
    if (typeof val === "object") {
      val = Object.entries(val)
        .map(([k, v]) => `${k}:${v}`)
        .join("; ");
    }
    return `"${String(val).replace(/"/g, '""')}"`;
  };
  const headerLine = headers.map((h) => escapeCell(h.label)).join(",");
  const dataLines = rows.map((row) =>
    headers.map((h) => escapeCell(h.get(row))).join(",")
  );
  return "\uFEFF" + [headerLine, ...dataLines].join("\r\n");
}

// ══════════════════════════════════════════════════════════════
// AUTHENTICATION & USER MANAGEMENT
// ══════════════════════════════════════════════════════════════
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const user = await col("users").findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!verifyPassword(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/users", async (_req, res) => {
  try {
    const docs = await col("users")
      .find({})
      .project({ password: 0 }) // Exclude password from response
      .sort({ created_at: -1 })
      .toArray();
    res.json(docs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { username, password, full_name, email, role } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    // Check if username already exists
    const existing = await col("users").findOne({ username });
    if (existing) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const result = await col("users").insertOne({
      username,
      password: hashPassword(password),
      full_name: full_name || "",
      email: email || "",
      role: role || "user",
      created_at: new Date()
    });

    const { password: _, ...userWithoutPassword } = await col("users").findOne({ _id: result.insertedId });
    res.status(201).json(userWithoutPassword);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const oid = toOid(req.params.id);
    if (!oid) return res.status(400).json({ error: "Invalid id" });
    
    const user = await col("users").findOne({ _id: oid });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // Prevent deletion of admin user
    if (user.username === "admin") {
      return res.status(403).json({ error: "Cannot delete admin user" });
    }

    const result = await col("users").deleteOne({ _id: oid });
    res.json({ deletedCount: result.deletedCount });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ══════════════════════════════════════════════════════════════
// STATS ─────────────────────────────────────────────────────
app.get("/api/stats", async (_req, res) => {
  try {
    const [farmers, farms, crops, sales, visits] = await Promise.all([
      col("farmers").countDocuments(),
      col("farms").countDocuments(),
      col("crop_livestock").countDocuments(),
      col("market_transactions").countDocuments(),
      col("extension_visits").countDocuments(),
    ]);

    const totalRevenue = await col("market_transactions")
      .aggregate([{ $group: { _id: null, total: { $sum: "$net_revenue_ugx" } } }])
      .toArray();

    const paidCount = await col("market_transactions").countDocuments({
      payment_status: "Paid",
    });

    res.json({
      farmers, farms, crops, sales, visits,
      totalRevenue: totalRevenue[0]?.total ?? 0,
      paidCount,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ══════════════════════════════════════════════════════════════
// FARMERS – CRUD & Single View
// ══════════════════════════════════════════════════════════════
app.get("/api/farmers", async (_req, res) => {
  try {
    const docs = await col("farmers")
      .find({})
      .sort({ full_name: 1 })
      .toArray();
    res.json(docs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/farmers/:id", async (req, res) => {
  try {
    const oid = toOid(req.params.id);
    if (!oid) return res.status(400).json({ error: "Invalid id" });
    const doc = await col("farmers").findOne({ _id: oid });
    if (!doc) return res.status(404).json({ error: "Farmer not found" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/farmers", async (req, res) => {
  try {
    const body = req.body;
    if (typeof body.primary_activities === "string")
      body.primary_activities = body.primary_activities.split(",").map(s => s.trim()).filter(Boolean);
    if (body.household_size) body.household_size = parseInt(body.household_size);
    if (!body.registered_on) body.registered_on = new Date();
    const result = await col("farmers").insertOne(body);
    res.status(201).json({ insertedId: result.insertedId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/farmers/:id", async (req, res) => {
  try {
    const oid = toOid(req.params.id);
    if (!oid) return res.status(400).json({ error: "Invalid id" });
    const body = req.body;
    delete body._id;
    if (typeof body.primary_activities === "string")
      body.primary_activities = body.primary_activities.split(",").map(s => s.trim()).filter(Boolean);
    if (body.household_size) body.household_size = parseInt(body.household_size);
    const result = await col("farmers").updateOne({ _id: oid }, { $set: body });
    res.json({ modifiedCount: result.modifiedCount });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/farmers/:id", async (req, res) => {
  try {
    const oid = toOid(req.params.id);
    if (!oid) return res.status(400).json({ error: "Invalid id" });
    const result = await col("farmers").deleteOne({ _id: oid });
    res.json({ deletedCount: result.deletedCount });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════
// FARMS – CRUD & Single View
// ══════════════════════════════════════════════════════════════
app.get("/api/farms", async (_req, res) => {
  try {
    const docs = await col("farms")
      .find({})
      .sort({ size_acres: -1 })
      .toArray();
    res.json(docs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/farms/:id", async (req, res) => {
  try {
    const oid = toOid(req.params.id);
    if (!oid) return res.status(400).json({ error: "Invalid id" });
    const doc = await col("farms").findOne({ _id: oid });
    if (!doc) return res.status(404).json({ error: "Farm not found" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/farms", async (req, res) => {
  try {
    const body = req.body;
    if (body.size_acres) body.size_acres = parseFloat(body.size_acres);
    if (body.soil_ph) body.soil_ph = parseFloat(body.soil_ph);
    if (typeof body.current_crops === "string")
      body.current_crops = body.current_crops.split(",").map(s => s.trim()).filter(Boolean);
    if (typeof body.current_livestock === "string")
      body.current_livestock = body.current_livestock.split(",").map(s => s.trim()).filter(Boolean);
    if (body.irrigation !== undefined) body.irrigation = body.irrigation === "true" || body.irrigation === true;
    if (!body.registered_on) body.registered_on = new Date();
    const result = await col("farms").insertOne(body);
    res.status(201).json({ insertedId: result.insertedId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/farms/:id", async (req, res) => {
  try {
    const oid = toOid(req.params.id);
    if (!oid) return res.status(400).json({ error: "Invalid id" });
    const body = req.body;
    delete body._id;
    if (body.size_acres) body.size_acres = parseFloat(body.size_acres);
    if (body.soil_ph) body.soil_ph = parseFloat(body.soil_ph);
    if (typeof body.current_crops === "string")
      body.current_crops = body.current_crops.split(",").map(s => s.trim()).filter(Boolean);
    if (typeof body.current_livestock === "string")
      body.current_livestock = body.current_livestock.split(",").map(s => s.trim()).filter(Boolean);
    if (body.irrigation !== undefined) body.irrigation = body.irrigation === "true" || body.irrigation === true;
    const result = await col("farms").updateOne({ _id: oid }, { $set: body });
    res.json({ modifiedCount: result.modifiedCount });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/farms/:id", async (req, res) => {
  try {
    const oid = toOid(req.params.id);
    if (!oid) return res.status(400).json({ error: "Invalid id" });
    const result = await col("farms").deleteOne({ _id: oid });
    res.json({ deletedCount: result.deletedCount });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════
// CROPS / LIVESTOCK – CRUD & Single View
// ══════════════════════════════════════════════════════════════
app.get("/api/crops", async (_req, res) => {
  try {
    const docs = await col("crop_livestock")
      .find({})
      .sort({ record_type: 1 })
      .toArray();
    res.json(docs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/crops/:id", async (req, res) => {
  try {
    const oid = toOid(req.params.id);
    if (!oid) return res.status(400).json({ error: "Invalid id" });
    const doc = await col("crop_livestock").findOne({ _id: oid });
    if (!doc) return res.status(404).json({ error: "Crop/Livestock record not found" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/crops", async (req, res) => {
  try {
    const body = req.body;
    if (body.area_planted_acres) body.area_planted_acres = parseFloat(body.area_planted_acres);
    if (body.herd_size) body.herd_size = parseInt(body.herd_size);
    if (body.flock_size) body.flock_size = parseInt(body.flock_size);
    if (!body.harvests) body.harvests = [];
    const result = await col("crop_livestock").insertOne(body);
    res.status(201).json({ insertedId: result.insertedId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/crops/:id", async (req, res) => {
  try {
    const oid = toOid(req.params.id);
    if (!oid) return res.status(400).json({ error: "Invalid id" });
    const body = req.body;
    delete body._id;
    if (body.area_planted_acres) body.area_planted_acres = parseFloat(body.area_planted_acres);
    if (body.herd_size) body.herd_size = parseInt(body.herd_size);
    if (body.flock_size) body.flock_size = parseInt(body.flock_size);
    const result = await col("crop_livestock").updateOne({ _id: oid }, { $set: body });
    res.json({ modifiedCount: result.modifiedCount });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/crops/:id", async (req, res) => {
  try {
    const oid = toOid(req.params.id);
    if (!oid) return res.status(400).json({ error: "Invalid id" });
    const result = await col("crop_livestock").deleteOne({ _id: oid });
    res.json({ deletedCount: result.deletedCount });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════
// MARKET TRANSACTIONS – CRUD & Single View
// ══════════════════════════════════════════════════════════════
app.get("/api/transactions", async (_req, res) => {
  try {
    const docs = await col("market_transactions")
      .find({})
      .sort({ transaction_date: -1 })
      .toArray();
    res.json(docs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/transactions/:id", async (req, res) => {
  try {
    const oid = toOid(req.params.id);
    if (!oid) return res.status(400).json({ error: "Invalid id" });
    const doc = await col("market_transactions").findOne({ _id: oid });
    if (!doc) return res.status(404).json({ error: "Transaction not found" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/transactions", async (req, res) => {
  try {
    const body = req.body;
    if (body.total_amount_ugx) body.total_amount_ugx = parseFloat(body.total_amount_ugx);
    if (body.net_revenue_ugx) body.net_revenue_ugx = parseFloat(body.net_revenue_ugx);
    if (body.transport_cost_ugx) body.transport_cost_ugx = parseFloat(body.transport_cost_ugx);
    if (body.unit_price_ugx) body.unit_price_ugx = parseFloat(body.unit_price_ugx);
    if (body.quantity_kg) body.quantity_kg = parseFloat(body.quantity_kg);
    if (body.quantity_litres) body.quantity_litres = parseFloat(body.quantity_litres);
    if (body.transaction_date) body.transaction_date = new Date(body.transaction_date);
    if (body.payment_date) body.payment_date = new Date(body.payment_date);
    const result = await col("market_transactions").insertOne(body);
    res.status(201).json({ insertedId: result.insertedId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/transactions/:id", async (req, res) => {
  try {
    const oid = toOid(req.params.id);
    if (!oid) return res.status(400).json({ error: "Invalid id" });
    const body = req.body;
    delete body._id;
    if (body.total_amount_ugx) body.total_amount_ugx = parseFloat(body.total_amount_ugx);
    if (body.net_revenue_ugx) body.net_revenue_ugx = parseFloat(body.net_revenue_ugx);
    if (body.transport_cost_ugx) body.transport_cost_ugx = parseFloat(body.transport_cost_ugx);
    if (body.unit_price_ugx) body.unit_price_ugx = parseFloat(body.unit_price_ugx);
    if (body.quantity_kg) body.quantity_kg = parseFloat(body.quantity_kg);
    if (body.quantity_litres) body.quantity_litres = parseFloat(body.quantity_litres);
    if (body.transaction_date) body.transaction_date = new Date(body.transaction_date);
    if (body.payment_date) body.payment_date = new Date(body.payment_date);
    const result = await col("market_transactions").updateOne({ _id: oid }, { $set: body });
    res.json({ modifiedCount: result.modifiedCount });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const oid = toOid(req.params.id);
    if (!oid) return res.status(400).json({ error: "Invalid id" });
    const result = await col("market_transactions").deleteOne({ _id: oid });
    res.json({ deletedCount: result.deletedCount });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════
// EXTENSION VISITS – CRUD & Single View
// ══════════════════════════════════════════════════════════════
app.get("/api/visits", async (_req, res) => {
  try {
    const docs = await col("extension_visits")
      .find({})
      .sort({ visit_date: -1 })
      .toArray();
    res.json(docs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/visits/:id", async (req, res) => {
  try {
    const oid = toOid(req.params.id);
    if (!oid) return res.status(400).json({ error: "Invalid id" });
    const doc = await col("extension_visits").findOne({ _id: oid });
    if (!doc) return res.status(404).json({ error: "Visit not found" });
    res.json(doc);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/visits", async (req, res) => {
  try {
    const body = req.body;
    if (body.visit_date) body.visit_date = new Date(body.visit_date);
    if (body.follow_up_date) body.follow_up_date = new Date(body.follow_up_date);
    if (typeof body.topics_covered === "string")
      body.topics_covered = body.topics_covered.split(",").map(s => s.trim()).filter(Boolean);
    if (!body.recommendations) body.recommendations = [];
    body.follow_up_completed = body.follow_up_completed === "true" || body.follow_up_completed === true;
    const result = await col("extension_visits").insertOne(body);
    res.status(201).json({ insertedId: result.insertedId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/visits/:id", async (req, res) => {
  try {
    const oid = toOid(req.params.id);
    if (!oid) return res.status(400).json({ error: "Invalid id" });
    const body = req.body;
    delete body._id;
    if (body.visit_date) body.visit_date = new Date(body.visit_date);
    if (body.follow_up_date) body.follow_up_date = new Date(body.follow_up_date);
    if (typeof body.topics_covered === "string")
      body.topics_covered = body.topics_covered.split(",").map(s => s.trim()).filter(Boolean);
    body.follow_up_completed = body.follow_up_completed === "true" || body.follow_up_completed === true;
    const result = await col("extension_visits").updateOne({ _id: oid }, { $set: body });
    res.json({ modifiedCount: result.modifiedCount });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete("/api/visits/:id", async (req, res) => {
  try {
    const oid = toOid(req.params.id);
    if (!oid) return res.status(400).json({ error: "Invalid id" });
    const result = await col("extension_visits").deleteOne({ _id: oid });
    res.json({ deletedCount: result.deletedCount });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════
// AGGREGATIONS & REPORTS
// ══════════════════════════════════════════════════════════════
app.get("/api/revenue-by-farmer", async (_req, res) => {
  try {
    const docs = await col("market_transactions")
      .aggregate([
        { $group: { _id: "$farmer_name", gross: { $sum: "$total_amount_ugx" }, net: { $sum: "$net_revenue_ugx" }, count: { $sum: 1 } } },
        { $sort: { net: -1 } },
      ])
      .toArray();
    res.json(docs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/farms-by-tenure", async (_req, res) => {
  try {
    const docs = await col("farms")
      .aggregate([
        { $group: { _id: "$tenure_type", count: { $sum: 1 }, total_acres: { $sum: "$size_acres" }, avg_acres: { $avg: "$size_acres" } } },
        { $sort: { total_acres: -1 } },
      ])
      .toArray();
    res.json(docs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/loss-by-crop", async (_req, res) => {
  try {
    const docs = await col("crop_livestock")
      .aggregate([
        { $match: { record_type: "Crop" } },
        { $unwind: "$harvests" },
        { $match: { "harvests.quantity_kg": { $gt: 0 } } },
        { $group: { _id: "$crop_name", harvested: { $sum: "$harvests.quantity_kg" }, losses: { $sum: { $ifNull: ["$harvests.post_harvest_losses_kg", 0] } } } },
        { $addFields: { loss_pct: { $round: [{ $cond: [{ $gt: ["$harvested", 0] }, { $multiply: [{ $divide: ["$losses", "$harvested"] }, 100] }, 0] }, 1] } } },
        { $sort: { loss_pct: -1 } },
      ])
      .toArray();
    res.json(docs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/reports/summary", async (_req, res) => {
  try {
    const [stats, topRevenue, tenure, losses] = await Promise.all([
      col("market_transactions").aggregate([
        {
          $group: {
            _id: null,
            totalGross: { $sum: "$total_amount_ugx" },
            totalNet: { $sum: "$net_revenue_ugx" },
            totalTransport: { $sum: "$transport_cost_ugx" },
            txCount: { $sum: 1 },
          },
        },
      ]).toArray(),
      col("market_transactions").aggregate([
        { $group: { _id: "$farmer_name", netRevenue: { $sum: "$net_revenue_ugx" }, count: { $sum: 1 } } },
        { $sort: { netRevenue: -1 } },
        { $limit: 10 },
      ]).toArray(),
      col("farms").aggregate([
        { $group: { _id: "$tenure_type", farmCount: { $sum: 1 }, totalAcres: { $sum: "$size_acres" } } },
        { $sort: { totalAcres: -1 } },
      ]).toArray(),
      col("crop_livestock").aggregate([
        { $match: { record_type: "Crop" } },
        { $unwind: "$harvests" },
        { $group: { _id: "$crop_name", harvestedKg: { $sum: "$harvests.quantity_kg" }, lossesKg: { $sum: "$harvests.post_harvest_losses_kg" } } },
      ]).toArray(),
    ]);

    const farmerCount = await col("farmers").countDocuments();
    const farmCount = await col("farms").countDocuments();
    const cropCount = await col("crop_livestock").countDocuments();
    const visitCount = await col("extension_visits").countDocuments();

    res.json({
      generatedAt: new Date(),
      district: "Luweero",
      kpis: {
        totalFarmers: farmerCount,
        totalFarms: farmCount,
        totalCropsLivestock: cropCount,
        totalTransactions: stats[0]?.txCount || 0,
        totalExtensionVisits: visitCount,
        totalGrossRevenueUGX: stats[0]?.totalGross || 0,
        totalNetRevenueUGX: stats[0]?.totalNet || 0,
        totalTransportUGX: stats[0]?.totalTransport || 0,
      },
      topRevenueFarmers: topRevenue,
      tenureBreakdown: tenure,
      harvestLosses: losses,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ══════════════════════════════════════════════════════════════
// BACKEND CSV EXPORT ENDPOINTS
// ══════════════════════════════════════════════════════════════
app.get("/api/export/:collection/csv", async (req, res) => {
  const { collection } = req.params;
  try {
    let csvData = "";
    let filename = `${collection}_export_${Date.now()}.csv`;

    if (collection === "farmers") {
      const docs = await col("farmers").find({}).sort({ full_name: 1 }).toArray();
      filename = `luweero_farmers_registry_${Date.now()}.csv`;
      csvData = buildCSV([
        { label: "Record ID", get: d => d._id },
        { label: "Full Name", get: d => d.full_name },
        { label: "National ID", get: d => d.national_id || "" },
        { label: "Gender", get: d => d.gender },
        { label: "Phone", get: d => d.phone },
        { label: "Village", get: d => d.village },
        { label: "Sub County", get: d => d.sub_county },
        { label: "District", get: d => d.district || "Luweero" },
        { label: "Primary Activities", get: d => d.primary_activities },
        { label: "Household Size", get: d => d.household_size },
        { label: "Education Level", get: d => d.education_level },
        { label: "Cooperative Name", get: d => d.cooperative?.name || "None" },
        { label: "Cooperative Role", get: d => d.cooperative?.role || "" },
        { label: "Membership No", get: d => d.cooperative?.membership_number || "" },
        { label: "Status", get: d => d.status },
        { label: "Registered On", get: d => d.registered_on },
      ], docs);
    } else if (collection === "farms") {
      const docs = await col("farms").find({}).sort({ size_acres: -1 }).toArray();
      filename = `luweero_farms_plots_${Date.now()}.csv`;
      csvData = buildCSV([
        { label: "Farm ID", get: d => d._id },
        { label: "Farm Name", get: d => d.farm_name },
        { label: "Owner / Farmer", get: d => d.farmer_name },
        { label: "Size (Acres)", get: d => d.size_acres },
        { label: "Tenure Type", get: d => d.tenure_type },
        { label: "Village", get: d => d.village },
        { label: "Sub County", get: d => d.sub_county },
        { label: "Soil Type", get: d => d.soil_type },
        { label: "Soil pH", get: d => d.soil_ph },
        { label: "Irrigation", get: d => d.irrigation ? "Yes" : "No" },
        { label: "Water Source", get: d => d.water_source },
        { label: "Current Crops", get: d => d.current_crops },
        { label: "Current Livestock", get: d => d.current_livestock },
        { label: "Status", get: d => d.status },
      ], docs);
    } else if (collection === "crops") {
      const docs = await col("crop_livestock").find({}).sort({ record_type: 1 }).toArray();
      filename = `luweero_crop_livestock_${Date.now()}.csv`;
      csvData = buildCSV([
        { label: "Record ID", get: d => d._id },
        { label: "Record Type", get: d => d.record_type },
        { label: "Produce / Animal", get: d => d.crop_name || d.animal_type },
        { label: "Variety / Breed", get: d => d.variety || d.breed },
        { label: "Season", get: d => d.season },
        { label: "Area Planted (Acres)", get: d => d.area_planted_acres },
        { label: "Herd / Flock Size", get: d => d.herd_size || d.flock_size },
        { label: "Planting / Acquisition Date", get: d => d.planting_date || d.acquisition_date },
        { label: "Harvest Count", get: d => (d.harvests || []).length },
        { label: "Status", get: d => d.status },
      ], docs);
    } else if (collection === "transactions") {
      const docs = await col("market_transactions").find({}).sort({ transaction_date: -1 }).toArray();
      filename = `luweero_market_sales_receipts_${Date.now()}.csv`;
      csvData = buildCSV([
        { label: "Receipt / Voucher ID", get: d => d._id },
        { label: "Transaction Date", get: d => d.transaction_date },
        { label: "Farmer Name", get: d => d.farmer_name },
        { label: "Produce Type", get: d => d.produce_type },
        { label: "Quantity (kg/L)", get: d => d.quantity_kg ? `${d.quantity_kg} kg` : (d.quantity_litres ? `${d.quantity_litres} L` : "") },
        { label: "Unit Price (UGX)", get: d => d.unit_price_ugx },
        { label: "Gross Amount (UGX)", get: d => d.total_amount_ugx },
        { label: "Transport Deduction (UGX)", get: d => d.transport_cost_ugx },
        { label: "Net Payout (UGX)", get: d => d.net_revenue_ugx },
        { label: "Buyer Name", get: d => d.buyer?.name },
        { label: "Buyer Type", get: d => d.buyer?.type },
        { label: "Buyer Contact", get: d => d.buyer?.contact || "" },
        { label: "Market Channel", get: d => d.market_channel },
        { label: "Payment Status", get: d => d.payment_status },
        { label: "Payment Method", get: d => d.payment_method },
        { label: "Payment Date", get: d => d.payment_date },
        { label: "Season", get: d => d.season },
      ], docs);
    } else if (collection === "visits") {
      const docs = await col("extension_visits").find({}).sort({ visit_date: -1 }).toArray();
      filename = `luweero_extension_visits_${Date.now()}.csv`;
      csvData = buildCSV([
        { label: "Visit ID", get: d => d._id },
        { label: "Visit Date", get: d => d.visit_date },
        { label: "Officer Name", get: d => d.officer?.name },
        { label: "Officer Title", get: d => d.officer?.title },
        { label: "Organisation", get: d => d.officer?.organisation },
        { label: "Visit Type", get: d => d.visit_type },
        { label: "Topics Covered", get: d => d.topics_covered },
        { label: "Recommendations Count", get: d => (d.recommendations || []).length },
        { label: "Follow-up Date", get: d => d.follow_up_date },
        { label: "Follow-up Completed", get: d => d.follow_up_completed ? "Yes" : "No" },
        { label: "Status", get: d => d.status },
      ], docs);
    } else {
      return res.status(400).json({ error: "Invalid collection for export" });
    }

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csvData);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
