import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';

const NotFound = () => {

  return (
    <div className="not-found-page">
      <div className="empty-section">
        <h1>404</h1>
        <p>Lost? <Link to="/">Go back home</Link></p>
      </div>
    </div>
  )
}

export default NotFound;
