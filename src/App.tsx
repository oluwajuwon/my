import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import NavigationListener from "./components/NavigationListener";
import "./App.css";

const pageMeta: Record<string, { title: string; description: string }> = {
  "/": { title: "Juwonlo. — Juwon Fagbohungbe, Software Engineer", description: "Juwon Fagbohungbe is a software engineer focused on mobile products, application architecture, performance and reliable product engineering." },
  "/work": { title: "Work — Juwonlo.", description: "Selected products and engineering projects by Juwon Fagbohungbe." },
  "/portfolio": { title: "Work — Juwonlo.", description: "Selected products and engineering projects by Juwon Fagbohungbe." },
  "/writing": { title: "Writing — Juwonlo.", description: "Engineering writing by Juwon Fagbohungbe on software, mobile development and lessons learned." },
  "/stories": { title: "Writing — Juwonlo.", description: "Engineering writing by Juwon Fagbohungbe on software, mobile development and lessons learned." },
  "/about": { title: "About — Juwonlo.", description: "About Juwon Fagbohungbe, a mobile-focused software engineer." },
  "/contact": { title: "Contact — Juwonlo.", description: "Get in touch with Juwon Fagbohungbe." },
};

const App: React.FC = () => {
  const location = useLocation();
  const isAdukeRoute = location.pathname.startsWith("/aduke");

  useEffect(() => {
    const meta = location.pathname.startsWith("/work/") ? pageMeta["/work"] : pageMeta[location.pathname] ?? pageMeta["/"];
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", meta.description);
  }, [location.pathname]);

  return (
    <div className="site-shell">
      <NavigationListener />
      <Header />
      <Outlet />
      {!isAdukeRoute && <Footer />}
    </div>
  );
};

export default App;
