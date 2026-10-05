import React from "react";
import { Route, Routes } from "react-router-dom";
import Shell from "../components/Shell";
import Family from "../pages/Family";
import Handover from "../pages/Handover";
import InsightDetail from "../pages/InsightDetail";
import Insights from "../pages/Insights";
import Needs from "../pages/Needs";
import Timeline from "../pages/Timeline";
import Today from "../pages/Today";

const NestProductRoutes: React.FC = () => <Routes><Route element={<Shell/>}><Route index element={<Today/>}/><Route path="timeline" element={<Timeline/>}/><Route path="insights" element={<Insights/>}/><Route path="insights/:insightId" element={<InsightDetail/>}/><Route path="family" element={<Family/>}/><Route path="needs" element={<Needs/>}/><Route path="handover" element={<Handover/>}/><Route path="*" element={<Today/>}/></Route></Routes>;
export default NestProductRoutes;
