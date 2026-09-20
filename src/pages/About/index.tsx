import React from "react";
import "./style.css";

const focus = [
  ["Mobile engineering", "Building reliable, considered product experiences for mobile."],
  ["Application architecture", "Designing systems that remain understandable as products and teams evolve."],
  ["Performance & reliability", "Making production software responsive, resilient and observable."],
  ["Product engineering", "Balancing user needs, technical constraints and the realities of shipping."],
  ["Developer experience", "Improving the paths that help teams build, test and release with confidence."],
];

const About: React.FC = () => (
  <main className="page">
    <header className="page-intro">
      <div className="site-container about-intro">
        <div><p className="page-kicker">About</p><h1 className="page-title">Software is a product, not just an implementation.</h1></div>
        <div className="about-prose">
          <p>I’m a mobile-focused software engineer who believes great software should feel effortless, even when the systems underneath are anything but.</p>
          <p>I started in frontend and now think across architecture, performance, state management, CI/CD, developer experience and how those decisions translate into value for the people using a product.</p>
          <p>I work primarily with React Native and TypeScript. I enjoy untangling complex problems, simplifying messy flows and building foundations that hold up beyond the demo.</p>
        </div>
      </div>
    </header>
    <section className="section">
      <div className="site-container about-grid">
        <div><p className="page-kicker">Engineering focus</p><h2 className="section-title">The work around the work.</h2></div>
        <div className="about-focus">
          {focus.map(([title, description], index) => (
            <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{description}</p></div></article>
          ))}
        </div>
      </div>
    </section>
    <section className="section">
      <div className="site-container about-grid">
        <div><p className="page-kicker">Core technologies</p><h2 className="section-title">A focused toolkit.</h2></div>
        <ul className="technology-list"><li>React Native</li><li>TypeScript</li><li>React</li><li>Expo</li><li>Node.js</li></ul>
      </div>
    </section>
  </main>
);

export default About;
