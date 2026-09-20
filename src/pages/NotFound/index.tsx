import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => (
  <main className="page">
    <div className="site-container missing-project">
      <p className="page-kicker">404 · Page not found</p>
      <h1 className="page-title">This page doesn’t exist.</h1>
      <Link className="text-link" to="/">Return home <span aria-hidden="true">→</span></Link>
    </div>
  </main>
);

export default NotFound;
