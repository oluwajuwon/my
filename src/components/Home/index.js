import React from 'react';
import './style.css';

const Home = () => {

  return (
    <div>
      <section className='home-intro-section'>
        <section className='home-brief-intro'>
          <h1>
          <span role='img'>👋🏿 </span> Hi, my name is <span className='intro-name'>Oluwajuwon</span> a.k.a Tech bro Juwonlo
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
