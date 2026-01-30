/**
 * Import conferences from a JSON file.
 * 1. Deletes ALL existing conferences (and their ratings via cascade).
 * 2. Inserts items from the JSON array as new conferences.
 *
 * Usage: node scripts/import-conferences-from-json.js <path-to-file.json>
 *
 * JSON format: an array of objects, or an object with a "conferences" array.
 * Keys are case-insensitive. Required: name, location, category, price
 * Optional: currency, start_date, end_date, event_link, notes, status, reason_to_go, office, assigned_to
 *
 * - office: office name (must exist in offices table); script looks up office_id
 * - assigned_to: person email (must exist in people table); script looks up person id
 */

require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const VALID_STATUSES = ["Interested", "Planned", "Booked", "Attended"];

// Get value from object by trying multiple keys (case-insensitive)
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

async function main() {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error("Usage: node scripts/import-conferences-from-json.js <path-to-file.json>");
    process.exit(1);
  }

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

  // Load offices and people for lookups
  const { data: offices } = await supabase.from("offices").select("id, name");
  const { data: people } = await supabase.from("people").select("id, email");
  const officeByName = new Map((offices || []).map((o) => [o.name.trim().toLowerCase(), o.id]));
  const personByEmail = new Map((people || []).map((p) => [p.email.trim().toLowerCase(), p.id]));

  // 1) Delete all conferences (ratings are deleted by CASCADE)
  console.log("Deleting all existing conferences (and their ratings)...");
  const { error: deleteError } = await supabase.from("conferences").delete().gte("id", "00000000-0000-0000-0000-000000000000");
  if (deleteError) {
    console.error("Failed to delete conferences:", deleteError.message);
    process.exit(1);
  }
  console.log("  Done.\n");

  const inserts = [];
  const errors = [];

  for (let i = 0; i < items.length; i++) {
    const obj = items[i];
    const name = get(obj, "name", "event_name", "eventName", "title", "event");
    const location = get(obj, "location", "place", "city", "venue");
    const category = get(obj, "category", "categories");
    const priceRaw = get(obj, "price", "cost");
    const price = priceRaw != null ? parseFloat(String(priceRaw)) : 0;

    if (!name || !location || !category || Number.isNaN(price)) {
      errors.push(`Item ${i + 1}: missing required field (name, location, category, or valid price).`);
      continue;
    }

    const currency = get(obj, "currency") || "SEK";
    const start_date = get(obj, "start_date", "startDate", "start");
    const end_date = get(obj, "end_date", "endDate", "end");
    const event_link = get(obj, "event_link", "eventLink", "link", "url");
    const notes = get(obj, "notes");
    let status = get(obj, "status");
    if (status && !VALID_STATUSES.includes(status)) status = null;
    const reason_to_go = get(obj, "reason_to_go", "reasonToGo", "reason");

    let office_id = null;
    const officeName = get(obj, "office", "office_name", "officeName");
    if (officeName) {
      const id = officeByName.get(String(officeName).trim().toLowerCase());
      if (id) office_id = id;
    }

    let assigned_to = null;
    const assignedEmail = get(obj, "assigned_to", "assignedTo", "email", "person");
    if (assignedEmail) {
      const id = personByEmail.get(String(assignedEmail).trim().toLowerCase());
      if (id) assigned_to = id;
    }

    inserts.push({
      name: String(name),
      location: String(location),
      category: String(category),
      price: Number(price),
      currency: String(currency),
      office_id: office_id || null,
      assigned_to: assigned_to || null,
      start_date: start_date || null,
      end_date: end_date || null,
      event_link: event_link || null,
      notes: notes || null,
      status: status || null,
      reason_to_go: reason_to_go || null,
    });
  }

  if (errors.length > 0) {
    console.error("Validation errors:");
    errors.forEach((e) => console.error("  ", e));
    console.error("");
  }

  if (inserts.length === 0) {
    console.error("No valid items to insert.");
    process.exit(1);
  }

  const BATCH = 100;
  let inserted = 0;
  for (let i = 0; i < inserts.length; i += BATCH) {
    const batch = inserts.slice(i, i + BATCH);
    const { data, error } = await supabase.from("conferences").insert(batch).select("id");
    if (error) {
      console.error("Insert error:", error.message);
      process.exit(1);
    }
    inserted += (data || []).length;
    console.log(`Inserted ${inserted}/${inserts.length} conferences...`);
  }

  console.log("\nDone. Imported", inserted, "conferences. All previous conferences were removed.");
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
