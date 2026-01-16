import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables.\n\n" +
      "Please create a .env.local file in the knightecconf directory with:\n" +
      "NEXT_PUBLIC_SUPABASE_URL=your-project-url\n" +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n\n" +
      "Get these values from your Supabase project dashboard:\n" +
      "https://supabase.com/dashboard\n\n" +
      "See SETUP_GUIDE.md for detailed instructions."
    );
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}
