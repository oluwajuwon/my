import Header from "components/Header";
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import "./App.css";
import NavigationListener from "./components/NavigationListener";

export type ColorMode = "Light" | "Dark";

const App: React.FC = () => {
  const [colorMode, setColorMode] = useState<ColorMode>("Dark");

  const handleColorToggle = (e: React.MouseEvent<HTMLElement>): void => {
    e.preventDefault();
    setColorMode((prev) => (prev === "Light" ? "Dark" : "Light"));
  };

  const isDark = colorMode === "Dark";

  return (
    <div
      className={`App min-h-screen transition-colors duration-300 ${
        isDark ? "bg-[#0a0a0a] text-white" : "bg-white text-gray-900"
      }`}
    >
      <NavigationListener />
      <Header colorMode={colorMode} handleColorToggle={handleColorToggle} />
      <div className={isDark ? "theme-dark" : "theme-light"}>
        <Outlet context={{ colorMode, isDark }} />
      </div>
    </div>
  );
};

export default App;
