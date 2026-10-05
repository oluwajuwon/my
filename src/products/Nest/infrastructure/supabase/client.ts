import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.REACT_APP_SUPABASE_URL_NEST?.trim();
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY_NEST?.trim();
export const isNestSupabaseConfigured = Boolean(url && anonKey);
export const nestSupabase: SupabaseClient | null = isNestSupabaseConfigured ? createClient(url!, anonKey!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }, global: { headers: { "x-application-name": "nest-web" } } }) : null;
export const requireNestSupabase = (): SupabaseClient => { if (!nestSupabase) throw new Error("Nest is not connected to Supabase. Add the Nest public URL and anonymous key."); return nestSupabase; };
