/**
 * Populate categories for technology consultant organization
 * Run with: node scripts/populate-categories.js
 */

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const categories = [
  "AI",
  "Data",
  "Cloud",
  "Security",
  "DevOps",
  "Platform",
  "Architecture",
  "Backend",
  "Frontend",
  "Mobile",
  "Testing",
  "UX",
  "Product",
  "Leadership",
  "Strategy",
  "Delivery",
  "Agile",
  "Observability",
  "Reliability",
  "Integration",
  "Enterprise",
  "IoT",
  "Edge",
  "Embedded",
  "Hardware",
  "Blockchain",
  "Spatial",
  "FinTech",
  "HealthTech",
  "Mobility",
  "Sustainability",
  "Innovation",
  "Governance",
  "Compliance",
];

async function populateCategories() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Error: Missing Supabase credentials in .env.local");
    console.error("Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Populating categories...");

  let created = 0;
  let skipped = 0;

  for (const categoryName of categories) {
    try {
      const { data, error } = await supabase
        .from("categories")
        .insert({ name: categoryName })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation - category already exists
          console.log(`  ✓ "${categoryName}" already exists`);
          skipped++;
        } else {
          console.error(`  ✗ Error creating "${categoryName}":`, error.message);
        }
      } else {
        console.log(`  ✓ Created "${categoryName}"`);
        created++;
      }
    } catch (err) {
      console.error(`  ✗ Unexpected error for "${categoryName}":`, err.message);
    }
  }

  console.log("\nSummary:");
  console.log(`  Created: ${created}`);
  console.log(`  Skipped (already exist): ${skipped}`);
  console.log(`  Total: ${categories.length}`);
}

populateCategories()
  .then(() => {
    console.log("\n✅ Category population completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
