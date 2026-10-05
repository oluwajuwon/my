import React, { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { NestAccountProvider } from "./application/AccountContext";
import { NestBootstrap } from "./application/NestBootstrap";
import NestProductRoutes from "./application/NestProductRoutes";
import { NestAuthProvider, useNestAuth } from "./auth/AuthProvider";
import { ForgotPassword, ResetPassword, SignIn, SignUp } from "./auth/AuthScreens";
import { productConfig } from "./config/product";
import { isNestSupabaseConfigured } from "./infrastructure/supabase/client";
import JoinInvitation from "./pages/JoinInvitation";
import { NestStoreProvider } from "./store/NestStore";
import "./styles.css";

const ProtectedNest: React.FC = () => { const auth = useNestAuth(); const location = useLocation(); if (auth.loading) return <main className="nest-loading"><span className="nest-brand-mark">n</span><p>Opening Nest…</p></main>; if (!auth.session) return <Navigate to="/nest/sign-in" state={{ from: location.pathname }} replace/>; return <NestAccountProvider value={{ mode: "account", signOut: auth.signOut }}><NestBootstrap><NestProductRoutes/></NestBootstrap></NestAccountProvider>; };
const ConfiguredApp: React.FC = () => <NestAuthProvider><Routes><Route path="sign-in" element={<SignIn/>}/><Route path="sign-up" element={<SignUp/>}/><Route path="forgot-password" element={<ForgotPassword/>}/><Route path="reset-password" element={<ResetPassword/>}/><Route path="join" element={<JoinInvitation/>}/><Route path="*" element={<ProtectedNest/>}/></Routes></NestAuthProvider>;
const DemoApp: React.FC<{ leave(): void }> = ({ leave }) => <NestAccountProvider value={{ mode: "demo", signOut: async () => leave() }}><NestStoreProvider><NestProductRoutes/></NestStoreProvider></NestAccountProvider>;
const Setup: React.FC<{ enterDemo(): void }> = ({ enterDemo }) => <main className="nest-setup"><section><div className="nest-brand"><span className="nest-brand-mark">n</span><span><strong>Nest</strong><small>Care, shared.</small></span></div><p>DEVELOPMENT SETUP</p><h1>Connect Nest to Supabase.</h1><span>Real accounts require a dedicated public project URL and anonymous key. Service-role keys never belong in the browser.</span><code>REACT_APP_SUPABASE_URL_NEST<br/>REACT_APP_SUPABASE_ANON_KEY_NEST</code><button type="button" onClick={enterDemo}>Enter explicit demo mode</button><Link to="/">Back to portfolio</Link></section></main>;
const NestApp: React.FC = () => { const [demo, setDemo] = useState(() => window.sessionStorage.getItem("nest.explicitDemo") === "true"); useEffect(() => { const previous = document.title; document.title = `${productConfig.name} — ${productConfig.tagline}`; return () => { document.title = previous; }; }, []); if (demo) return <DemoApp leave={() => { sessionStorage.removeItem("nest.explicitDemo"); setDemo(false); }}/>; if (!isNestSupabaseConfigured) return <Setup enterDemo={() => { sessionStorage.setItem("nest.explicitDemo", "true"); setDemo(true); }}/>; return <ConfiguredApp/>; };
export default NestApp;
