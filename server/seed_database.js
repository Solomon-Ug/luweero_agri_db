// =============================================================================
// LUWEERO DISTRICT AGRICULTURAL MANAGEMENT SYSTEM
// MongoDB Database Seed Script
// University Assignment – NoSQL Databases (Sem 2, 2026)
//
// Collections:
//   1. farmers            – Individual / household cultivators
//   2. farms              – Land plots linked to farmers
//   3. crop_livestock     – Production records (crops & livestock)
//   4. market_transactions – Sales & collection events
//   5. extension_visits   – Advisory/extension service interactions
// =============================================================================

// ── Switch to (or create) the target database ────────────────────────────────
use("luweero_agri_db");

// ── Drop existing collections so the script is re-runnable ───────────────────
db.farmers.drop();
db.farms.drop();
db.crop_livestock.drop();
db.market_transactions.drop();
db.extension_visits.drop();

// =============================================================================
// 1. FARMERS COLLECTION
//    Stores individual or household cultivators in Luweero District.
//    Key fields: name, contact, village, cooperative, national_id / phone,
//                status, household_size, primary_activities.
// =============================================================================
db.farmers.insertMany([
  {
    _id: ObjectId("665f000000000000000000a1"),
    full_name: "Nakato Grace",
    national_id: "CM90200197638004",
    phone: "+256772345678",
    gender: "Female",
    date_of_birth: new Date("1985-03-14"),
    village: "Kiwoko",
    sub_county: "Kiwoko",
    district: "Luweero",
    cooperative: {
      name: "Kiwoko Farmers' Cooperative",
      membership_number: "KFC-2018-041",
      joined_date: new Date("2018-06-01"),
      role: "Member"
    },
    household_size: 6,
    primary_activities: ["coffee", "bananas"],
    education_level: "Primary",
    status: "Active",
    registered_on: new Date("2021-04-10"),
    notes: "Reliable repayer; attended 3 extension training sessions in 2024."
  },
  {
    _id: ObjectId("665f000000000000000000a2"),
    full_name: "Ssemakula John",
    national_id: "CM8019876522011",
    phone: "+256701234567",
    gender: "Male",
    date_of_birth: new Date("1972-11-02"),
    village: "Bombo",
    sub_county: "Bombo",
    district: "Luweero",
    cooperative: {
      name: "Luweero Dairy Farmers Association",
      membership_number: "LDFA-2015-009",
      joined_date: new Date("2015-01-15"),
      role: "Treasurer"
    },
    household_size: 8,
    primary_activities: ["cattle", "maize"],
    education_level: "Secondary",
    status: "Active",
    registered_on: new Date("2020-09-05"),
    notes: "Owns 12 cattle; key contact for the cattle corridor zone."
  },
  {
    _id: ObjectId("665f000000000000000000a3"),
    full_name: "Namukasa Fatuma",
    national_id: "CF9520034561007",
    phone: "+256789654321",
    gender: "Female",
    date_of_birth: new Date("1991-07-25"),
    village: "Zirobwe",
    sub_county: "Zirobwe",
    district: "Luweero",
    cooperative: null,
    household_size: 4,
    primary_activities: ["cocoa", "vegetables"],
    education_level: "Vocational",
    status: "Active",
    registered_on: new Date("2022-02-18"),
    notes: "Interested in joining cooperative; cocoa seedling programme beneficiary."
  },
  {
    _id: ObjectId("665f000000000000000000a4"),
    full_name: "Kiggundu Robert",
    national_id: "CM7819965012098",
    phone: "+256756789012",
    gender: "Male",
    date_of_birth: new Date("1978-05-30"),
    village: "Wobulenzi",
    sub_county: "Wobulenzi",
    district: "Luweero",
    cooperative: {
      name: "Wobulenzi Coffee Growers Society",
      membership_number: "WCG-2019-022",
      joined_date: new Date("2019-03-20"),
      role: "Chairperson"
    },
    household_size: 5,
    primary_activities: ["coffee", "cocoa", "poultry"],
    education_level: "Tertiary",
    status: "Active",
    registered_on: new Date("2019-04-01"),
    notes: "Community leader; promotes climate-smart agriculture practices."
  },
  {
    _id: ObjectId("665f000000000000000000a5"),
    full_name: "Namutebi Sarah",
    national_id: "CF9320015673002",
    phone: "+256712345098",
    gender: "Female",
    date_of_birth: new Date("1993-09-12"),
    village: "Luwero Town",
    sub_county: "Luwero",
    district: "Luweero",
    cooperative: {
      name: "Kiwoko Farmers' Cooperative",
      membership_number: "KFC-2022-075",
      joined_date: new Date("2022-07-10"),
      role: "Member"
    },
    household_size: 3,
    primary_activities: ["matooke", "beans"],
    education_level: "Secondary",
    status: "Active",
    registered_on: new Date("2022-07-15"),
    notes: "Young farmer; received start-up grant from district agriculture office."
  },
  {
    _id: ObjectId("665f000000000000000000a6"),
    full_name: "Musoke David",
    national_id: "CM6820197811023",
    phone: "+256782233445",
    gender: "Male",
    date_of_birth: new Date("1968-01-08"),
    village: "Bamunanika",
    sub_county: "Bamunanika",
    district: "Luweero",
    cooperative: {
      name: "Luweero Dairy Farmers Association",
      membership_number: "LDFA-2012-003",
      joined_date: new Date("2012-04-01"),
      role: "Vice-Chairperson"
    },
    household_size: 10,
    primary_activities: ["cattle", "coffee", "maize"],
    education_level: "Secondary",
    status: "Active",
    registered_on: new Date("2019-11-22"),
    notes: "Veteran farmer; mentors younger members of the dairy association."
  }
]);

