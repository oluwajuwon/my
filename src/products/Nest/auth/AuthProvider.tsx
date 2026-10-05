import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { requireNestSupabase } from "../infrastructure/supabase/client";

interface AuthValue { session: Session | null; user: User | null; loading: boolean; recovery: boolean; signIn(email: string, password: string): Promise<void>; signUp(displayName: string, email: string, password: string): Promise<{ needsVerification: boolean }>; resetPassword(email: string): Promise<void>; updatePassword(password: string): Promise<void>; signOut(): Promise<void> }
const Context = createContext<AuthValue | null>(null);
export const NestAuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const client = requireNestSupabase(); const [session, setSession] = useState<Session | null>(null); const [loading, setLoading] = useState(true); const [recovery, setRecovery] = useState(false);
  useEffect(() => { let active = true; void client.auth.getSession().then(({ data }) => { if (active) { setSession(data.session); setLoading(false); } }); const { data } = client.auth.onAuthStateChange((event, next) => { setSession(next); setRecovery(event === "PASSWORD_RECOVERY"); setLoading(false); }); return () => { active = false; data.subscription.unsubscribe(); }; }, [client]);
  const value = useMemo<AuthValue>(() => ({ session, user: session?.user ?? null, loading, recovery,
    signIn: async (email, password) => { const { error } = await client.auth.signInWithPassword({ email: email.trim(), password }); if (error) throw error; },
    signUp: async (displayName, email, password) => { const { data, error } = await client.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: `${window.location.origin}/nest/onboarding`, data: { display_name: displayName.trim() } } }); if (error) throw error; return { needsVerification: !data.session }; },
    resetPassword: async (email) => { const { error } = await client.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/nest/reset-password` }); if (error) throw error; },
    updatePassword: async (password) => { const { error } = await client.auth.updateUser({ password }); if (error) throw error; setRecovery(false); },
    signOut: async () => { const { error } = await client.auth.signOut(); if (error) throw error; setSession(null); },
  }), [client, session, loading, recovery]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
};
export const useNestAuth = (): AuthValue => { const value = useContext(Context); if (!value) throw new Error("useNestAuth must be inside NestAuthProvider"); return value; };
