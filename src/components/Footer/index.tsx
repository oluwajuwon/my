import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';

const Footer: React.FC = () => {
  return (
    <div className='footer'>
      <Link to='/about'>About</Link>
      <Link to='/portfolio'>Portfolio</Link>
      <Link to='/stories'>Stories</Link>
      <Link to='/contact'>Contact</Link>
    </div>
  );
};

export default Footer;
