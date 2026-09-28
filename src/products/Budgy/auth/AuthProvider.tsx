import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { requireSupabase } from "../infrastructure/supabase/client";

interface AuthValue {
  session: Session | null; loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const client = requireSupabase();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    client.auth.getSession().then(({ data }) => { if (active) { setSession(data.session); setLoading(false); } });
    const { data: subscription } = client.auth.onAuthStateChange((_event, next) => { setSession(next); setLoading(false); });
    return () => { active = false; subscription.subscription.unsubscribe(); };
  }, [client]);
  const value = useMemo<AuthValue>(() => ({
    session, loading,
    signIn: async (email, password) => { const { error } = await client.auth.signInWithPassword({ email, password }); if (error) throw error; },
    signUp: async (email, password, displayName) => { const { error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/budgy`, data: { display_name: displayName.trim() } } }); if (error) throw error; },
    resetPassword: async (email) => { const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/budgy/reset-password` }); if (error) throw error; },
    updatePassword: async (password) => { const { error } = await client.auth.updateUser({ password }); if (error) throw error; },
    signOut: async () => { const { error } = await client.auth.signOut(); if (error) throw error; },
  }), [client, session, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export const useAuth = () => { const value = useContext(AuthContext); if (!value) throw new Error("useAuth must be inside AuthProvider"); return value; };
