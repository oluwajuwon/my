import React from "react";
import "./style.css";

const links = [
  ["Email", "mailto:hello@juwonlo.dev", "hello@juwonlo.dev"],
  ["LinkedIn", "https://www.linkedin.com/in/isaac-fagbohungbe-290a0b12b/", "View profile"],
  ["GitHub", "https://github.com/oluwajuwon", "@oluwajuwon"],
  ["Twitter / X", "https://x.com/oluwajuwon__", "@oluwajuwon__"],
];

const Contact: React.FC = () => (
  <main className="page contact-page">
    <div className="site-container">
      <p className="page-kicker">Contact</p>
      <h1 className="page-title">Let’s talk.</h1>
      <p className="page-lede">For engineering, product or collaboration enquiries, email is the best place to start.</p>
      <div className="contact-links">
        {links.map(([label, url, value]) => (
          <a key={label} href={url} target={url.startsWith("mailto:") ? undefined : "_blank"} rel={url.startsWith("mailto:") ? undefined : "noreferrer"}>
            <span>{label}</span><strong>{value}</strong><span aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
    </div>
  </main>
);

export default Contact;
