import React, { useState } from "react";
import { formatMoney } from "../domain/money";
import { HouseholdSession } from "../repositories/householdRepository";
import { createHouseholdInvitation } from "./invitations";
import { LocalMigrationCandidate } from "./localMigration";

interface Props {
  candidate: LocalMigrationCandidate;
  household: HouseholdSession;
  onImport: (mapping: Record<string, string>) => Promise<void>;
  onSkip: () => Promise<void>;
  onRefreshMembers: () => void;
  onError: (message: string) => void;
}

const LegacyImport: React.FC<Props> = ({ candidate, household, onImport, onSkip, onRefreshMembers, onError }) => {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [busy, setBusy] = useState(false);
  const needsAnotherMember = candidate.ownerLabels.length > household.members.length;

  return <main className="budgy-onboarding"><div className="budgy-brand"><span className="budgy-brand-mark">B</span><span className="budgy-brand-name">budgy</span></div><section className="budgy-onboarding-card">
    <p className="budgy-eyebrow">Existing plan found</p><h1>Who do these budget items belong to?</h1>
    <p>We found {candidate.months} local month{candidate.months===1?"":"s"} containing {formatMoney(candidate.income)} income and {formatMoney(candidate.spending)} planned spending.</p>
    <div className="budgy-migration-explainer"><b>The names on the left are old budget labels, not member profiles.</b><p>The dropdowns contain the real people who have joined {household.household.name}. Do not assign another person’s old label to yourself. Shared “Household” records remain shared automatically.</p></div>
    {needsAnotherMember&&<div className="budgy-migration-member-setup"><p><b>Only {household.members.length} real member has joined so far.</b> Invite the other person and wait for them to join with their own display name before completing this mapping.</p>{household.membership.role==="owner"&&<form className="budgy-inline-form" onSubmit={async(event)=>{event.preventDefault();setBusy(true);try{setInviteLink(await createHouseholdInvitation(household.household.id,inviteEmail));}catch(error){onError(error instanceof Error?error.message:"The invitation could not be created.");}finally{setBusy(false);}}}><label className="budgy-field"><span>Member’s email address</span><input type="email" required value={inviteEmail} onChange={(event)=>setInviteEmail(event.target.value)} placeholder="partner@example.com"/></label><button className="budgy-button budgy-button--primary" disabled={busy}>{busy?"Creating…":"Create invitation"}</button></form>}{inviteLink&&<div className="budgy-invite-link"><p>Send this private link to {inviteEmail}. They should create or sign into their own account and choose their actual display name.</p><code>{inviteLink}</code><button className="budgy-button budgy-button--quiet" type="button" onClick={()=>void navigator.clipboard.writeText(inviteLink)}>Copy invitation</button></div>}<button className="budgy-button budgy-button--quiet" type="button" onClick={onRefreshMembers}>I’ve invited them — refresh members</button></div>}
    {candidate.ownerLabels.length>0&&<div className="budgy-owner-mapping">{candidate.ownerLabels.map((label)=><label className="budgy-field" key={label}><span>Old label: {label}</span><select value={mapping[label]??""} onChange={(event)=>setMapping((current)=>({...current,[label]:event.target.value}))}><option value="">Select the actual member</option>{household.members.map((member)=><option key={member.userId} value={member.userId}>{member.displayName}</option>)}</select></label>)}</div>}
    <div className="budgy-dialog-actions"><button className="budgy-button budgy-button--quiet" onClick={()=>void onSkip()}>Continue without old plan</button><button className="budgy-button budgy-button--primary" disabled={busy||candidate.ownerLabels.some((label)=>!mapping[label])} onClick={()=>{setBusy(true);void onImport(mapping).catch((error)=>onError(error instanceof Error?error.message:"Import failed safely; your local data is unchanged.")).finally(()=>setBusy(false));}}>Import mapped plan</button></div>
  </section></main>;
};

export default LegacyImport;
