import { createContext, useContext } from "react";
interface AccountValue { mode: "demo" | "account"; signOut(): Promise<void> }
const Context = createContext<AccountValue>({ mode: "demo", signOut: async () => undefined });
export const NestAccountProvider = Context.Provider;
export const useNestAccount = (): AccountValue => useContext(Context);
