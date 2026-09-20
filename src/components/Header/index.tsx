import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import "./style.css";

const navLinks = [
  { to: "/work", label: "Work" },
  { to: "/writing", label: "Writing" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setIsMenuOpen(false), [location.pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className={`site-header${isScrolled ? " site-header--scrolled" : ""}`}>
      <div className="site-container header-inner">
        <Link className="wordmark" to="/" aria-label="Juwonlo. home">
          Juwonlo<span className="brand-dot">.</span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => isActive ? "nav-link is-active" : "nav-link"}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="menu-button" aria-expanded={isMenuOpen} aria-controls="mobile-navigation" onClick={() => setIsMenuOpen((open) => !open)}>
          {isMenuOpen ? "Close" : "Menu"}
        </button>
      </div>
      <nav id="mobile-navigation" className={`mobile-nav${isMenuOpen ? " is-open" : ""}`} aria-label="Mobile navigation">
        <div className="site-container mobile-nav-inner">
          <NavLink to="/" className="mobile-nav-link">Home</NavLink>
          {navLinks.map((link) => <NavLink key={link.to} to={link.to} className="mobile-nav-link">{link.label}</NavLink>)}
        </div>
      </nav>
    </header>
  );
};

export default Header;
