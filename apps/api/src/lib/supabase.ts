import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

/**
 * Server-side Supabase client using the service role key. Only ever
 * instantiated on the server — this key must never reach a browser bundle.
 * Lazily created so a missing env var only breaks routes that need it,
 * not server boot (health check must stay up even if Supabase is
 * misconfigured).
 */
export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — check apps/api/.env against .env.example"
    );
  }

  cachedClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false }
  });
  return cachedClient;
}
