/**
 * Delete all conferences from the database (ratings are deleted by CASCADE).
 * 
 * Usage: node scripts/delete-all-conferences.js
 */

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Count conferences before deletion
  const { count: beforeCount } = await supabase
    .from("conferences")
    .select("*", { count: "exact", head: true });

  console.log(`Found ${beforeCount || 0} conference(s) to delete...`);

  // Delete all conferences (ratings are deleted by CASCADE)
  const { error } = await supabase
    .from("conferences")
    .delete()
    .gte("id", "00000000-0000-0000-0000-000000000000");

  if (error) {
    console.error("Failed to delete conferences:", error.message);
    process.exit(1);
  }

  // Verify deletion
  const { count: afterCount } = await supabase
    .from("conferences")
    .select("*", { count: "exact", head: true });

  console.log(`\nDone. Deleted ${beforeCount || 0} conference(s).`);
  console.log(`Remaining conferences: ${afterCount || 0}`);
  console.log("(Ratings were automatically deleted via CASCADE)");
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
