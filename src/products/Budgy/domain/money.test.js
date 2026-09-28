import{formatMoneyInput,parseMoneyInput,sanitizeMoneyEditingInput}from"./money";

it.each([
  ["",0],["0",0],["25",2500],["25.5",2550],["25.50",2550],["£1,250.50",125050],[" 1,250.50 ",125050],["1.239",124],["-12.50",-1250],
])("parses %s into integer pence",(input,expected)=>expect(parseMoneyInput(input)).toBe(expected));

it("formats committed currency without changing the integer domain value",()=>{
  expect(formatMoneyInput(125000)).toBe("1,250.00");
  expect(formatMoneyInput(2550)).toBe("25.50");
});

it.each([
  ["hello",""],
  ["25pounds","25"],
  ["£1,250.50","1250.50"],
  [" 1 250.50 ","1250.50"],
  ["12.3.4","12.34"],
])("keeps only a valid numeric editing value for %s",(input,expected)=>{
  expect(sanitizeMoneyEditingInput(input)).toBe(expected);
});
