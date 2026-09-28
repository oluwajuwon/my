import React, { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { budgyNavigation } from "../routes";
import Icon from "./Icon";
import { useHousehold } from "../application/HouseholdContext";
import { useBudgyStore } from "../store/BudgyStore";
import { useAuth } from "../auth/AuthProvider";

const BudgyLogo: React.FC = () => (
  <div className="budgy-brand" aria-label="Budgy">
    <span className="budgy-brand-mark" aria-hidden="true">B</span>
    <span className="budgy-brand-name">budgy</span>
  </div>
);

const Shell: React.FC = () => {
  const household = useHousehold();
  const { signOut } = useAuth();
  const [householdMenu,setHouseholdMenu]=useState(false);
  const { saving, syncError, retry } = useBudgyStore();
  const initials = household.members.map((member) => member.displayName[0]).join("").slice(0, 2).toUpperCase();
  return (
  <div className="budgy-app">
    <aside className="budgy-sidebar">
      <BudgyLogo />
      <button className="budgy-household-switcher" type="button" aria-expanded={householdMenu} onClick={()=>setHouseholdMenu((open)=>!open)}>
        <span className="budgy-household-avatar" aria-hidden="true">{initials}</span>
        <span className="budgy-household-copy"><small>{household.members.length} member{household.members.length === 1 ? "" : "s"}</small><strong>{household.household.name}</strong></span>
        <span aria-hidden="true">⌄</span>
      </button>
      {householdMenu&&<div className="budgy-household-menu"><Link to="/budgy/settings/household" onClick={()=>setHouseholdMenu(false)}>Household settings</Link><div><small>Switch household</small>{household.households.map((entry)=><button type="button" key={entry.householdId} aria-current={entry.householdId===household.household.id?"true":undefined} onClick={()=>{setHouseholdMenu(false);if(entry.householdId!==household.household.id)household.switchHousehold(entry.householdId);}}>{entry.householdId===household.household.id?"✓ ":""}{entry.name}</button>)}</div><Link to="/budgy/settings/household?create=1" onClick={()=>setHouseholdMenu(false)}>Create household</Link><button type="button" onClick={()=>void signOut()}>Sign out</button></div>}
      <nav className="budgy-sidebar-nav" aria-label="Budgy navigation">
        {budgyNavigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => isActive ? "budgy-nav-link is-active" : "budgy-nav-link"}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="budgy-sidebar-note">
        <p>Shared plan</p>
        <span>{saving ? "Saving shared changes…" : "One household, one view."}</span>
      </div>
    </aside>

    <div className="budgy-mobile-header">
      <BudgyLogo />
      <Link className="budgy-mobile-avatar" to="/budgy/settings/household" aria-label="Household settings">{initials}</Link>
    </div>

    <main className="budgy-main">
      {syncError && <div className="budgy-sync-error" role="alert"><span>{syncError}</span><button type="button" onClick={retry}>Retry</button></div>}
      <Outlet />
    </main>

    <nav className="budgy-mobile-navigation" aria-label="Mobile Budgy navigation">
      {budgyNavigation.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          className={({ isActive }) => isActive ? "budgy-mobile-nav-link is-active" : "budgy-mobile-nav-link"}
        >
          <Icon name={item.icon} size={19} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  </div>
  );
};

export default Shell;
