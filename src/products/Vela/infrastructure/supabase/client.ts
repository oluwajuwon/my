import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url=process.env.REACT_APP_SUPABASE_URL_VELA?.trim();
const anonKey=process.env.REACT_APP_SUPABASE_ANON_KEY_VELA?.trim();
export const isVelaSupabaseConfigured=Boolean(url&&anonKey);
export const velaSupabase:SupabaseClient|null=isVelaSupabaseConfigured?createClient(url!,anonKey!,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true},global:{headers:{"x-application-name":"vela-web"}}}):null;
export const requireVelaSupabase=():SupabaseClient=>{if(!velaSupabase)throw new Error("Vela is not connected to Supabase. Add REACT_APP_SUPABASE_URL_VELA and REACT_APP_SUPABASE_ANON_KEY_VELA to your environment.");return velaSupabase;};
