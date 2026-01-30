/**
 * Import conferences from a CSV file.
 * 1. Deletes ALL existing conferences (and their ratings via cascade).
 * 2. Inserts rows from the CSV as new conferences.
 *
 * Usage: node scripts/import-conferences-from-csv.js <path-to-file.csv>
 *
 * CSV columns (header row required). Case-insensitive. Optional columns can be omitted or left empty.
 * Required: name, location, category, price
 * Optional: currency, start_date, end_date, event_link, notes, status, reason_to_go, office, assigned_to
 *
 * - status: one of Interested, Planned, Booked, Attended
 * - office: office name (must exist in offices table); script looks up office_id
 * - assigned_to: person email (must exist in people table); script looks up person id
 */

require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// Parse a single CSV line respecting quoted fields (handles "a,b" as one field)
function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if ((c === "," && !inQuotes) || (c === "\r" && !inQuotes)) {
      result.push(current.trim());
      current = "";
      if (c === "\r") break;
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(content) {
  const lines = content.split(/\n/).filter((l) => l.length > 0);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = parseCSVLine(lines[0]).map((h) => h.replace(/^"|"$/g, "").trim().toLowerCase());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]).map((v) => v.replace(/^"|"$/g, "").trim());
    const row = {};
    headers.forEach((h, j) => {
      row[h] = values[j] !== undefined ? values[j] : "";
    });
    rows.push(row);
  }
  return { headers, rows };
}

// Normalize header name (allow "start date" -> start_date, etc.)
function getColumn(row, ...names) {
  const keys = Object.keys(row);
  for (const n of names) {
    const lower = n.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
    const key = keys.find((k) => k.replace(/\s+/g, "_").replace(/-/g, "_") === lower);
    if (key !== undefined) return row[key] === "" ? null : row[key];
  }
  return null;
}

const VALID_STATUSES = ["Interested", "Planned", "Booked", "Attended"];

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("Usage: node scripts/import-conferences-from-csv.js <path-to-file.csv>");
    process.exit(1);
  }

  const resolved = path.resolve(process.cwd(), csvPath);
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

  const csvContent = fs.readFileSync(resolved, "utf-8");
  const { rows } = parseCSV(csvContent);

  if (rows.length === 0) {
    console.error("No data rows in CSV (only header or empty file).");
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

  // 2) Build inserts from CSV
  const inserts = [];
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = getColumn(row, "name", "event", "event name");
    const location = getColumn(row, "location", "place", "city");
    const category = getColumn(row, "category", "categories");
    const priceRaw = getColumn(row, "price", "cost");
    const price = priceRaw != null ? parseFloat(String(priceRaw).replace(/,/g, ".")) : 0;
    if (!name || name === "" || !location || location === "" || !category || category === "" || Number.isNaN(price)) {
      errors.push(`Row ${i + 2}: missing required field (name, location, category, or valid price).`);
      continue;
    }

    const currency = getColumn(row, "currency") || "SEK";
    const start_date = getColumn(row, "start_date", "start date", "start");
    const end_date = getColumn(row, "end_date", "end date", "end");
    const event_link = getColumn(row, "event_link", "event link", "link", "url");
    const notes = getColumn(row, "notes");
    let status = getColumn(row, "status");
    if (status && !VALID_STATUSES.includes(status)) status = null;
    const reason_to_go = getColumn(row, "reason_to_go", "reason to go", "reason");

    let office_id = null;
    const officeName = getColumn(row, "office", "office name");
    if (officeName) {
      const id = officeByName.get(officeName.trim().toLowerCase());
      if (id) office_id = id;
    }

    let assigned_to = null;
    const assignedEmail = getColumn(row, "assigned_to", "assigned to", "email", "person");
    if (assignedEmail) {
      const id = personByEmail.get(assignedEmail.trim().toLowerCase());
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
    console.error("\nFix the CSV and run again, or only valid rows will be imported.\n");
  }

  if (inserts.length === 0) {
    console.error("No valid rows to insert.");
    process.exit(1);
  }

  // Insert in batches (Supabase default limit is 1000)
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