print("✅  Inserted " + db.farmers.countDocuments() + " farmer documents.");

// =============================================================================
// 2. FARMS (PLOTS) COLLECTION
//    Stores land units with tenure, geospatial coordinates, soil notes,
//    and a reference back to the owning farmer.
// =============================================================================
db.farms.insertMany([
  {
    _id: ObjectId("665f000000000000000000b1"),
    farm_name: "Nakato Main Plot",
    farmer_id: ObjectId("665f000000000000000000a1"),
    farmer_name: "Nakato Grace",   // denormalised for quick reads
    size_acres: 3.5,
    tenure_type: "Bibanja",        // customary occupancy
    village: "Kiwoko",
    sub_county: "Kiwoko",
    district: "Luweero",
    location: {                    // GeoJSON Point (lon, lat)
      type: "Point",
      coordinates: [32.5643, 0.6312]
    },
    soil_type: "Loamy",
    soil_ph: 6.2,
    water_source: "Seasonal stream",
    irrigation: false,
    current_crops: ["Robusta Coffee", "Matooke"],
    registered_on: new Date("2021-04-12"),
    status: "Active",
    notes: "Slight slope; erosion-control terraces needed on eastern boundary."
  },
  {
    _id: ObjectId("665f000000000000000000b2"),
    farm_name: "Ssemakula Cattle Ranch",
    farmer_id: ObjectId("665f000000000000000000a2"),
    farmer_name: "Ssemakula John",
    size_acres: 22.0,
    tenure_type: "Freehold",
    village: "Bombo",
    sub_county: "Bombo",
    district: "Luweero",
    location: {
      type: "Point",
      coordinates: [32.5310, 0.5831]
    },
    soil_type: "Clay-Loam",
    soil_ph: 6.8,
    water_source: "Borehole",
    irrigation: true,
    current_crops: ["Maize", "Napier Grass"],
    current_livestock: ["Holstein-Friesian Cattle"],
    registered_on: new Date("2020-09-10"),
    status: "Active",
    notes: "Pasture rotated every 6 weeks; veterinary dip tank on site."
  },
  {
    _id: ObjectId("665f000000000000000000b3"),
    farm_name: "Namukasa Cocoa Garden",
    farmer_id: ObjectId("665f000000000000000000a3"),
    farmer_name: "Namukasa Fatuma",
    size_acres: 2.0,
    tenure_type: "Mailo",
    village: "Zirobwe",
    sub_county: "Zirobwe",
    district: "Luweero",
    location: {
      type: "Point",
      coordinates: [32.6101, 0.6789]
    },
    soil_type: "Sandy-Loam",
    soil_ph: 5.9,
    water_source: "Rainwater",
    irrigation: false,
    current_crops: ["Cocoa", "Tomatoes", "Kale"],
    registered_on: new Date("2022-03-01"),
    status: "Active",
    notes: "Shade trees (Musizi) planted between cocoa rows to reduce heat stress."
  },
  {
    _id: ObjectId("665f000000000000000000b4"),
    farm_name: "Kiggundu Coffee & Poultry Farm",
    farmer_id: ObjectId("665f000000000000000000a4"),
    farmer_name: "Kiggundu Robert",
    size_acres: 8.0,
    tenure_type: "Freehold",
    village: "Wobulenzi",
    sub_county: "Wobulenzi",
    district: "Luweero",
    location: {
      type: "Point",
      coordinates: [32.6430, 0.7215]
    },
    soil_type: "Loamy",
    soil_ph: 6.5,
    water_source: "Gravity-fed pipe",
    irrigation: true,
    current_crops: ["Robusta Coffee", "Cocoa"],
    current_livestock: ["Broiler Chickens", "Layers"],
    registered_on: new Date("2019-04-05"),
    status: "Active",
    notes: "Drip irrigation installed in 2023 with NAADS grant support."
  },
  {
    _id: ObjectId("665f000000000000000000b5"),
    farm_name: "Namutebi Banana Garden",
    farmer_id: ObjectId("665f000000000000000000a5"),
    farmer_name: "Namutebi Sarah",
    size_acres: 1.5,
    tenure_type: "Bibanja",
    village: "Luwero Town",
    sub_county: "Luwero",
    district: "Luweero",
    location: {
      type: "Point",
      coordinates: [32.4893, 0.8471]
    },
    soil_type: "Loamy",
    soil_ph: 6.0,
    water_source: "Rainwater",
    irrigation: false,
    current_crops: ["Matooke (NARITA 17)", "Beans"],
    registered_on: new Date("2022-07-20"),
    status: "Active",
    notes: "Enrolled in Banana Wilt Management Programme (2024)."
  },
  {
    _id: ObjectId("665f000000000000000000b6"),
    farm_name: "Musoke Mixed Farm",
    farmer_id: ObjectId("665f000000000000000000a6"),
    farmer_name: "Musoke David",
    size_acres: 15.0,
    tenure_type: "Mailo",
    village: "Bamunanika",
    sub_county: "Bamunanika",
    district: "Luweero",
    location: {
      type: "Point",
      coordinates: [32.5780, 0.9210]
    },
    soil_type: "Red Laterite",
    soil_ph: 5.8,
    water_source: "Valley dam",
    irrigation: false,
    current_crops: ["Robusta Coffee", "Maize", "Sweet Potatoes"],
    current_livestock: ["Ankole Cattle", "Goats"],
    registered_on: new Date("2019-12-01"),
    status: "Active",
    notes: "Participates in NARO on-farm trials for improved coffee varieties."
  }
]);

