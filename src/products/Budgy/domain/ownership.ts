import { HOUSEHOLD_OWNER, HouseholdMemberIdentity, Owner } from "./types";

export const legacyOwner = (label: string) => `legacy:${label}`;
export const legacyOwnerLabel = (owner: Owner) => owner.startsWith("legacy:") ? owner.slice(7) : owner;

export const ownerLabel = (owner: Owner, members: HouseholdMemberIdentity[]) => {
  if (owner === HOUSEHOLD_OWNER || owner === "Household") return "Household";
  return members.find((member) => member.id === owner)?.displayName ?? legacyOwnerLabel(owner);
};

export const ownerOptions = (members: HouseholdMemberIdentity[]) => [
  { value: HOUSEHOLD_OWNER, label: "Household" },
  ...members.map((member) => ({ value: member.id, label: member.displayName })),
];
