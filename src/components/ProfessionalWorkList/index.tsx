import React from "react";
import { Link } from "react-router-dom";
import { WorkExperience } from "../../pages/Portfolio/types";
import WorkGallery from "../WorkGallery";
import "./style.css";

interface ProfessionalWorkListProps {
  work: WorkExperience[];
  preview?: boolean;
}

const ProfessionalWorkList: React.FC<ProfessionalWorkListProps> = ({
  work,
  preview = false,
}) => (
  <div className={preview ? "professional-list professional-list--preview" : "professional-list"}>
    {work.map((item, index) => {
      const images = item.images ?? [];
      const details = [item.role, item.period, item.location].filter(Boolean);

      return (
        <article className="professional-row" key={item.slug}>
          <div className="professional-meta">
            <span className="professional-number">{String(index + 1).padStart(2, "0")}</span>
            {(item.category || item.product) && (
              <p className="professional-category">
                {[item.product, item.category].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>

          {item.current && <p className="professional-status">Current</p>}

          <div className="professional-copy">
            <h3>
              <Link to={`/work/${item.slug}`}>{item.company}</Link>
            </h3>
            {details.length > 0 && <p className="professional-details">{details.join(" · ")}</p>}
            {!preview && item.summary && <p className="professional-summary">{item.summary}</p>}
            {!preview && item.focus && item.focus.length > 0 && (
              <ul className="professional-focus" aria-label="Engineering focus">
                {item.focus.map((focus) => <li key={focus}>{focus}</li>)}
              </ul>
            )}
            {!preview && item.technologies && item.technologies.length > 0 && (
              <p className="professional-technologies">{item.technologies.join(" · ")}</p>
            )}
            <Link className="text-link" to={`/work/${item.slug}`}>
              {preview ? "View work" : "Read more"} <span aria-hidden="true">→</span>
            </Link>
          </div>

          {!preview && images.length > 0 && (
            <WorkGallery images={images} compact label={`${item.company} screenshots`} />
          )}
        </article>
      );
    })}
  </div>
);

export default ProfessionalWorkList;