// Create a 2dsphere index to support geospatial queries on plot locations
db.farms.createIndex({ location: "2dsphere" });

print("✅  Inserted " + db.farms.countDocuments() + " farm documents.");

// =============================================================================
// 3. CROP / LIVESTOCK RECORDS COLLECTION
//    Detailed production records, with nested harvest events and treatments.
//    Linked to a farm and farmer via foreign-key-style references.
// =============================================================================
db.crop_livestock.insertMany([
  {
    _id: ObjectId("665f000000000000000000c1"),
    farm_id: ObjectId("665f000000000000000000b1"),
    farmer_id: ObjectId("665f000000000000000000a1"),
    record_type: "Crop",
    crop_name: "Robusta Coffee",
    variety: "CRI-42",
    planting_date: new Date("2020-03-15"),
    area_planted_acres: 2.0,
    plant_population: 480,
    season: "Long Rains 2020",
    harvests: [
      {
        harvest_id: "HV-C1-001",
        harvest_date: new Date("2021-11-20"),
        quantity_kg: 520,
        grade: "FAQ (Fair Average Quality)",
        moisture_content_pct: 12.5,
        post_harvest_losses_kg: 35,
        loss_reason: "Poor drying due to prolonged rains",
        storage_method: "Raised platform store"
      },
      {
        harvest_id: "HV-C1-002",
        harvest_date: new Date("2022-11-18"),
        quantity_kg: 610,
        grade: "Screen 15",
        moisture_content_pct: 11.8,
        post_harvest_losses_kg: 20,
        loss_reason: "Rodent damage in store",
        storage_method: "Metal silo"
      },
      {
        harvest_id: "HV-C1-003",
        harvest_date: new Date("2023-12-05"),
        quantity_kg: 680,
        grade: "Screen 15",
        moisture_content_pct: 11.2,
        post_harvest_losses_kg: 10,
        loss_reason: null,
        storage_method: "Metal silo"
      }
    ],
    treatments: [
      { date: new Date("2021-06-10"), type: "Fungicide", product: "Ridomil Gold", dose_per_tree: "2g" },
      { date: new Date("2022-05-14"), type: "Fertiliser", product: "CAN", dose_kg_per_acre: 50 }
    ],
    status: "Productive",
    notes: "Shade management done annually; target 800 kg by 2025 season."
  },
  {
    _id: ObjectId("665f000000000000000000c2"),
    farm_id: ObjectId("665f000000000000000000b2"),
    farmer_id: ObjectId("665f000000000000000000a2"),
    record_type: "Livestock",
    animal_type: "Cattle",
    breed: "Holstein-Friesian",
    herd_size: 12,
    acquisition_date: new Date("2015-06-01"),
    purpose: ["Dairy", "Beef"],
    season: "Year-round",
    harvests: [
      {
        harvest_id: "HV-C2-001",
        period: "Q1 2024 (Jan–Mar)",
        average_daily_yield_litres_per_cow: 14,
        total_milk_litres: 15120,
        losses_litres: 450,
        loss_reason: "Mastitis outbreak (3 cows affected)",
        sales_litres: 14000,
        home_consumption_litres: 670
      },
      {
        harvest_id: "HV-C2-002",
        period: "Q2 2024 (Apr–Jun)",
        average_daily_yield_litres_per_cow: 13,
        total_milk_litres: 14040,
        losses_litres: 200,
        loss_reason: "Spoilage – power outage at cooling plant",
        sales_litres: 13500,
        home_consumption_litres: 340
      }
    ],
    treatments: [
      { date: new Date("2024-01-15"), type: "Vaccination", product: "FMD Vaccine", vet_officer: "Dr. Nantume Agnes" },
      { date: new Date("2024-02-10"), type: "Deworming",   product: "Albendazole",  dose: "10ml per head" },
      { date: new Date("2024-04-05"), type: "Acaricide dipping", product: "Triatix", frequency: "Fortnightly" }
    ],
    status: "Active",
    notes: "Cooling tank shared with 3 neighbouring farmers under LDFA arrangement."
  },
  {
    _id: ObjectId("665f000000000000000000c3"),
    farm_id: ObjectId("665f000000000000000000b3"),
    farmer_id: ObjectId("665f000000000000000000a3"),
    record_type: "Crop",
    crop_name: "Cocoa",
    variety: "Upper Amazon Hybrid",
    planting_date: new Date("2022-04-20"),
    area_planted_acres: 1.5,
    plant_population: 375,
    season: "Long Rains 2022",
    harvests: [
      {
        harvest_id: "HV-C3-001",
        harvest_date: new Date("2024-02-15"),
        quantity_kg: 280,
        grade: "Grade 1 Dry Beans",
        moisture_content_pct: 7.5,
        post_harvest_losses_kg: 18,
        loss_reason: "Black pod disease during wet pods phase",
        storage_method: "Jute sacks in dry store"
      }
    ],
    treatments: [
      { date: new Date("2023-10-01"), type: "Fungicide", product: "Copper Oxychloride", dose_per_tree: "3g dissolved in 1L" },
      { date: new Date("2024-01-08"), type: "Pruning",   product: null, notes: "Ghost-pod removal + canopy thinning" }
    ],
    status: "Establishing",
    notes: "Trees expected to reach full bearing (1,000 kg/acre) by 2026 season."
  },
  {
    _id: ObjectId("665f000000000000000000c4"),
    farm_id: ObjectId("665f000000000000000000b4"),
    farmer_id: ObjectId("665f000000000000000000a4"),
    record_type: "Livestock",
    animal_type: "Poultry",
    breed: "Ross 308 Broilers",
    flock_size: 800,
    acquisition_date: new Date("2024-01-10"),
    purpose: ["Meat"],
    season: "Cycle 1 – 2024",
    harvests: [
      {
        harvest_id: "HV-C4-001",
        harvest_date: new Date("2024-03-05"),
        birds_slaughtered: 780,
        average_weight_kg: 2.4,
        total_meat_kg: 1872,
        losses_birds: 20,
        loss_reason: "Newcastle disease (week 3)",
        price_per_kg_ugx: 9500
      }
    ],
    treatments: [
      { date: new Date("2024-01-12"), type: "Vaccination", product: "Newcastle Lasota", method: "Eye drop" },
      { date: new Date("2024-01-20"), type: "Vaccination", product: "Gumboro IBD",      method: "Drinking water" },
      { date: new Date("2024-02-01"), type: "Antibiotic",  product: "Oxytetracycline",  reason: "Respiratory infection prophylaxis" }
    ],
    status: "Completed",
    notes: "Cycle 2 planned for April 2024 with improved biosecurity measures."
  },
  {
    _id: ObjectId("665f000000000000000000c5"),
    farm_id: ObjectId("665f000000000000000000b5"),
    farmer_id: ObjectId("665f000000000000000000a5"),
    record_type: "Crop",
    crop_name: "Matooke (Cooking Banana)",
    variety: "NARITA 17",
    planting_date: new Date("2022-09-01"),
    area_planted_acres: 1.0,
    plant_population: 200,
    season: "Short Rains 2022",
    harvests: [
      {
        harvest_id: "HV-C5-001",
        harvest_date: new Date("2023-06-15"),
        quantity_bunches: 160,
        average_bunch_weight_kg: 18,
        total_kg: 2880,
        post_harvest_losses_kg: 120,
        loss_reason: "Delayed transport to market; over-ripening",
        storage_method: "On-farm hanging"
      },
      {
        harvest_id: "HV-C5-002",
        harvest_date: new Date("2024-01-10"),
        quantity_bunches: 175,
        average_bunch_weight_kg: 19,
        total_kg: 3325,
        post_harvest_losses_kg: 60,
        loss_reason: "Minor Fusarium wilt on 4 mats",
        storage_method: "On-farm hanging"
      }
    ],
    treatments: [
      { date: new Date("2023-03-20"), type: "De-leafing",        product: null, notes: "Removal of diseased leaves" },
      { date: new Date("2023-08-15"), type: "Fertiliser",        product: "NPK 17:17:17", dose_kg_per_acre: 60 },
      { date: new Date("2024-01-02"), type: "Wilt management",   product: "Tissue-culture replacement", mats_replaced: 4 }
    ],
    status: "Productive",
    notes: "Participates in Banana Wilt Management Programme; NAITA extension support."
  },
  {
    _id: ObjectId("665f000000000000000000c6"),
    farm_id: ObjectId("665f000000000000000000b6"),
    farmer_id: ObjectId("665f000000000000000000a6"),
    record_type: "Livestock",
    animal_type: "Cattle",
    breed: "Ankole",
    herd_size: 25,
    acquisition_date: new Date("2005-01-01"),
    purpose: ["Beef", "Hides", "Cultural value"],
    season: "Year-round",
    harvests: [
      {
        harvest_id: "HV-C6-001",
        period: "2023 Annual Offtake",
        animals_sold: 5,
        average_live_weight_kg: 280,
        total_meat_estimated_kg: 700,
        price_per_head_ugx: 1800000,
        total_revenue_ugx: 9000000
      },
      {
        harvest_id: "HV-C6-002",
        period: "2024 Annual Offtake",
        animals_sold: 6,
        average_live_weight_kg: 290,
        total_meat_estimated_kg: 870,
        price_per_head_ugx: 2000000,
        total_revenue_ugx: 12000000
      }
    ],
    treatments: [
      { date: new Date("2024-02-20"), type: "Vaccination",     product: "Anthrax vaccine",   administered_by: "DLVO Luweero" },
      { date: new Date("2024-03-10"), type: "Tick control",    product: "Amitraz pour-on",   frequency: "Monthly" }
    ],
    status: "Active",
    notes: "Herd enrolled in NARO Ankole cattle genetic conservation programme."
  }
]);

