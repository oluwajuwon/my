import React, { useState } from "react";
import { childAge } from "../domain/insights";
import { useNestStore } from "../store/NestStore";

const ChildSwitcher: React.FC = () => {
  const { data, selectedChild, selectChild } = useNestStore();
  const [open, setOpen] = useState(false);
  return <div className="nest-child-switcher-wrap">
    <button className="nest-child-switcher" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
      <span className="nest-child-avatar">{selectedChild.initials}</span><span><strong>{selectedChild.name}</strong><small>{childAge(selectedChild)}</small></span><span aria-hidden="true">⌄</span>
    </button>
    {open && <div className="nest-child-menu" role="menu">
      {data.children.map((child) => <button type="button" role="menuitem" key={child.id} onClick={() => { selectChild(child.id); setOpen(false); }}><span className="nest-child-avatar">{child.initials}</span><span><strong>{child.id === selectedChild.id ? "✓ " : ""}{child.name}</strong><small>{childAge(child)}</small></span></button>)}
      <button type="button" className="nest-add-child" onClick={() => setOpen(false)}>+ Add child <small>Coming soon</small></button>
    </div>}
  </div>;
};
export default ChildSwitcher;
