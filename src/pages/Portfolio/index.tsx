import React from "react";
import ProfessionalWorkList from "../../components/ProfessionalWorkList";
import WorkList from "../../components/WorkList";
import { professionalWork } from "./professionalWork";
import { projects } from "./projects";

const Portfolio: React.FC = () => (
  <main className="page">
    <header className="page-intro">
      <div className="site-container">
        <p className="page-kicker">Professional experience</p>
        <h1 className="page-title">Work</h1>
        <p className="page-lede">A selection of products and systems I’ve worked on professionally.</p>
      </div>
    </header>
    <section className="section">
      <div className="site-container">
        <div className="section-header">
          <div>
            <p className="page-kicker">Current to oldest</p>
            <h2 className="section-title">Professional work</h2>
          </div>
        </div>
        <ProfessionalWorkList work={professionalWork} />
      </div>
    </section>
    <section className="section">
      <div className="site-container">
        <div className="section-header">
          <div><p className="page-kicker">Archive</p><h2 className="section-title">Earlier work</h2></div>
        </div>
        <WorkList projects={projects} compact />
      </div>
    </section>
  </main>
);

export default Portfolio;
