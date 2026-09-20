import React from "react";
import { Link } from "react-router-dom";
import ArticleList from "../../components/ArticleList";
import WorkList from "../../components/WorkList";
import { useMediumPosts } from "../../hooks/useMediumPosts";
import { featuredProjects } from "../Portfolio/projects";
import "./style.css";

const focusAreas = [
  ["01", "Mobile engineering", "Building thoughtful product experiences for mobile, with React Native and TypeScript at the core."],
  ["02", "Application architecture", "Creating maintainable systems, clear boundaries and foundations that support product change."],
  ["03", "Performance & reliability", "Treating responsiveness, resilience and production behaviour as part of the product."],
  ["04", "Product engineering", "Connecting technical decisions to the people using the software and the teams shipping it."],
];

const NewHome: React.FC = () => {
  const { posts, loading, error } = useMediumPosts();

  return (
    <main className="page home-page">
      <section className="home-hero">
        <div className="site-container">
          <p className="page-kicker">Juwon Fagbohungbe · London, United Kingdom</p>
          <h1 className="display-title">I build mobile products and the systems behind them.</h1>
          <div className="hero-lower">
            <p>Software engineer focused on React Native, TypeScript, application architecture, performance and product engineering.</p>
            <div className="hero-actions">
              <Link className="text-link" to="/work">View selected work <span aria-hidden="true">→</span></Link>
              <Link className="text-link text-link--muted" to="/about">About me <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="site-container">
          <div className="section-header">
            <div><p className="page-kicker">Selected work</p><h2 className="section-title">Products and platforms</h2></div>
            <Link className="text-link" to="/work">All work <span aria-hidden="true">→</span></Link>
          </div>
          <WorkList projects={featuredProjects} />
        </div>
      </section>

      <section className="section">
        <div className="site-container focus-layout">
          <div><p className="page-kicker">Engineering focus</p><h2 className="section-title">Beyond implementation.</h2></div>
          <div className="focus-list">
            {focusAreas.map(([number, title, description]) => (
              <article className="focus-row" key={number}>
                <span>{number}</span>
                <div><h3>{title}</h3><p>{description}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="site-container">
          <div className="section-header">
            <div><p className="page-kicker">Writing</p><h2 className="section-title">Notes from the work</h2></div>
            <Link className="text-link" to="/writing">View all writing <span aria-hidden="true">→</span></Link>
          </div>
          {loading && <p className="status-message" role="status">Loading recent writing…</p>}
          {error && <p className="status-message">Writing is unavailable right now. The rest of the site is still here.</p>}
          {!loading && !error && posts.length === 0 && <p className="status-message">No articles to show yet.</p>}
          {!error && posts.length > 0 && <ArticleList posts={posts} limit={3} />}
        </div>
      </section>

      <section className="section">
        <div className="site-container about-preview">
          <p className="page-kicker">About</p>
          <div>
            <h2 className="section-title">Engineering with the whole product in view.</h2>
            <p>I’m a mobile-focused software engineer. I care about architecture, performance, developer experience and the small decisions that make software feel considered.</p>
            <Link className="text-link" to="/about">More about me <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      <section className="home-contact">
        <div className="site-container">
          <p className="page-kicker">Contact</p>
          <h2>Have a product or engineering problem worth solving?</h2>
          <a className="text-link" href="mailto:hello@juwonlo.dev">Let’s talk <span aria-hidden="true">↗</span></a>
        </div>
      </section>
    </main>
  );
};

export default NewHome;
