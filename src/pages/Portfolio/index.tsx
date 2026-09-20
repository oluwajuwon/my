import React from "react";
import WorkList from "../../components/WorkList";
import { archivedProjects, featuredProjects } from "./projects";

const Portfolio: React.FC = () => (
  <main className="page">
    <header className="page-intro">
      <div className="site-container">
        <p className="page-kicker">Selected projects</p>
        <h1 className="page-title">Work</h1>
        <p className="page-lede">Products and engineering projects I’ve worked on, with an emphasis on the problem and the work behind it.</p>
      </div>
    </header>
    <section className="section">
      <div className="site-container">
        <div className="section-header"><h2 className="section-title">Selected work</h2></div>
        <WorkList projects={featuredProjects} />
      </div>
    </section>
    <section className="section">
      <div className="site-container">
        <div className="section-header"><div><p className="page-kicker">Archive</p><h2 className="section-title">Earlier work</h2></div></div>
        <WorkList projects={archivedProjects} compact />
      </div>
    </section>
  </main>
);

export default Portfolio;
