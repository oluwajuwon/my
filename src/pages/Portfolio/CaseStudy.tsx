import React from "react";
import { Link, useParams } from "react-router-dom";
import WorkGallery from "../../components/WorkGallery";
import { getProfessionalWorkBySlug } from "./professionalWork";
import { getProjectBySlug } from "./projects";
import { WorkExperience } from "./types";
import "./case-study.css";

interface ContentSectionProps {
  heading: string;
  paragraphs?: string[];
}

const ContentSection: React.FC<ContentSectionProps> = ({ heading, paragraphs }) => {
  if (!paragraphs?.length) return null;

  return (
    <section className="section">
      <div className="site-container case-section">
        <h2>{heading}</h2>
        <div>{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      </div>
    </section>
  );
};

const ProfessionalCaseStudy: React.FC<{ work: WorkExperience }> = ({ work }) => {
  const facts = [
    work.role && ["Role", work.role],
    work.period && ["Period", work.period],
    work.location && ["Location", work.location],
    work.product && ["Product", work.product],
  ].filter(Boolean) as string[][];

  return (
    <main className="page case-study">
      <header className="case-hero">
        <div className="site-container">
          <Link className="case-back" to="/work">← Work</Link>
          <div className="case-kicker">
            <p className="page-kicker">Professional work</p>
            {work.current && <p className="page-kicker current-marker">Current</p>}
          </div>
          <h1 className="page-title">{work.company}</h1>
          {work.summary && <p className="page-lede">{work.summary}</p>}
          {facts.length > 0 && (
            <dl className="case-facts">
              {facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
            </dl>
          )}
        </div>
      </header>

      <ContentSection heading="Overview" paragraphs={work.overview} />
      <ContentSection heading="My role" paragraphs={work.roleSummary} />
      <ContentSection heading="The product" paragraphs={work.productDescription} />
      <ContentSection heading="The challenge" paragraphs={work.challenge} />
      <ContentSection heading="What I worked on" paragraphs={work.whatIWorkedOn} />
      <ContentSection heading="Engineering" paragraphs={work.engineering} />
      <ContentSection heading="Selected problems" paragraphs={work.selectedProblems} />
      <ContentSection heading="Impact" paragraphs={work.impact} />
      <ContentSection heading="Technology" paragraphs={work.technologies} />

      {work.sections?.map((section) => (
        <ContentSection heading={section.heading} paragraphs={section.body} key={section.heading} />
      ))}

      {work.images && work.images.length > 0 && (
        <section className="section">
          <div className="site-container case-gallery-layout">
            <h2>Product screens</h2>
            <WorkGallery images={work.images} label={`${work.company} screenshots`} />
          </div>
        </section>
      )}

      <nav className="section" aria-label="Project navigation">
        <div className="site-container"><Link className="text-link" to="/work">View all work <span aria-hidden="true">→</span></Link></div>
      </nav>
    </main>
  );
};

const CaseStudy: React.FC = () => {
  const { slug } = useParams();
  const professional = getProfessionalWorkBySlug(slug);
  const project = getProjectBySlug(slug);

  if (professional) return <ProfessionalCaseStudy work={professional} />;

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
      <ContentSection heading="Overview" paragraphs={[project.description]} />
      {project.sections?.map((section) => (
        <ContentSection heading={section.heading} paragraphs={section.body} key={section.heading} />
      ))}
      <nav className="section" aria-label="Project navigation">
        <div className="site-container"><Link className="text-link" to="/work">View all work <span aria-hidden="true">→</span></Link></div>
      </nav>
    </main>
  );
};

export default CaseStudy;
