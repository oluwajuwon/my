import React from "react";
import { Link } from "react-router-dom";
import "./style.css";

const Footer: React.FC = () => (
  <footer className="site-footer">
    <div className="site-container footer-grid">
      <div>
        <p className="footer-name">Juwonlo<span className="brand-dot">.</span></p>
        <p className="footer-meta">Software Engineer<br />London, United Kingdom</p>
      </div>
      <nav className="footer-links" aria-label="Footer navigation">
        <a href="https://github.com/oluwajuwon" target="_blank" rel="noreferrer">GitHub ↗</a>
        <a href="https://www.linkedin.com/in/isaac-fagbohungbe-290a0b12b/" target="_blank" rel="noreferrer">LinkedIn ↗</a>
        <Link to="/writing">Writing</Link>
        <a href="mailto:hello@juwonlo.dev">Email ↗</a>
      </nav>
      <p className="footer-copyright">© {new Date().getFullYear()} Juwon Fagbohungbe</p>
    </div>
  </footer>
);

export default Footer;
