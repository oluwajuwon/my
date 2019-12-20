import React from 'react';
import gitHub from '../../assets/github-logo.png'
import medium from '../../assets/medium-logo.png';
import twitter from '../../assets/twitter-logo.png';
import dev from '../../assets/dev-logo.png';
import './style.css';

const Home = () => {

  return (
    <div>
      <section className='home-intro-section'>
        <section className='home-brief-intro'>
          <h1>
            Hi, my name is <span className='intro-name'>Oluwajuwon</span> You can call me a tech bro if you want
          </h1>
          <p>
            Welcome to my little portfolio where I talk about myself and some of the projects I've participated or currently participating in, tools I've used and some other cool things.
          
            If you're wondering why this portfolio is so plain and too simple, well it's because I got bored on a faithful day and decided to do a little something to kill time.
         
            I'm guessing you're not here to read my rants <span role='img'>😜</span>, so you can checkout the other pages via the links at the bottom of the page or click on any of the icons below
          </p>
        </section>
        <section className='home-social-icons'>
          <a href='https://github.com/oluwajuwon' target='_blank' rel='noopener noreferrer'><img src={gitHub} alt='gitHub link' /></a>
          <a href='https://medium.com/@jfagbohungbe' target='_blank' rel='noopener noreferrer'><img src={medium} alt='gitHub link' /></a>
          <a href='https://dev.to/oluwajuwon/' target='_blank' rel='noopener noreferrer'><img src={dev} alt='gitHub link' /></a>
          <a href='https://twitter.com/The_Oluwajuwon' target='_blank' rel='noopener noreferrer'><img src={twitter} alt='gitHub link' /></a>
        </section>
      </section>
    </div>
  )
}

export default Home;
