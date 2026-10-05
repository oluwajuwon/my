import React, { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { productConfig, NEST_BASE_PATH } from "../config/product";
import { useNestStore } from "../store/NestStore";
import ChildSwitcher from "./ChildSwitcher";
import Icon, { IconName } from "./Icon";
import QuickLog, { QuickLogStart } from "./QuickLog";
import NightCare from "./NightCare";
import { useNestAccount } from "../application/AccountContext";

const navigation: Array<{ label: string; path: string; icon: IconName; end?: boolean }> = [
  { label: "Today", path: NEST_BASE_PATH, icon: "home", end: true },
  { label: "Timeline", path: `${NEST_BASE_PATH}/timeline`, icon: "timeline" },
  { label: "Insights", path: `${NEST_BASE_PATH}/insights`, icon: "insights" },
  { label: "Family", path: `${NEST_BASE_PATH}/family`, icon: "family" },
];

const Shell: React.FC = () => {
  const [quickLog, setQuickLog] = useState<QuickLogStart | null>(null);
  const { data, toast, dismissToast, saving, syncError, retry, setNightCare } = useNestStore();
  const [nightMode, setNightMode] = useState(data.userPreferences.nightCareEnabled);
  const account = useNestAccount();
  const toggleNightCare = () => { const enabled = !nightMode; setNightMode(enabled); setNightCare(enabled); };
  useEffect(() => { if (!toast) return; const id = window.setTimeout(dismissToast, 5000); return () => window.clearTimeout(id); }, [toast, dismissToast]);
  return <div className={`nest-app ${nightMode ? "is-night" : ""}`}>
    <aside className="nest-sidebar">
      <a href={NEST_BASE_PATH} className="nest-brand"><span className="nest-brand-mark">n</span><span><strong>{productConfig.name}</strong><small>{productConfig.tagline}</small></span></a>
      <ChildSwitcher/>
      <nav aria-label={`${productConfig.name} navigation`}>{navigation.map((item) => <NavLink key={item.path} to={item.path} end={item.end} className={({ isActive }) => isActive ? "is-active" : ""}><Icon name={item.icon}/><span>{item.label}</span></NavLink>)}</nav>
      <button className="nest-night-toggle" type="button" onClick={toggleNightCare}><Icon name="moon"/><span><strong>Night care</strong><small>{nightMode ? "Return to daytime" : "Low-light essentials"}</small></span><i className={nightMode ? "on" : ""}/></button>
      <p className="nest-sidebar-foot">{account.mode === "demo" ? "Explicit demo mode" : "Private household"}<br/><span>{saving ? "Saving shared changes…" : "Everything is up to date"}</span></p><button className="nest-sign-out" type="button" onClick={() => void account.signOut()}>{account.mode === "demo" ? "Leave demo" : "Sign out"}</button>
    </aside>
    <div className="nest-mobile-header"><a href={NEST_BASE_PATH} className="nest-brand"><span className="nest-brand-mark">n</span><strong>{productConfig.name}</strong></a><div><button type="button" className="nest-mobile-night" aria-label={nightMode ? "Exit Night Care" : "Open Night Care"} onClick={toggleNightCare}><Icon name="moon"/></button><ChildSwitcher/></div></div>
    <main className="nest-main">{syncError && <div className="nest-sync-error" role="alert"><span><strong>That change is safe on screen, but hasn’t synced.</strong><small>{syncError}</small></span><button type="button" onClick={retry}>Try again</button></div>}{nightMode ? <NightCare openLog={setQuickLog}/> : <Outlet/>}</main>
    <nav className="nest-mobile-nav" aria-label={`${productConfig.name} mobile navigation`}>
      {navigation.slice(0, 2).map((item) => <NavLink key={item.path} to={item.path} end={item.end} className={({ isActive }) => isActive ? "is-active" : ""}><Icon name={item.icon}/><span>{item.label}</span></NavLink>)}
      <button className="nest-quick-button" type="button" aria-label="Quick log" onClick={() => setQuickLog("main")}><i><Icon name="plus" size={28}/></i><span>Log</span></button>
      {navigation.slice(2).map((item) => <NavLink key={item.path} to={item.path} className={({ isActive }) => isActive ? "is-active" : ""}><Icon name={item.icon}/><span>{item.label}</span></NavLink>)}
    </nav>
    {!nightMode && <button className="nest-desktop-log" type="button" onClick={() => setQuickLog("main")}><Icon name="plus"/><span>Quick log</span></button>}
    <QuickLog open={quickLog !== null} startAt={quickLog ?? "main"} onClose={() => setQuickLog(null)}/>
    {toast && <div className="nest-toast" role="status"><span>✓</span><strong>{toast.message}</strong>{toast.action && <button type="button" onClick={toast.onAction}>{toast.action}</button>}</div>}
  </div>;
};
export default Shell;
