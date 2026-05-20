import { createClient } from "@supabase/supabase-js";

// These should ideally come from environment variables.
// For now, these are placeholders that the user will need to replace
// with their actual Supabase project URL and anon key.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://qkpbudnklhjcbsdfdbmv.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrcGJ1ZG5rbGhqY2JzZGZkYm12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTA5NzMsImV4cCI6MjA5NDY4Njk3M30.Kb0o_7EcsJbmvNtFXXSw7tI6onOmOH9TZp0TLBQUbgo";

// Create a fail-safe supabase client
let client: any = null;
try {
  // Ensure the key looks like a JWT or at least doesn't crash the constructor
  client = createClient(supabaseUrl, supabaseAnonKey);
} catch (error) {
  console.error("Failed to initialize Supabase client. Check your URL and Anon Key.", error);
  // Provide a dummy client that throws so catch blocks in components handle it
  client = {
    from: () => { throw new Error(`Supabase client failed to initialize: ${error instanceof Error ? error.message : String(error)}`); },
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: { session: null }, error: new Error("Supabase client failed to initialize") }),
      signOut: async () => ({ error: null }),
    }
  };
}

export const supabase = client;
