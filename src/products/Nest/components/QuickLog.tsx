import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NEST_BASE_PATH } from "../config/product";
import { getAgeRelevantActions, QuickActionId } from "../domain/actions";
import { findRecentMedicineLog } from "../domain/medicine";
import { useNestStore } from "../store/NestStore";
import Icon, { IconName } from "./Icon";

type Step = "main" | "feed" | "bottle" | "breast" | "nappy" | "more" | "medicine" | "medicine-warning" | "temperature" | "pump" | "tummyTime" | "note";
export type QuickLogStart = "main" | "feed" | "nappy" | "medicine";
const amounts = [60, 90, 120, 150, 180];
const actionMeta: Record<QuickActionId, { label: string; icon: IconName; note: string }> = {
  feed: { label: "Feed", icon: "feed", note: "Breast or bottle" }, sleep: { label: "Sleep", icon: "sleep", note: "Start now" }, nappy: { label: "Nappy", icon: "nappy", note: "Fast log" },
  medicine: { label: "Medicine", icon: "medicine", note: "Configured doses" }, temperature: { label: "Temperature", icon: "temperature", note: "Record a reading" }, pump: { label: "Pump", icon: "pump", note: "Quick duration" },
  meal: { label: "Meal", icon: "feed", note: "Food & allergens" }, tummyTime: { label: "Tummy time", icon: "clock", note: "Quick duration" }, bath: { label: "Bath", icon: "bath", note: "Log now" }, mood: { label: "Mood", icon: "sparkle", note: "How they seem" }, note: { label: "Note", icon: "note", note: "Remember something" }, purchase: { label: "Purchase", icon: "cart", note: "Supplies & spending" }, potty: { label: "Potty", icon: "nappy", note: "Coming later" }, activity: { label: "Activity", icon: "sparkle", note: "Coming later" },
};

