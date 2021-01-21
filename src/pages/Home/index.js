import React from 'react';
import juwon from '../../assets/juwon.jpg';
import './style.css';

const Home = () => {

  return (
    <div>
      <section className='home-intro-section'>
        <div className="home-profile-photo">
          <img src={juwon} alt="profile" />
        </div>
        <section className='home-brief-intro'>
          <h1>
          <span role='img' aria-label="wave">👋🏿 </span> Hi, my name is <span className='intro-name'>Juwon</span>
          </h1>
          <p>
            Welcome to my little portfolio where I talk about myself and some of the projects I've participated in or currently participating in, tools I've used and some other cool things.
          
            If you're wondering why this portfolio is so plain and too simple, well it's because I got bored on a faithful day and decided to do a little something to kill time. 
            
            I'll be updating it as time goes on.
          <br/>
            I'm guessing you're not here to read my rants, so you can checkout the other pages via the links at the bottom of the page.
          </p>
        </section>
      </section>
    </div>
  )
}

export default Home;
