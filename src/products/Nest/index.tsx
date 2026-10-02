import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Shell from "./components/Shell";
import { productConfig } from "./config/product";
import Family from "./pages/Family";
import Insights from "./pages/Insights";
import Timeline from "./pages/Timeline";
import Today from "./pages/Today";
import Needs from "./pages/Needs";
import Handover from "./pages/Handover";
import { NestStoreProvider } from "./store/NestStore";
import "./styles.css";

const NestApp: React.FC = () => {
  useEffect(() => {
    const previous = document.title;
    document.title = `${productConfig.name} — ${productConfig.tagline}`;
    return () => { document.title = previous; };
  }, []);
  return <NestStoreProvider><Routes><Route element={<Shell/>}><Route index element={<Today/>}/><Route path="timeline" element={<Timeline/>}/><Route path="insights" element={<Insights/>}/><Route path="family" element={<Family/>}/><Route path="needs" element={<Needs/>}/><Route path="handover" element={<Handover/>}/><Route path="*" element={<Today/>}/></Route></Routes></NestStoreProvider>;
};
export default NestApp;
