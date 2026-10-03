import React,{useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {VelaAuthProvider} from "./auth/AuthProvider";
import {VelaBootstrap} from "./application/VelaBootstrap";
import VelaProductRoutes from "./application/VelaProductRoutes";
import {AccountProvider} from "./application/AccountContext";
import {isVelaSupabaseConfigured} from "./infrastructure/supabase/client";
import {VelaStoreProvider} from "./store/VelaStore";
import "./styles.css";
import "./auth/auth.css";

const DemoApp:React.FC<{leave():void}>=({leave})=><AccountProvider value={{mode:"demo",firstName:"Alex",signOut:async()=>leave(),deleteAccount:async()=>leave()}}><VelaStoreProvider><VelaProductRoutes/></VelaStoreProvider></AccountProvider>;
const VelaApp:React.FC=()=>{const[demo,setDemo]=useState(()=>sessionStorage.getItem("vela.explicitDemo")==="true");useEffect(()=>{const previous=document.title;document.title="Vela — Adaptive fitness coaching";return()=>{document.title=previous;};},[]);if(demo)return <DemoApp leave={()=>{sessionStorage.removeItem("vela.explicitDemo");setDemo(false);}}/>;if(!isVelaSupabaseConfigured)return <main className="vela-setup"><div><div className="vela-auth-brand"><i>v</i><strong>vela</strong></div><p className="vela-eyebrow">Development setup</p><h1>Connect Vela to Supabase</h1><p>Add the public project URL and anonymous key. Never place a service-role key in the browser.</p><code>REACT_APP_SUPABASE_URL_VELA<br/>REACT_APP_SUPABASE_ANON_KEY_VELA</code><div className="vela-setup-actions"><button onClick={()=>{sessionStorage.setItem("vela.explicitDemo","true");setDemo(true);}}>Enter explicit demo mode</button><Link to="/">Back to portfolio</Link></div></div></main>;return <VelaAuthProvider><VelaBootstrap/></VelaAuthProvider>;};
export default VelaApp;
