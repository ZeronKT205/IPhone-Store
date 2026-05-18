import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const STORAGE_BUCKET = "products";

let _client: SupabaseClient | null = null;

/**
 * Server-side Supabase admin client (Service Role).
 * Lazy-initialized để tránh lỗi "supabaseUrl is required" lúc build.
 * Chỉ dùng trong API routes (server-side).
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  _client = createClient(url, key);
  return _client;
}
