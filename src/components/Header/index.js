import React from 'react';
import { Link } from 'react-router-dom';
import './style.css';

const Header = ({toggleColorMode}) => {
  return (
    <div className='header'>
      <Link to='/'><h1>Juwonlo<span className='header-dot'>.</span></h1></Link>
      { // <a href='/' onClick={toggleColorMode}>toggle Color</a> 
      }
    </div>
  )
}

export default Header;
