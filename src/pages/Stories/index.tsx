import React from "react";
import ArticleList from "../../components/ArticleList";
import { useMediumPosts } from "../../hooks/useMediumPosts";

const Stories: React.FC = () => {
  const { posts, loading, error } = useMediumPosts();

  return (
    <main className="page">
      <header className="page-intro">
        <div className="site-container">
          <p className="page-kicker">Medium archive</p>
          <h1 className="page-title">Writing</h1>
          <p className="page-lede">Notes on software engineering, mobile development and things I’ve learned along the way.</p>
        </div>
      </header>
      <section className="section">
        <div className="site-container">
          {loading && <p className="status-message" role="status">Loading writing…</p>}
          {error && <div className="status-message" role="alert"><p>Medium could not be reached right now.</p><a className="text-link" href="https://medium.com/@jfagbohungbe" target="_blank" rel="noreferrer">Visit Medium directly <span aria-hidden="true">↗</span></a></div>}
          {!loading && !error && posts.length === 0 && <p className="status-message">No articles are available yet.</p>}
          {!error && posts.length > 0 && <ArticleList posts={posts} />}
        </div>
      </section>
    </main>
  );
};

export default Stories;
