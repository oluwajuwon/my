import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNestAuth } from "../auth/AuthProvider";
import { NestData } from "../domain/types";
import { requireNestSupabase } from "../infrastructure/supabase/client";
import { SupabaseNestRepository } from "../repositories/nestSupabaseRepository";
import { NestStoreProvider } from "../store/NestStore";
import Onboarding from "../pages/Onboarding";

const Loading: React.FC = () => <main className="nest-loading"><span className="nest-brand-mark">n</span><p>Preparing your family space…</p></main>;
export const NestBootstrap: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user } = useNestAuth(); const repository = useMemo(() => new SupabaseNestRepository(requireNestSupabase(), user!.id), [user]);
  const [state, setState] = useState<{ loading: boolean; needsOnboarding: boolean; data?: NestData; error?: string }>({ loading: true, needsOnboarding: false });
  const load = useCallback(async () => { setState({ loading: true, needsOnboarding: false }); try { const profile = await repository.profile(); if (!profile.hasHousehold) { setState({ loading: false, needsOnboarding: true }); return; } const data = await repository.load(); setState({ loading: false, needsOnboarding: false, data }); } catch (error) { if (error instanceof Error && error.message === "ONBOARDING_REQUIRED") setState({ loading: false, needsOnboarding: true }); else setState({ loading: false, needsOnboarding: false, error: error instanceof Error ? error.message : "Nest could not load your family." }); } }, [repository]);
  useEffect(() => { void load(); }, [load]);
  if (state.loading) return <Loading/>;
  if (state.error) return <main className="nest-error-state"><span className="nest-brand-mark">n</span><h1>We couldn’t open Nest.</h1><p>{state.error}</p><button type="button" onClick={() => void load()}>Try again</button></main>;
  if (state.needsOnboarding) return <Onboarding repository={repository} onComplete={() => void load()}/>;
  return <NestStoreProvider repository={repository} initialData={state.data}>{children}</NestStoreProvider>;
};
