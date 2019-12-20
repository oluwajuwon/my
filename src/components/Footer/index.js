import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';

const Footer = () => {
  return (
    <div className='footer'>
      <Link to='/'>Welcome</Link>
      <Link to='/about-me'>AboutMe</Link>
      <Link to='/portfolio'>MyPortfolio</Link>
      <Link to='/contact'>HitMeUp</Link>
    </div>
  )
}

export default Footer;
