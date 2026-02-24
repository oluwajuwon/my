import React, { useState } from "react";
import { FaBars, FaXmark } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { ColorMode } from "../../types/theme";

interface HeaderProps {
  colorMode: ColorMode;
  handleColorToggle: (e: React.MouseEvent<HTMLElement>) => void;
}

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/stories", label: "Stories" },
  { to: "/contact", label: "Contact" },
];

const Header: React.FC<HeaderProps> = ({ colorMode, handleColorToggle }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isDark = colorMode === "Dark";

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      {/* Desktop Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 hidden md:block">
        <div
          className={`absolute inset-0 blur-[120px] opacity-30 transition-all duration-500 ${
            isDark
              ? "bg-gradient-to-r from-cyan-400/10 via-sky-400/10 to-blue-400/10"
              : "bg-gradient-to-r from-cyan-400/5 via-sky-400/5 to-blue-400/5"
          }`}
        />
        <div
          className={`flex flex-row backdrop-blur-xl max-w-lg justify-evenly mx-auto px-4 py-2 rounded-full mt-6 shadow-xl transition-all duration-500 ${
            isDark
              ? "bg-[#0a0a0a]/70 border border-white/10 shadow-black/20 hover:bg-[#0a0a0a]/80 hover:border-white/20"
              : "bg-white/70 border border-gray-200/50 shadow-gray-200/50 hover:bg-white/80 hover:border-gray-300"
          }`}
        >
          <nav className="flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-full transition-all duration-300 relative group/link text-sm backdrop-blur-md ${
                  isDark
                    ? "text-white/70 hover:text-white hover:bg-white/[0.07]"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <span className="relative z-10">{link.label}</span>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/10 to-sky-400/10 opacity-0 group-hover/link:opacity-100 transition-all duration-300 blur-sm" />
              </Link>
            ))}
            <button
              onClick={handleColorToggle}
              className={`ml-2 p-1.5 rounded-full transition-all duration-300 relative group/theme text-sm backdrop-blur-md ${
                isDark ? "hover:bg-white/[0.07]" : "hover:bg-gray-100"
              }`}
            >
              <span className="relative z-10">
                {colorMode === "Dark" ? "☀️" : "🌙"}
              </span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/10 to-sky-400/10 opacity-0 group-hover/theme:opacity-100 transition-all duration-300 blur-sm" />
            </button>
          </nav>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50">
        {/* Mobile Header Bar */}
        <div
          className={`flex items-center justify-between px-4 py-3 backdrop-blur-xl ${
            isDark
              ? "bg-[#0a0a0a]/90 border-b border-white/10"
              : "bg-white/90 border-b border-gray-200"
          }`}
        >
          <Link
            to="/"
            className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            JF<span className="text-[#4ad8fc]">.</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleColorToggle}
              className={`p-2 rounded-full transition-all duration-300 ${
                isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
              }`}
            >
              {colorMode === "Dark" ? "☀️" : "🌙"}
            </button>
            <button
              onClick={toggleMenu}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isDark
                  ? "text-white hover:bg-white/10"
                  : "text-gray-900 hover:bg-gray-100"
              }`}
            >
              {isMenuOpen ? <FaXmark size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 top-[57px] transition-all duration-300 ${
            isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 ${isDark ? "bg-black/80" : "bg-white/80"} backdrop-blur-md`}
            onClick={closeMenu}
          />

          {/* Menu Content */}
          <nav
            className={`relative flex flex-col items-center pt-8 gap-2 ${
              isMenuOpen ? "animate-fade-in" : ""
            }`}
          >
            {navLinks.map((link, index) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={closeMenu}
                className={`w-4/5 text-center py-4 rounded-xl text-lg font-medium transition-all duration-300 border ${
                  isDark
                    ? "text-white border-white/10 hover:border-[#4ad8fc]/50 hover:text-[#4ad8fc]"
                    : "text-gray-900 border-gray-200 hover:border-[#4ad8fc]/50 hover:text-[#4ad8fc]"
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header;