print("✅  Inserted " + db.crop_livestock.countDocuments() + " crop/livestock documents.");

// =============================================================================
// 4. MARKET TRANSACTIONS COLLECTION
//    Sales and collection events – buyer, produce, quantity, price, status.
// =============================================================================
db.market_transactions.insertMany([
  {
    _id: ObjectId("665f000000000000000000d1"),
    transaction_date: new Date("2023-12-10"),
    farmer_id: ObjectId("665f000000000000000000a1"),
    farmer_name: "Nakato Grace",
    farm_id: ObjectId("665f000000000000000000b1"),
    produce_type: "Robusta Coffee (Kiboko)",
    quantity_kg: 600,
    unit_price_ugx: 4800,
    total_amount_ugx: 2880000,
    buyer: {
      name: "Kiwoko Farmers' Cooperative",
      type: "Cooperative",
      contact: "+256414765432",
      location: "Kiwoko Town"
    },
    market_channel: "Cooperative bulking centre",
    payment_method: "Mobile Money (MTN MoMo)",
    payment_status: "Paid",
    payment_date: new Date("2023-12-15"),
    transport_cost_ugx: 120000,
    net_revenue_ugx: 2760000,
    season: "Main Crop 2023",
    notes: "Price negotiated at cooperative level; above Kampala open market price by 3%."
  },
  {
    _id: ObjectId("665f000000000000000000d2"),
    transaction_date: new Date("2024-03-08"),
    farmer_id: ObjectId("665f000000000000000000a2"),
    farmer_name: "Ssemakula John",
    farm_id: ObjectId("665f000000000000000000b2"),
    produce_type: "Raw Milk",
    quantity_litres: 13500,
    unit_price_ugx: 1200,
    total_amount_ugx: 16200000,
    buyer: {
      name: "Pearl Dairy Limited",
      type: "Processor",
      contact: "+256414789000",
      location: "Luwero Town"
    },
    market_channel: "Milk collection truck",
    payment_method: "Bank Transfer",
    payment_status: "Paid",
    payment_date: new Date("2024-03-15"),
    transport_cost_ugx: 0,
    net_revenue_ugx: 16200000,
    season: "Q1 2024",
    notes: "Milk chilled at on-farm cooling tank before collection. Quality grade: Grade A."
  },
  {
    _id: ObjectId("665f000000000000000000d3"),
    transaction_date: new Date("2024-02-20"),
    farmer_id: ObjectId("665f000000000000000000a3"),
    farmer_name: "Namukasa Fatuma",
    farm_id: ObjectId("665f000000000000000000b3"),
    produce_type: "Dry Cocoa Beans",
    quantity_kg: 260,
    unit_price_ugx: 9500,
    total_amount_ugx: 2470000,
    buyer: {
      name: "Nakasero Cocoa Exporters Ltd",
      type: "Exporter",
      contact: "+256414560900",
      location: "Kampala"
    },
    market_channel: "Trader / Middleman",
    payment_method: "Cash",
    payment_status: "Paid",
    payment_date: new Date("2024-02-20"),
    transport_cost_ugx: 85000,
    net_revenue_ugx: 2385000,
    season: "Short Season 2023–24",
    notes: "Farmer advised to sell directly through cooperative next cycle to avoid middleman margin."
  },
  {
    _id: ObjectId("665f000000000000000000d4"),
    transaction_date: new Date("2024-03-06"),
    farmer_id: ObjectId("665f000000000000000000a4"),
    farmer_name: "Kiggundu Robert",
    farm_id: ObjectId("665f000000000000000000b4"),
    produce_type: "Broiler Chicken (Live weight)",
    quantity_kg: 1872,
    unit_price_ugx: 9500,
    total_amount_ugx: 17784000,
    buyer: {
      name: "Wobulenzi Open Air Market – Wholesale Buyers",
      type: "Wholesale",
      contact: null,
      location: "Wobulenzi Market"
    },
    market_channel: "Wholesale market",
    payment_method: "Cash",
    payment_status: "Paid",
    payment_date: new Date("2024-03-06"),
    transport_cost_ugx: 200000,
    net_revenue_ugx: 17584000,
    season: "Cycle 1 – 2024",
    notes: "Birds sold at 49 days; reached target weight. Feed cost was UGX 9,400,000."
  },
  {
    _id: ObjectId("665f000000000000000000d5"),
    transaction_date: new Date("2024-01-15"),
    farmer_id: ObjectId("665f000000000000000000a5"),
    farmer_name: "Namutebi Sarah",
    farm_id: ObjectId("665f000000000000000000b5"),
    produce_type: "Matooke Bunches",
    quantity_bunches: 150,
    unit_price_ugx: 25000,
    total_amount_ugx: 3750000,
    buyer: {
      name: "Luwero Town Market – Retail Traders",
      type: "Retail",
      contact: null,
      location: "Luwero Town Market"
    },
    market_channel: "Local market",
    payment_method: "Cash",
    payment_status: "Paid",
    payment_date: new Date("2024-01-15"),
    transport_cost_ugx: 75000,
    net_revenue_ugx: 3675000,
    season: "Short Season 2023–24",
    notes: "25 bunches retained for home consumption and local barter."
  },
  {
    _id: ObjectId("665f000000000000000000d6"),
    transaction_date: new Date("2024-04-01"),
    farmer_id: ObjectId("665f000000000000000000a6"),
    farmer_name: "Musoke David",
    farm_id: ObjectId("665f000000000000000000b6"),
    produce_type: "Ankole Cattle (Beef)",
    quantity_heads: 6,
    unit_price_ugx: 2000000,
    total_amount_ugx: 12000000,
    buyer: {
      name: "Kampala City Abattoir Traders",
      type: "Abattoir / Wholesale",
      contact: "+256704321987",
      location: "Kampala"
    },
    market_channel: "Direct buyer (phone negotiation)",
    payment_method: "Bank Transfer",
    payment_status: "Paid",
    payment_date: new Date("2024-04-05"),
    transport_cost_ugx: 350000,
    net_revenue_ugx: 11650000,
    season: "2024 Dry Season Offtake",
    notes: "Buyer negotiated price during March 2024 cattle corridor market day."
  },
  {
    _id: ObjectId("665f000000000000000000d7"),
    transaction_date: new Date("2024-05-10"),
    farmer_id: ObjectId("665f000000000000000000a1"),
    farmer_name: "Nakato Grace",
    farm_id: ObjectId("665f000000000000000000b1"),
    produce_type: "Matooke Bunches",
    quantity_bunches: 80,
    unit_price_ugx: 22000,
    total_amount_ugx: 1760000,
    buyer: {
      name: "Kiwoko Town Market – Retail Traders",
      type: "Retail",
      contact: null,
      location: "Kiwoko Town"
    },
    market_channel: "Local market",
    payment_method: "Cash",
    payment_status: "Partial",
    payment_date: null,
    amount_received_ugx: 880000,
    balance_due_ugx: 880000,
    transport_cost_ugx: 40000,
    net_revenue_ugx: 840000,
    season: "Long Rains 2024",
    notes: "Buyer promised balance payment within 2 weeks. Follow-up needed."
  }
]);

