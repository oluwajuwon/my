import React from "react";
import { Link, useParams } from "react-router-dom";
import { getProjectBySlug } from "./projects";
import "./case-study.css";

const CaseStudy: React.FC = () => {
  const { slug } = useParams();
  const project = getProjectBySlug(slug);

  if (!project) {
    return (
      <main className="page">
        <div className="site-container missing-project">
          <p className="page-kicker">Project not found</p>
          <h1 className="page-title">There’s nothing at this address.</h1>
          <Link className="text-link" to="/work">Return to work <span aria-hidden="true">→</span></Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page case-study">
      <header className="case-hero">
        <div className="site-container">
          <Link className="case-back" to="/work">← Work</Link>
          <p className="page-kicker">{project.category}</p>
          <h1 className="page-title">{project.name}</h1>
          <p className="page-lede">{project.description}</p>
          <dl className="case-facts">
            <div><dt>Role</dt><dd>{project.role}</dd></div>
            {project.period && <div><dt>Period</dt><dd>{project.period}</dd></div>}
            <div><dt>Technology</dt><dd>{project.technologies.join(", ")}</dd></div>
          </dl>
        </div>
      </header>
      <div className="site-container case-image"><img src={project.image} alt={`${project.name} project interface`} /></div>
      <section className="section">
        <div className="site-container case-section">
          <h2>Overview</h2>
          <p>{project.description}</p>
        </div>
      </section>
      {project.sections?.map((section) => (
        <section className="section" key={section.heading}>
          <div className="site-container case-section">
            <h2>{section.heading}</h2>
            <div>{section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          </div>
        </section>
      ))}
      <nav className="section" aria-label="Project navigation">
        <div className="site-container"><Link className="text-link" to="/work">View all work <span aria-hidden="true">→</span></Link></div>
      </nav>
    </main>
  );
};

export default CaseStudy;
