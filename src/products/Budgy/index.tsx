import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Shell from "./components/Shell";
import Overview from "./pages/Overview";
import Budget from "./pages/Budget";
import Money from "./pages/Money";
import Transactions from "./pages/Transactions";
import Goals from "./pages/Goals";
import Projections from "./pages/Projections";
import Scenarios from "./pages/Scenarios";
import Settings from "./pages/Settings";
import HouseholdSettings from "./pages/HouseholdSettings";
import { AuthProvider } from "./auth/AuthProvider";
import { BudgyBootstrap } from "./application/BudgyBootstrap";
import { isSupabaseConfigured } from "./infrastructure/supabase/client";
import "./styles.css";

const BudgyApp: React.FC = () => {
  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector('meta[name="description"]');
    const previousDescription = description?.getAttribute("content") ?? "";

    document.title = "Budgy — Shared household planning";
    description?.setAttribute(
      "content",
      "Budgy is a shared household budgeting and financial-planning experience for couples.",
    );

    return () => {
      document.title = previousTitle;
      description?.setAttribute("content", previousDescription);
    };
  }, []);

  if (!isSupabaseConfigured) return <main className="budgy-state-page"><div className="budgy-brand"><span className="budgy-brand-mark">B</span><span className="budgy-brand-name">budgy</span></div><h1>Connect Budgy to Supabase</h1><p>Add the public Supabase URL and anon key to your environment. No service-role key belongs in the browser.</p><code>REACT_APP_SUPABASE_URL<br/>REACT_APP_SUPABASE_ANON_KEY</code></main>;

  return (
    <AuthProvider><BudgyBootstrap><Routes>
      <Route element={<Shell />}>
        <Route index element={<Overview />} />
        <Route path="budget" element={<Budget />} />
        <Route path="money" element={<Money />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="goals" element={<Goals />} />
        <Route path="projections" element={<Projections />} />
        <Route path="scenarios" element={<Scenarios />} />
        <Route path="settings" element={<Settings />} />
        <Route path="settings/household" element={<HouseholdSettings />} />
        <Route path="*" element={<Overview />} />
      </Route>
    </Routes></BudgyBootstrap></AuthProvider>
  );
};

export default BudgyApp;
