import {createContext,useContext} from "react";
export interface AccountValue{mode:"authenticated"|"demo";email?:string;firstName:string;lastName?:string;signOut():Promise<void>;deleteAccount():Promise<void>}
const Context=createContext<AccountValue|null>(null);
export const AccountProvider=Context.Provider;
export const useVelaAccount=()=>{const value=useContext(Context);if(!value)throw new Error("useVelaAccount must be used inside AccountProvider");return value;};