print("✅  Inserted " + db.market_transactions.countDocuments() + " market transaction documents.");

// =============================================================================
// 5. EXTENSION VISITS COLLECTION
//    Advisory interactions from extension officers, NGOs, or cooperative
//    technicians, linked to farmers and/or farms.
// =============================================================================
db.extension_visits.insertMany([
  {
    _id: ObjectId("665f000000000000000000e1"),
    visit_date: new Date("2024-01-22"),
    farmer_id: ObjectId("665f000000000000000000a1"),
    farm_id: ObjectId("665f000000000000000000b1"),
    officer: {
      name: "Byamukama Peter",
      title: "Agricultural Extension Officer",
      organisation: "Luweero District Production Department",
      phone: "+256773456789"
    },
    visit_type: "Field Visit",
    topics_covered: [
      "Coffee berry disease (CBD) management",
      "Post-harvest drying techniques",
      "Record-keeping using farm diary"
    ],
    advice_given: "Farmer advised to apply copper-based fungicide at first rains (March) and maintain clean drying tables. Recommended joining NAADS demonstration plot visits in Kiwoko.",
    recommendations: [
      { action: "Apply Ridomil Gold before long rains", deadline: new Date("2024-03-01"), status: "Pending" },
      { action: "Attend NAADS demo at Kiwoko Sub-county", deadline: new Date("2024-02-15"), status: "Completed" }
    ],
    inputs_provided: [
      { item: "Copper oxychloride (1 kg)", cost_ugx: 0, source: "Government subsidy" }
    ],
    follow_up_date: new Date("2024-04-15"),
    follow_up_completed: false,
    status: "Follow-up pending",
    notes: "Farmer showed good adoption of raised platform drying; CBD pressure moderate this season."
  },
  {
    _id: ObjectId("665f000000000000000000e2"),
    visit_date: new Date("2024-01-18"),
    farmer_id: ObjectId("665f000000000000000000a2"),
    farm_id: ObjectId("665f000000000000000000b2"),
    officer: {
      name: "Dr. Nantume Agnes",
      title: "District Veterinary Officer",
      organisation: "Luweero DLVO (District Livestock/Veterinary Office)",
      phone: "+256756123456"
    },
    visit_type: "Veterinary Field Visit",
    topics_covered: [
      "FMD vaccination campaign",
      "Mastitis prevention (teat dipping, milking hygiene)",
      "Feed ration formulation for lactating cows"
    ],
    advice_given: "Herd vaccinated against FMD. Farmer educated on pre-milking teat dipping with iodine solution to reduce mastitis incidence. Recommended improving calf pen drainage.",
    recommendations: [
      { action: "Install iodine dip cup at milking parlour", deadline: new Date("2024-02-01"), status: "Completed" },
      { action: "Improve calf pen drainage", deadline: new Date("2024-03-01"), status: "In Progress" }
    ],
    inputs_provided: [
      { item: "FMD Vaccine (12 doses)",          cost_ugx: 0,     source: "Government campaign" },
      { item: "Iodine dip solution (2 litres)",   cost_ugx: 45000, source: "Farmer purchased" }
    ],
    follow_up_date: new Date("2024-04-20"),
    follow_up_completed: false,
    status: "Follow-up pending",
    notes: "Mastitis cases in Q1 dropped to 1 after intervention (from 3 in Q4 2023)."
  },
  {
    _id: ObjectId("665f000000000000000000e3"),
    visit_date: new Date("2024-02-05"),
    farmer_id: ObjectId("665f000000000000000000a3"),
    farm_id: ObjectId("665f000000000000000000b3"),
    officer: {
      name: "Nambi Christine",
      title: "Cocoa Field Officer",
      organisation: "Uganda Cocoa Authority – Luweero Zone",
      phone: "+256712678901"
    },
    visit_type: "Crop Advisory Visit",
    topics_covered: [
      "Black pod disease (Phytophthora) identification and management",
      "Cocoa pod borer trapping",
      "Shade tree management (Musizi spacing)",
      "Fermentation and drying quality standards"
    ],
    advice_given: "Advised on correct fungicide dilution (3g copper oxychloride per litre). Demonstrated correct pod-splitting for fermentation. Encouraged formation of farmer group for collective bulking.",
    recommendations: [
      { action: "Form a local cocoa farmer group with 5+ neighbours", deadline: new Date("2024-04-01"), status: "In Progress" },
      { action: "Build a fermentation box (60cm × 40cm × 30cm hardwood)", deadline: new Date("2024-03-15"), status: "Pending" }
    ],
    inputs_provided: [
      { item: "Pheromone trap for cocoa pod borer (2 units)", cost_ugx: 0, source: "UCA subsidy" }
    ],
    follow_up_date: new Date("2024-05-01"),
    follow_up_completed: false,
    status: "Follow-up pending",
    notes: "First harvest quality acceptable; fermentation score 6/7 in lab test. Good potential."
  },
  {
    _id: ObjectId("665f000000000000000000e4"),
    visit_date: new Date("2024-02-28"),
    farmer_id: ObjectId("665f000000000000000000a4"),
    farm_id: ObjectId("665f000000000000000000b4"),
    officer: {
      name: "Mugisha Emmanuel",
      title: "Poultry Specialist",
      organisation: "Makerere University Agricultural Research Institute (MUARIK)",
      phone: "+256701987654"
    },
    visit_type: "Research / Training Visit",
    topics_covered: [
      "Broiler biosecurity protocols",
      "Feed conversion ratio improvement",
      "Newcastle disease outbreak response",
      "Record-keeping for enterprise budgeting"
    ],
    advice_given: "Recommended all-in-all-out restocking system. Advised disinfection protocol between cycles (7-day rest). Helped farmer construct simple enterprise budget showing UGX 8.3M profit on 800-bird cycle.",
    recommendations: [
      { action: "Observe 7-day house rest between cycles", deadline: new Date("2024-04-01"), status: "Completed" },
      { action: "Install footbath at house entrance",        deadline: new Date("2024-03-15"), status: "Completed" },
      { action: "Maintain weekly flock weight records",      deadline: new Date("2024-12-31"), status: "In Progress" }
    ],
    inputs_provided: [],
    follow_up_date: new Date("2024-07-01"),
    follow_up_completed: false,
    status: "Follow-up pending",
    notes: "Farmer showed strong entrepreneurial aptitude. Potential case study for MUARIK outreach programme."
  },
  {
    _id: ObjectId("665f000000000000000000e5"),
    visit_date: new Date("2024-01-30"),
    farmer_id: ObjectId("665f000000000000000000a5"),
    farm_id: ObjectId("665f000000000000000000b5"),
    officer: {
      name: "Nalubega Dorothy",
      title: "Banana Wilt Management Programme Coordinator",
      organisation: "Bioversity International / NARO Uganda",
      phone: "+256782334455"
    },
    visit_type: "Disease Management Visit",
    topics_covered: [
      "Xanthomonas Wilt (BXW) symptoms and spread",
      "De-budding technique (remove male bud at emergence)",
      "Tissue-culture planting material benefits",
      "Buffer zone maintenance between infected and clean mats"
    ],
    advice_given: "Confirmed BXW presence on 4 mats; supervised farmer in uprooting and burying infected plants. Demonstrated de-budding with sterilised knife. Provided TC replacement plants. Advised separating tools for clean/infected zones.",
    recommendations: [
      { action: "De-bud all remaining mats within 2 weeks",    deadline: new Date("2024-02-13"), status: "Completed" },
      { action: "Sterilise cutting tools between mats",         deadline: new Date("2024-02-01"), status: "Completed" },
      { action: "Monitor new suckers for wilt symptoms monthly", deadline: new Date("2024-12-31"), status: "In Progress" }
    ],
    inputs_provided: [
      { item: "TC Matooke plantlets – NARITA 17 (10 mats)", cost_ugx: 0, source: "BXW Programme grant" }
    ],
    follow_up_date: new Date("2024-04-30"),
    follow_up_completed: false,
    status: "Follow-up pending",
    notes: "Zero new BXW cases reported in February 2024 monitoring round. Good early response by farmer."
  },
  {
    _id: ObjectId("665f000000000000000000e6"),
    visit_date: new Date("2024-03-15"),
    farmer_id: ObjectId("665f000000000000000000a6"),
    farm_id: ObjectId("665f000000000000000000b6"),
    officer: {
      name: "Byamukama Peter",
      title: "Agricultural Extension Officer",
      organisation: "Luweero District Production Department",
      phone: "+256773456789"
    },
    visit_type: "Group Training / Field Day",
    topics_covered: [
      "Soil conservation and agroforestry for Ankole cattle corridors",
      "Improved pasture species (Brachiaria, Desmodium)",
      "Climate adaptation: water harvesting and fodder conservation",
      "Credit access via SACCO linkage"
    ],
    advice_given: "Musoke introduced to Luweero SACCO for agricultural credit to fence and subdivide pastures. Recommended Brachiaria hybrid grass to replace degraded Napier. Demonstrated valley dam desilting procedure.",
    recommendations: [
      { action: "Apply for SACCO pasture-improvement loan",    deadline: new Date("2024-06-01"), status: "Pending" },
      { action: "Plant Brachiaria on 3 acres of degraded land", deadline: new Date("2024-05-01"), status: "In Progress" },
      { action: "Desilt valley dam before October rains",       deadline: new Date("2024-09-30"), status: "Pending" }
    ],
    inputs_provided: [
      { item: "Brachiaria hybrid grass splits (50 kg)", cost_ugx: 0, source: "District demo programme" }
    ],
    follow_up_date: new Date("2024-07-15"),
    follow_up_completed: false,
    status: "Follow-up pending",
    notes: "Farmer David is a community mobiliser; training attended by 8 other Bamunanika farmers."
  }
]);

