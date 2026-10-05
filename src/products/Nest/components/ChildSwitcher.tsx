import React, { useState } from "react";
import { childAge } from "../domain/insights";
import { useNestStore } from "../store/NestStore";

const ChildSwitcher: React.FC = () => {
  const { data, selectedChild, selectChild, addChild } = useNestStore();
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false); const [name, setName] = useState(""); const [birthday, setBirthday] = useState("");
  return <div className="nest-child-switcher-wrap">
    <button className="nest-child-switcher" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
      <span className="nest-child-avatar">{selectedChild.initials}</span><span><strong>{selectedChild.name}</strong><small>{childAge(selectedChild)}</small></span><span aria-hidden="true">⌄</span>
    </button>
    {open && <div className="nest-child-menu" role="menu">
      {data.children.map((child) => <button type="button" role="menuitem" key={child.id} onClick={() => { selectChild(child.id); setOpen(false); }}><span className="nest-child-avatar">{child.initials}</span><span><strong>{child.id === selectedChild.id ? "✓ " : ""}{child.name}</strong><small>{childAge(child)}</small></span></button>)}
      {adding ? <form className="nest-add-child-form" onSubmit={(event) => { event.preventDefault(); if (name.trim() && birthday) { addChild(name, birthday); setAdding(false); setOpen(false); setName(""); setBirthday(""); } }}><input aria-label="Child name" placeholder="Child’s name" value={name} onChange={(event) => setName(event.target.value)}/><input aria-label="Date of birth" type="date" max={new Date().toISOString().slice(0,10)} value={birthday} onChange={(event) => setBirthday(event.target.value)}/><button type="submit" disabled={!name.trim() || !birthday}>Add child</button></form> : <button type="button" className="nest-add-child" onClick={() => setAdding(true)}>+ Add child</button>}
    </div>}
  </div>;
};
export default ChildSwitcher;
