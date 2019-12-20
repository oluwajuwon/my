import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';

const Header = () => {
  return (
    <div className='header'>
      <Link to='/'><h1>Oluwajuwon<span className='header-dot'>.</span></h1></Link>
    </div>
  )
}

export default Header;
