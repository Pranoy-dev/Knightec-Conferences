/**
 * Populate conferences from a JSON file (append only; does not delete existing).
 * - office_id: derived from location (first part before comma matched to office name).
 * - price/currency: not filled from JSON; uses price=0, currency=SEK.
 * - assigned_to, status, reason_to_go: left null.
 * - Categories that don't exist are created in the backend and listed in the output.
 *
 * Usage: node scripts/populate-events-from-json.js [path-to-file.json]
 * Default file: scripts/events-to-import.json
 */

require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

function get(obj, ...keys) {
  if (obj == null || typeof obj !== "object") return null;
  const lower = (k) => String(k).toLowerCase();
  for (const key of keys) {
    const found = Object.keys(obj).find((k) => lower(k) === lower(key));
    if (found !== undefined) {
      const v = obj[found];
      return v === "" || v === undefined ? null : v;
    }
  }
  return null;
}

/** Get city from location string (e.g. "Stockholm, Sweden" -> "Stockholm", " Stockholm" -> "Stockholm") */
function cityFromLocation(location) {
  if (!location || typeof location !== "string") return null;
  const trimmed = location.trim();
  const part = trimmed.split(",")[0];
  return part ? part.trim() : trimmed;
}

/** Normalize for matching: lowercase, optional accents folded */
function normalizeName(s) {
  if (!s || typeof s !== "string") return "";
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\u0300-\u036f/g, "");
}

async function main() {
  const jsonPath = process.argv[2] || path.join(__dirname, "events-to-import.json");
  const resolved = path.resolve(process.cwd(), jsonPath);
  if (!fs.existsSync(resolved)) {
    console.error("File not found:", resolved);
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  let raw;
  try {
    raw = fs.readFileSync(resolved, "utf-8");
  } catch (e) {
    console.error("Could not read file:", e.message);
    process.exit(1);
  }

  let items;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      items = parsed;
    } else if (parsed && Array.isArray(parsed.conferences)) {
      items = parsed.conferences;
    } else if (parsed && Array.isArray(parsed.events)) {
      items = parsed.events;
    } else if (parsed && Array.isArray(parsed.data)) {
      items = parsed.data;
    } else {
      console.error("JSON must be an array or an object with 'conferences', 'events', or 'data' array.");
      process.exit(1);
    }
  } catch (e) {
    console.error("Invalid JSON:", e.message);
    process.exit(1);
  }

  if (items.length === 0) {
    console.error("No items in JSON array.");
    process.exit(1);
  }

  const { data: offices } = await supabase.from("offices").select("id, name");
  const { data: existingCategories } = await supabase.from("categories").select("id, name");
  const officeByName = new Map((offices || []).map((o) => [normalizeName(o.name), o.id]));
  const categoryNamesSet = new Set((existingCategories || []).map((c) => normalizeName(c.name)));

  const uniqueCategories = [...new Set(items.map((obj) => get(obj, "category")).filter(Boolean).map(String))];
  const addedCategories = [];

  for (const catName of uniqueCategories) {
    const norm = normalizeName(catName);
    if (!categoryNamesSet.has(norm)) {
      const { data: inserted, error } = await supabase.from("categories").insert({ name: catName }).select("id, name").single();
      if (error) {
        console.error("Failed to add category:", catName, error.message);
        continue;
      }
      addedCategories.push(catName);
      categoryNamesSet.add(norm);
    }
  }

  if (addedCategories.length > 0) {
    console.log("Added categories (new in backend):");
    addedCategories.forEach((c) => console.log("  -", c));
    console.log("");
  }

  const inserts = [];
  for (let i = 0; i < items.length; i++) {
    const obj = items[i];
    const name = get(obj, "name");
    const location = get(obj, "location");
    const category = get(obj, "category");
    if (!name || !location || !category) {
      console.error("Item " + (i + 1) + ": missing name, location, or category. Skipped.");
      continue;
    }

    const city = cityFromLocation(location);
    let office_id = null;
    if (city) {
      const id = officeByName.get(normalizeName(city));
      if (id) office_id = id;
    }

    inserts.push({
      name: String(name),
      location: String(location),
      category: String(category),
      price: 0,
      currency: "SEK",
      office_id: office_id || null,
      assigned_to: null,
      start_date: get(obj, "start_date") || null,
      end_date: get(obj, "end_date") || null,
      event_link: get(obj, "event_link") || null,
      notes: get(obj, "notes") || null,
      status: null,
      reason_to_go: null,
      fee_link: get(obj, "fee_link") || null,
      partnership: get(obj, "partnership") || null,
      fee: get(obj, "fee") || null,
    });
  }

  if (inserts.length === 0) {
    console.error("No valid items to insert.");
    process.exit(1);
  }

  const BATCH = 50;
  let inserted = 0;
  for (let i = 0; i < inserts.length; i += BATCH) {
    const batch = inserts.slice(i, i + BATCH);
    const { data, error } = await supabase.from("conferences").insert(batch).select("id, name");
    if (error) {
      console.error("Insert error:", error.message);
      process.exit(1);
    }
    inserted += (data || []).length;
    (data || []).forEach((r) => console.log("Inserted:", r.name));
  }

  console.log("\nDone. Imported " + inserted + " conference(s). Existing conferences were kept.");
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
