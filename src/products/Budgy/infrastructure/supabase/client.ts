import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.REACT_APP_SUPABASE_URL?.trim();
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      realtime: { params: { eventsPerSecond: 10 } },
    })
  : null;

export const requireSupabase = (): SupabaseClient => {
  if (!supabase) throw new Error("Budgy is not connected to Supabase. Configure the public environment variables first.");
  return supabase;
};
