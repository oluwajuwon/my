import React from "react";
import { renderToString } from "react-dom/server";
import { MoneyInput } from "./Controls";

it("renders formatted four-figure currency without an incompatible native pattern",()=>{
  const markup=renderToString(<MoneyInput label="Opening debt" value={199702} onChange={()=>{}}/>);
  expect(markup).toContain('value="1,997.02"');
  expect(markup).not.toContain("pattern=");
  expect(markup).toContain('inputMode="decimal"');
  expect(markup).toContain('type="text"');
});
