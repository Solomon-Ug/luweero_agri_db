// =============================================================================
// LUWEERO DISTRICT AGRICULTURAL MANAGEMENT SYSTEM
// Sample Queries – NoSQL Assignment (Sem 2, 2026)
// =============================================================================

use("luweero_agri_db");

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: BASIC FIND QUERIES
// ─────────────────────────────────────────────────────────────────────────────

// Q1. List all active farmers and their primary activities
print("\n── Q1: All active farmers ──");
db.farmers.find(
  { status: "Active" },
  { full_name: 1, village: 1, primary_activities: 1, phone: 1, _id: 0 }
).forEach(printjson);

// Q2. Find farms larger than 5 acres with freehold tenure
print("\n── Q2: Freehold farms > 5 acres ──");
db.farms.find(
  { tenure_type: "Freehold", size_acres: { $gt: 5 } },
  { farm_name: 1, farmer_name: 1, size_acres: 1, village: 1, _id: 0 }
).forEach(printjson);

// Q3. List all market transactions that are UNPAID or PARTIAL
print("\n── Q3: Unpaid / Partial transactions ──");
db.market_transactions.find(
  { payment_status: { $in: ["Partial", "Unpaid"] } },
  { farmer_name: 1, produce_type: 1, total_amount_ugx: 1, payment_status: 1, balance_due_ugx: 1, _id: 0 }
).forEach(printjson);

// Q4. Show all extension visits with pending follow-ups
print("\n── Q4: Extension visits awaiting follow-up ──");
db.extension_visits.find(
  { follow_up_completed: false },
  { "officer.name": 1, farmer_id: 1, visit_date: 1, follow_up_date: 1, status: 1, _id: 0 }
).sort({ follow_up_date: 1 })
 .forEach(printjson);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: QUERY ON EMBEDDED / NESTED DOCUMENTS
// ─────────────────────────────────────────────────────────────────────────────

// Q5. Find crop records with post-harvest losses > 30 kg in any harvest event
print("\n── Q5: Crop records with harvest losses > 30 kg ──");
db.crop_livestock.find(
  { "harvests.post_harvest_losses_kg": { $gt: 30 } },
  { crop_name: 1, farm_id: 1, "harvests.harvest_id": 1,
    "harvests.post_harvest_losses_kg": 1, "harvests.loss_reason": 1, _id: 0 }
).forEach(printjson);

// Q6. Find extension visits where a specific recommendation is still "Pending"
print("\n── Q6: Visits with pending recommendations ──");
db.extension_visits.find(
  { "recommendations.status": "Pending" },
  { "officer.name": 1, visit_date: 1,
    farmer_id: 1, recommendations: 1, _id: 0 }
).forEach(printjson);

// Q7. Farmers who are members of the "Luweero Dairy Farmers Association"
print("\n── Q7: Dairy Association members ──");
db.farmers.find(
  { "cooperative.name": "Luweero Dairy Farmers Association" },
  { full_name: 1, village: 1, "cooperative.membership_number": 1,
    "cooperative.role": 1, _id: 0 }
).forEach(printjson);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: AGGREGATION PIPELINE QUERIES
// ─────────────────────────────────────────────────────────────────────────────

// Q8. Total revenue per farmer from market transactions
print("\n── Q8: Total revenue per farmer ──");
db.market_transactions.aggregate([
  {
    $group: {
      _id: "$farmer_name",
      total_gross_ugx:     { $sum: "$total_amount_ugx" },
      total_transport_ugx: { $sum: "$transport_cost_ugx" },
      total_net_ugx:       { $sum: "$net_revenue_ugx" },
      transactions_count:  { $sum: 1 }
    }
  },
  { $sort: { total_net_ugx: -1 } },
  {
    $project: {
      _id: 0,
      farmer: "$_id",
      total_gross_ugx: 1,
      total_transport_ugx: 1,
      total_net_ugx: 1,
      transactions_count: 1
    }
  }
]).forEach(printjson);

// Q9. Average farm size by tenure type
print("\n── Q9: Average farm size by tenure type ──");
db.farms.aggregate([
  {
    $group: {
      _id: "$tenure_type",
      avg_size_acres: { $avg: "$size_acres" },
      total_farms:    { $sum: 1 },
      total_acres:    { $sum: "$size_acres" }
    }
  },
  { $sort: { avg_size_acres: -1 } }
]).forEach(printjson);

