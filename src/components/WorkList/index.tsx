import React from "react";
import { Link } from "react-router-dom";
import { Project } from "../../pages/Portfolio/types";
import "./style.css";

interface WorkListProps {
  projects: Project[];
  compact?: boolean;
}

const WorkList: React.FC<WorkListProps> = ({ projects, compact = false }) => (
  <div className={`work-list${compact ? " work-list--compact" : ""}`}>
    {projects.map((project, index) => (
      <article className="work-row" key={project.slug}>
        <p className="work-number">{String(index + 1).padStart(2, "0")}</p>
        {!compact && (
          <Link className="work-image-link" to={`/work/${project.slug}`} tabIndex={-1} aria-hidden="true">
            <img src={project.image} alt="" loading="lazy" />
          </Link>
        )}
        <div className="work-copy">
          <p className="work-category">{project.category} · {project.role}</p>
          <h3><Link to={`/work/${project.slug}`}>{project.name}</Link></h3>
          <p>{project.description}</p>
          <p className="work-tech">{project.technologies.join(" · ")}</p>
          <Link className="text-link" to={`/work/${project.slug}`} aria-label={`View ${project.name} case study`}>
            View project <span aria-hidden="true">→</span>
          </Link>
        </div>
      </article>
    ))}
  </div>
);

export default WorkList;
