import { goalBalance, goalContributions, goalContributionsForMonth } from "./goals";

const goal={id:"home",name:"Home",icon:"⌂",targetAmount:2500000,currentAmount:100000,targetDate:"2027-01-01",monthlyContribution:50000,fundingAccountId:"savings"};
const transactions=[
  {id:"one",type:"transfer",amount:25000,description:"Goal contribution",owner:"household",date:"2026-09-01",accountId:"current",destinationAccountId:"savings",savingsGoalId:"home"},
  {id:"two",type:"transfer",amount:30000,description:"Goal contribution",owner:"household",date:"2026-10-01",accountId:"current",destinationAccountId:"savings",savingsGoalId:"home"},
  {id:"other",type:"transfer",amount:90000,description:"Other transfer",owner:"household",date:"2026-09-01",accountId:"current",destinationAccountId:"savings"},
];

it("derives goal progress from its starting amount and tagged transfers",()=>{
  expect(goalContributions("home",transactions)).toBe(55000);
  expect(goalBalance(goal,transactions)).toBe(155000);
  expect(goalContributionsForMonth("home",transactions,"2026-09")).toBe(25000);
});
