import React, { useRef, useState } from "react";
import { isBudgyData, useBudgyStore } from "../store/BudgyStore";
import { Dialog } from "../components/Dialog";
import { BudgyData } from "../domain/types";
import { useAuth } from "../auth/AuthProvider";
import { useOnboarding } from "../application/OnboardingContext";
import { describeBudgyError } from "../application/errors";

const Settings: React.FC = () => {
  const { data, replaceData, resetData } = useBudgyStore();
  const { signOut } = useAuth();
  const { replay } = useOnboarding();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `budgy-household-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url);
    setMessage("Your Budgy data was exported.");
  };
  const importData = async (file?: File) => {
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isBudgyData(parsed)) throw new Error("Unsupported Budgy data file");
      const imported = parsed as BudgyData;
      if (!Array.isArray(imported.members)) throw new Error("This is a legacy export. Import it through the guided member-mapping flow instead.");
      const currentMemberIds = new Set(data.members.map((member) => member.id));
      if (imported.members.some((member) => !currentMemberIds.has(member.id))) throw new Error("This export belongs to a different household and cannot be imported without remapping its members.");
      imported.accounts ??= [];
      imported.incomeCategories ??= data.incomeCategories;
      replaceData(imported); setMessage("Import complete. Your local household data has been replaced.");
    } catch (error) { setMessage(describeBudgyError(error,"That file could not be imported.")); }
    if (fileRef.current) fileRef.current.value = "";
  };
  return <div className="budgy-product-page">
    <header className="budgy-product-header"><div><p className="budgy-eyebrow">Household</p><h1>Settings & data</h1><p>Manage your shared household, members and portable Budgy data.</p></div><button className="budgy-button budgy-button--quiet" type="button" onClick={() => void signOut()}>Sign out</button></header>
    {message && <div className="budgy-inline-notice" role="status">{message}<button type="button" onClick={() => setMessage("")}>×</button></div>}
    <div className="budgy-settings-grid"><section className="budgy-product-panel"><div className="budgy-settings-icon">?</div><h2>Help & onboarding</h2><p>Revisit the short guide to Budget, Money, transactions and monthly reports.</p><button className="budgy-button budgy-button--primary" type="button" onClick={replay}>Show Budgy walkthrough</button></section><section className="budgy-product-panel"><div className="budgy-settings-icon">⇩</div><h2>Export Budgy data</h2><p>Download every month, transaction, goal and scenario as a versioned JSON file.</p><button className="budgy-button budgy-button--quiet" type="button" onClick={exportData}>Export JSON</button></section><section className="budgy-product-panel"><div className="budgy-settings-icon">⇧</div><h2>Import Budgy data</h2><p>Restore a compatible schema-version 1 Budgy export to this household.</p><input ref={fileRef} className="budgy-visually-hidden" type="file" accept="application/json,.json" onChange={(event) => importData(event.target.files?.[0])} /><button className="budgy-button budgy-button--quiet" type="button" onClick={() => fileRef.current?.click()}>Choose JSON file</button></section></div>
    <section className="budgy-danger-zone"><div><p className="budgy-eyebrow">Danger zone</p><h2>Reset household data</h2><p>Permanently remove financial records while preserving household membership.</p></div><button className="budgy-button budgy-button--danger" type="button" onClick={() => setResetOpen(true)}>Reset household</button></section>
    <Dialog open={resetOpen} title="Reset all household data?" description="This cannot be undone unless you exported a backup first." onClose={() => { setResetOpen(false); setConfirmation(""); }}><div className="budgy-form"><label className="budgy-field"><span>Type RESET to confirm</span><input autoFocus value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label><div className="budgy-dialog-actions"><button className="budgy-button budgy-button--quiet" type="button" onClick={() => setResetOpen(false)}>Cancel</button><button className="budgy-button budgy-button--danger" disabled={confirmation !== "RESET"} type="button" onClick={() => { resetData(); setResetOpen(false); setConfirmation(""); setMessage("Household data was reset."); }}>Reset everything</button></div></div></Dialog>
  </div>;
};

export default Settings;