print("✅  Inserted " + db.extension_visits.countDocuments() + " extension visit documents.");

// =============================================================================
// INDEXES – for common queries
// =============================================================================
db.farmers.createIndex({ phone: 1 }, { unique: true });
db.farmers.createIndex({ "cooperative.name": 1 });
db.farmers.createIndex({ village: 1 });

db.farms.createIndex({ farmer_id: 1 });
db.farms.createIndex({ district: 1, sub_county: 1 });
// 2dsphere index already created above

db.crop_livestock.createIndex({ farm_id: 1 });
db.crop_livestock.createIndex({ farmer_id: 1 });
db.crop_livestock.createIndex({ record_type: 1, crop_name: 1 });

db.market_transactions.createIndex({ farmer_id: 1 });
db.market_transactions.createIndex({ transaction_date: -1 });
db.market_transactions.createIndex({ payment_status: 1 });

db.extension_visits.createIndex({ farmer_id: 1 });
db.extension_visits.createIndex({ visit_date: -1 });
db.extension_visits.createIndex({ "officer.organisation": 1 });

print("\n🎉  Luweero Agricultural DB fully seeded!");
print("📦  Collections summary:");
print("    farmers             : " + db.farmers.countDocuments());
print("    farms               : " + db.farms.countDocuments());
print("    crop_livestock      : " + db.crop_livestock.countDocuments());
print("    market_transactions : " + db.market_transactions.countDocuments());
print("    extension_visits    : " + db.extension_visits.countDocuments());
