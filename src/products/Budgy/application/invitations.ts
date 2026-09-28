import { householdRepository } from "../repositories/householdRepository";

const hex = (bytes: Uint8Array) => Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0")).join("");
const hash = async (value: string) => hex(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))));

export const createHouseholdInvitation = async (householdId: string, email: string) => {
  const token = hex(crypto.getRandomValues(new Uint8Array(32)));
  await householdRepository.createInvite(householdId, email, await hash(token));
  return `${window.location.origin}/budgy#invite=${token}`;
};
