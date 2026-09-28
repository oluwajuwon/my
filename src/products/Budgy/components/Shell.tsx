import React,{useState}from"react";
import{Link,NavLink,Outlet,useLocation}from"react-router-dom";
import{budgyNavigation}from"../routes";
import Icon from"./Icon";
import{useHousehold}from"../application/HouseholdContext";
import{useBudgyStore}from"../store/BudgyStore";
import{useAuth}from"../auth/AuthProvider";
import{Dialog}from"./Dialog";
import{TransactionForm}from"./Forms";
import{Transaction}from"../domain/types";
import{clearTransactionDraft,hasTransactionDraft,transactionDraftKey}from"../application/transactionDraft";
import{isMoreRoute,quickAddOptions}from"./mobileNavigation";

const BudgyLogo:React.FC=()=> <div className="budgy-brand" aria-label="Budgy"><span className="budgy-brand-mark" aria-hidden="true">B</span><span className="budgy-brand-name">budgy</span></div>;

const Shell:React.FC=()=>{
  const household=useHousehold();
  const{session,signOut}=useAuth();
  const{data,month,saving,syncError,retry,updateData}=useBudgyStore();
  const location=useLocation();
  const[householdMenu,setHouseholdMenu]=useState(false);
  const[quickMenu,setQuickMenu]=useState(false);
  const[moreOpen,setMoreOpen]=useState(false);
  const draftKey=transactionDraftKey(session!.user.id,household.household.id);
  const[quickType,setQuickType]=useState<Transaction["type"]|null>(()=>hasTransactionDraft(draftKey)?"expense":null);
  const initials=household.members.map((member)=>member.displayName[0]).join("").slice(0,2).toUpperCase();
  const closeTransaction=()=>{clearTransactionDraft(draftKey);setQuickType(null);};
  const moreActive=isMoreRoute(location.pathname);
  const moreLink=(to:string,label:string)=><Link to={to} onClick={()=>setMoreOpen(false)}>{label}<span aria-hidden="true">→</span></Link>;

  return <div className="budgy-app">
    <aside className="budgy-sidebar">
      <BudgyLogo/>
      <button className="budgy-household-switcher" type="button" aria-expanded={householdMenu} onClick={()=>setHouseholdMenu((open)=>!open)}><span className="budgy-household-avatar" aria-hidden="true">{initials}</span><span className="budgy-household-copy"><small>{household.members.length} member{household.members.length===1?"":"s"}</small><strong>{household.household.name}</strong></span><span aria-hidden="true">⌄</span></button>
      {householdMenu&&<div className="budgy-household-menu"><Link to="/budgy/settings/household" onClick={()=>setHouseholdMenu(false)}>Household settings</Link><div><small>Switch household</small>{household.households.map((entry)=><button type="button" key={entry.householdId} aria-current={entry.householdId===household.household.id?"true":undefined} onClick={()=>{setHouseholdMenu(false);if(entry.householdId!==household.household.id)household.switchHousehold(entry.householdId);}}>{entry.householdId===household.household.id?"✓ ":""}{entry.name}</button>)}</div><Link to="/budgy/settings/household?create=1" onClick={()=>setHouseholdMenu(false)}>Create household</Link><button type="button" onClick={()=>void signOut()}>Sign out</button></div>}
      <nav className="budgy-sidebar-nav" aria-label="Budgy navigation">{budgyNavigation.map((item)=><NavLink key={item.path} to={item.path} end={item.end} className={({isActive})=>isActive?"budgy-nav-link is-active":"budgy-nav-link"}><Icon name={item.icon}/><span>{item.label}</span></NavLink>)}</nav>
      <div className="budgy-sidebar-note"><p>Shared plan</p><span>{saving?"Saving shared changes…":household.backgroundFetching?"Refreshing shared details…":"One household, one view."}</span></div>
    </aside>

    <div className="budgy-mobile-header"><BudgyLogo/><Link className="budgy-mobile-avatar" to="/budgy/settings/household" aria-label="Household settings">{initials}</Link></div>
    <main className="budgy-main">{syncError&&<div className="budgy-sync-error" role="alert"><span>{syncError}</span><button type="button" onClick={retry}>Retry</button></div>}<Outlet/></main>

    <nav className="budgy-mobile-navigation" aria-label="Mobile Budgy navigation">
      <NavLink to="/budgy" end className={({isActive})=>isActive?"budgy-mobile-nav-link is-active":"budgy-mobile-nav-link"}><Icon name="overview" size={20}/><span>Home</span></NavLink>
      <NavLink to="/budgy/budget" className={({isActive})=>isActive?"budgy-mobile-nav-link is-active":"budgy-mobile-nav-link"}><Icon name="budget" size={20}/><span>Budget</span></NavLink>
      <button className="budgy-mobile-nav-link budgy-mobile-nav-action" type="button" aria-label="Quick add" aria-haspopup="dialog" onClick={()=>setQuickMenu(true)}><strong aria-hidden="true">+</strong><span>Add</span></button>
      <NavLink to="/budgy/money" className={({isActive})=>isActive?"budgy-mobile-nav-link is-active":"budgy-mobile-nav-link"}><Icon name="money" size={20}/><span>Money</span></NavLink>
      <button className={`budgy-mobile-nav-link ${moreActive?"is-active":""}`} type="button" aria-label="More navigation" aria-haspopup="dialog" aria-current={moreActive?"page":undefined} onClick={()=>setMoreOpen(true)}><Icon name="more" size={20}/><span>More</span></button>
    </nav>

    <Dialog open={quickMenu} variant="sheet" title="Quick add" description="Record money movement without leaving where you are." onClose={()=>setQuickMenu(false)}><div className="budgy-quick-actions">{quickAddOptions.map((option)=><button key={option.type} className={option.primary?"is-primary":""} type="button" onClick={()=>{setQuickMenu(false);setQuickType(option.type);}}><span>{option.label}</span><b aria-hidden="true">→</b></button>)}</div></Dialog>
    <Dialog open={quickType!==null} variant="sheet" title="Add money movement" description={hasTransactionDraft(draftKey)?"Your unfinished transaction has been restored.":"Record this against your shared household."} onClose={closeTransaction}>{quickType&&<TransactionForm month={month} categories={data.categories} initialType={quickType} onCancel={()=>setQuickType(null)} onSave={(transaction)=>{updateData((current)=>({...current,transactions:[...current.transactions,transaction]}));setQuickType(null);}}/>}</Dialog>
    <Dialog open={moreOpen} variant="sheet" title="More" description="Everything else in Budgy, organised by purpose." onClose={()=>setMoreOpen(false)}><div className="budgy-more-menu"><section><p>Money management</p>{moreLink("/budgy/transactions","Transactions")}{moreLink("/budgy/reports","Reports")}{moreLink("/budgy/goals","Goals")}</section><section><p>Planning</p>{moreLink("/budgy/projections","Projections")}{moreLink("/budgy/scenarios","Scenarios")}</section><section><p>Household</p>{moreLink("/budgy/settings/household","Members & household settings")}</section><section><p>Account</p>{moreLink("/budgy/settings","App settings")}<button type="button" onClick={()=>{setMoreOpen(false);void signOut();}}>Sign out<span aria-hidden="true">→</span></button></section></div></Dialog>
  </div>;
};

export default Shell;
