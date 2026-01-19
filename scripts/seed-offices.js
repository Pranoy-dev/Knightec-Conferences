/**
 * Seed offices table with initial data
 * Run with: node scripts/seed-offices.js
 * 
 * This script can be run multiple times safely - it uses ON CONFLICT DO NOTHING
 */

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const offices = [
  "Stockholm",
  "Gothenburg",
  "Malmö",
  "Umeå",
  "Linköping",
  "Lund",
  "Uppsala",
  "Örebro",
  "Västerås",
  "Helsingborg",
  "Jönköping",
  "Norrköping",
  "Luleå",
  "Borås",
  "Sundsvall",
  "Gävle",
  "Östersund",
  "Karlstad",
  "Skellefteå",
  "Kristianstad",
];

async function seedOffices() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Error: Missing Supabase credentials in .env.local");
    console.error("Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Seeding offices table...");

  let created = 0;
  let skipped = 0;

  for (const officeName of offices) {
    try {
      const { data, error } = await supabase
        .from("offices")
        .insert({ name: officeName })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation - office already exists
          console.log(`  ✓ "${officeName}" already exists`);
          skipped++;
        } else {
          console.error(`  ✗ Error creating "${officeName}":`, error.message);
        }
      } else {
        console.log(`  ✓ Created "${officeName}"`);
        created++;
      }
    } catch (err) {
      console.error(`  ✗ Unexpected error for "${officeName}":`, err.message);
    }
  }

  console.log("\nSummary:");
  console.log(`  Created: ${created}`);
  console.log(`  Skipped (already exist): ${skipped}`);
  console.log(`  Total: ${offices.length}`);
}

seedOffices()
  .then(() => {
    console.log("\n✅ Office seeding completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