const QuickLog: React.FC<{ open: boolean; onClose(): void; startAt?: QuickLogStart }> = ({ open, onClose, startAt = "main" }) => {
  const { data, selectedChild, log } = useNestStore();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("main");
  const [milk, setMilk] = useState<"formula" | "expressed">("formula");
  const [selectedMedicine, setSelectedMedicine] = useState<string | null>(null);
  const [temperature, setTemperature] = useState(36.8);
  const [note, setNote] = useState("");
  const config = getAgeRelevantActions(selectedChild);
  const medicines = data.medicines.filter((item) => item.childId === selectedChild.id && item.active);
  useEffect(() => { if (open) setStep(startAt); }, [open, startAt]);
  const close = () => { setStep("main"); setMilk("formula"); setSelectedMedicine(null); setTemperature(36.8); setNote(""); onClose(); };
  const done = (draft: Parameters<typeof log>[0]) => { log(draft); close(); };
  const chooseMedicine = (medicineId: string) => { const recent = findRecentMedicineLog(data.activities, medicineId, selectedChild.id); setSelectedMedicine(medicineId); if (recent) setStep("medicine-warning"); else done({ type: "medicine", medicineId }); };
  const chooseMore = (id: QuickActionId) => {
    if (id === "medicine" || id === "temperature" || id === "pump" || id === "tummyTime" || id === "note") setStep(id);
    else if (id === "bath") done({ type: "bath" });
    else if (id === "purchase") { close(); navigate(`${NEST_BASE_PATH}/needs`); }
  };
  if (!open) return null;
  const title: Record<Step, string> = { main: `What’s happening with ${selectedChild.name}?`, feed: "Choose a feed", bottle: "How much?", breast: "Which side?", nappy: "What kind?", more: "More care actions", medicine: "Which medicine?", "medicine-warning": "Already logged recently", temperature: "Record temperature", pump: "How long?", tummyTime: "How long?", note: "Add a note" };
  const tile = (label: string, icon: IconName, onClick: () => void, help?: string) => <button type="button" className="nest-action-tile" onClick={onClick}><span><Icon name={icon}/></span><strong>{label}</strong>{help && <small>{help}</small>}</button>;
  return <div className="nest-sheet-layer" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) close(); }}>
    <section className="nest-sheet" role="dialog" aria-modal="true" aria-labelledby="quick-log-title">
      <div className="nest-sheet-handle"/><header><div>{step !== "main" && <button type="button" className="nest-back" aria-label="Back" onClick={() => setStep(step === "bottle" || step === "breast" ? "feed" : step === "medicine-warning" ? "medicine" : step === "more" ? "main" : "more")}>←</button>}<p>QUICK LOG</p><h2 id="quick-log-title">{title[step]}</h2></div><button type="button" className="nest-close" aria-label="Close quick log" onClick={close}><Icon name="close"/></button></header>
      {step === "main" && <div className="nest-action-grid">{tile("Feed", "feed", () => setStep("feed"), "Breast or bottle")}{tile("Sleep", "sleep", () => done({ type: "sleep" }), "Start now")}{tile("Nappy", "nappy", () => setStep("nappy"), "Fast log")}{tile("More", "more", () => setStep("more"), "Medicine & more")}</div>}
      {step === "feed" && <div className="nest-action-grid nest-two">{tile("Breastfeed", "feed", () => setStep("breast"), "Start timer")}{tile("Bottle", "feed", () => setStep("bottle"), "Quick amount")}</div>}
      {step === "breast" && <div className="nest-choice-grid"><button onClick={() => done({ type: "breastfeed", side: "left" })} type="button"><strong>Left</strong><small>Start timer</small></button><button onClick={() => done({ type: "breastfeed", side: "right" })} type="button"><strong>Right</strong><small>Start timer</small></button></div>}
      {step === "bottle" && <><div className="nest-segment"><button className={milk === "formula" ? "is-active" : ""} type="button" onClick={() => setMilk("formula")}>Formula</button><button className={milk === "expressed" ? "is-active" : ""} type="button" onClick={() => setMilk("expressed")}>Expressed</button></div><div className="nest-amount-grid">{amounts.map((amount) => <button key={amount} type="button" onClick={() => done({ type: "bottle", amountMl: amount, milk })}><strong>{amount}</strong><small>ml</small></button>)}</div></>}
      {step === "nappy" && <div className="nest-choice-grid">{([['wet','Wet'],['dirty','Dirty'],['both','Wet + dirty'],['dry','Dry']] as const).map(([kind, label]) => <button key={kind} type="button" onClick={() => done({ type: "nappy", kind })}><strong>{label}</strong><small>Log now</small></button>)}</div>}
      {step === "more" && <div className="nest-more-action-grid">{config.more.map((id) => { const item = actionMeta[id]; return <button type="button" key={id} onClick={() => chooseMore(id)}><span><Icon name={item.icon}/></span><strong>{item.label}</strong><small>{item.note}</small></button>; })}</div>}
      {step === "medicine" && <div className="nest-choice-list">{medicines.length ? medicines.map((medicine) => <button type="button" key={medicine.id} onClick={() => chooseMedicine(medicine.id)}><span><Icon name="medicine"/></span><div><strong>{medicine.name}</strong><small>{medicine.defaultDose} {medicine.unit} · {medicine.schedule === "daily" ? "Daily" : "As needed"}</small></div><b>Log now</b></button>) : <p className="nest-sheet-empty">No medicines or supplements are being tracked for {selectedChild.name}.</p>}</div>}
      {step === "medicine-warning" && selectedMedicine && (() => { const medicine = medicines.find((item) => item.id === selectedMedicine); const recent = findRecentMedicineLog(data.activities, selectedMedicine, selectedChild.id); const user = data.users.find((item) => item.id === recent?.createdBy); return <div className="nest-duplicate-warning"><span><Icon name="medicine"/></span><p><strong>{medicine?.name} was logged by {user?.displayName ?? "a parent"} at {recent ? new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date(recent.occurredAt)) : "recently"}.</strong>This is a duplicate check, not dosing advice.</p><button type="button" onClick={() => done({ type: "medicine", medicineId: selectedMedicine })}>Log another dose anyway</button></div>; })()}
      {step === "temperature" && <div className="nest-number-stepper"><button type="button" aria-label="Decrease temperature" onClick={() => setTemperature((value) => Math.round((value - .1) * 10) / 10)}>−</button><strong>{temperature.toFixed(1)}<small>°C</small></strong><button type="button" aria-label="Increase temperature" onClick={() => setTemperature((value) => Math.round((value + .1) * 10) / 10)}>+</button><button className="nest-sheet-primary" type="button" onClick={() => done({ type: "temperature", valueCelsius: temperature })}>Log temperature</button></div>}
      {(step === "pump" || step === "tummyTime") && <div className="nest-choice-grid">{[5,10,15,20].map((minutes) => <button type="button" key={minutes} onClick={() => done(step === "pump" ? { type: "pump", durationMinutes: minutes } : { type: "tummyTime", durationMinutes: minutes })}><strong>{minutes} min</strong><small>Log now</small></button>)}</div>}
      {step === "note" && <div className="nest-note-entry"><textarea autoFocus value={note} onChange={(event) => setNote(event.target.value)} placeholder={`What should your family know about ${selectedChild.name}?`} aria-label="Note"/><button type="button" disabled={!note.trim()} onClick={() => done({ type: "note", text: note.trim() })}>Save note</button></div>}
    </section>
  </div>;
};
export default QuickLog;