// Q10. Count extension visits by organisation
print("\n── Q10: Extension visits by organisation ──");
db.extension_visits.aggregate([
  {
    $group: {
      _id: "$officer.organisation",
      visit_count: { $sum: 1 },
      officers:    { $addToSet: "$officer.name" }
    }
  },
  { $sort: { visit_count: -1 } }
]).forEach(printjson);

// Q11. Lookup (JOIN) – Enrich market transactions with full farmer details
print("\n── Q11: Market transactions with farmer details (lookup) ──");
db.market_transactions.aggregate([
  {
    $lookup: {
      from:         "farmers",
      localField:   "farmer_id",
      foreignField: "_id",
      as:           "farmer_details"
    }
  },
  { $unwind: "$farmer_details" },
  {
    $project: {
      _id: 0,
      produce_type:    1,
      quantity_kg:     1,
      total_amount_ugx: 1,
      payment_status:  1,
      transaction_date: 1,
      farmer_full_name:  "$farmer_details.full_name",
      farmer_village:    "$farmer_details.village",
      farmer_phone:      "$farmer_details.phone",
      cooperative:       "$farmer_details.cooperative.name"
    }
  },
  { $sort: { transaction_date: -1 } }
]).forEach(printjson);

// Q12. Total post-harvest losses by crop type (unwind harvests array)
//      Only Crop records with a numeric quantity_kg are included.
print("\n── Q12: Total post-harvest losses by crop ──");
db.crop_livestock.aggregate([
  { $match: { record_type: "Crop" } },
  { $unwind: "$harvests" },
  { $match: { "harvests.quantity_kg": { $gt: 0 } } },   // exclude livestock/zero entries
  {
    $group: {
      _id: "$crop_name",
      total_harvested_kg: { $sum: "$harvests.quantity_kg" },
      total_losses_kg:    { $sum: { $ifNull: ["$harvests.post_harvest_losses_kg", 0] } },
      loss_events:        { $sum: 1 }
    }
  },
  {
    $addFields: {
      loss_pct: {
        $round: [
          {
            $multiply: [
              {
                $cond: [
                  { $gt: ["$total_harvested_kg", 0] },
                  { $divide: ["$total_losses_kg", "$total_harvested_kg"] },
                  0
                ]
              },
              100
            ]
          },
          1
        ]
      }
    }
  },
  { $sort: { loss_pct: -1 } }
]).forEach(printjson);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: GEOSPATIAL QUERY
// ─────────────────────────────────────────────────────────────────────────────

// Q13. Find all farms within 15 km of Luwero Town centre (lon: 32.4893, lat: 0.8471)
print("\n── Q13: Farms within 15 km of Luwero Town ──");
db.farms.find({
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [32.4893, 0.8471] },
      $maxDistance: 15000   // metres
    }
  }
},
{ farm_name: 1, farmer_name: 1, village: 1, size_acres: 1, tenure_type: 1, _id: 0 }
).forEach(printjson);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: UPDATE EXAMPLES
// ─────────────────────────────────────────────────────────────────────────────

// Q14. Mark a specific recommendation as Completed
print("\n── Q14: Update recommendation status ──");
db.extension_visits.updateOne(
  {
    _id: ObjectId("665f000000000000000000e1"),
    "recommendations.action": "Apply Ridomil Gold before long rains"
  },
  {
    $set: { "recommendations.$.status": "Completed" }
  }
);
print("Recommendation updated.");

// Q15. Add a new harvest event to Nakato's coffee record
print("\n── Q15: Push new harvest to coffee record ──");
db.crop_livestock.updateOne(
  { _id: ObjectId("665f000000000000000000c1") },
  {
    $push: {
      harvests: {
        harvest_id: "HV-C1-004",
        harvest_date: new Date("2024-11-28"),
        quantity_kg: 720,
        grade: "Screen 15",
        moisture_content_pct: 11.0,
        post_harvest_losses_kg: 8,
        loss_reason: null,
        storage_method: "Metal silo"
      }
    }
  }
);
print("New harvest event appended.");

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6: TEXT SEARCH (requires text index)
// ─────────────────────────────────────────────────────────────────────────────

// Create a text index on advice_given field
db.extension_visits.createIndex({ advice_given: "text", topics_covered: "text" });

// Q16. Full-text search for visits mentioning "mastitis"
print("\n── Q16: Extension visits mentioning mastitis ──");
db.extension_visits.find(
  { $text: { $search: "mastitis" } },
  { "officer.name": 1, visit_date: 1, advice_given: 1, _id: 0 }
).forEach(printjson);

print("\n✅  All queries executed successfully.");
