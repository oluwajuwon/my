import React from 'react';
import './style.css';
import javascript from '../../assets/javascript.png';
import typescript from '../../assets/typescript.png';
import react from '../../assets/react.png';
import node from '../../assets/node.png';
import gatsby from '../../assets/gatsby.png';
import redux from '../../assets/redux.png';
import git from '../../assets/git.png';
import graphql from '../../assets/graphql.png';
import PT from '../../assets/p-t.png';

const About = () => {
  return (
    <div>
      <section className='about-section'>

        <section className='about-intro'>
          <h1>
            AboutMe
          </h1>
          <p>
            As you saw on the first page and probably have realised by now, my name is Oluwajuwon.
            I'm a full stack software engineer who has a knack for solving problems, learning and building usable and user-friendly products.
        </p>
        <p>
            As a Budding Developer, my main goal is to solve problems, create solutions and learn new methods of solving different kinds of problems,
            regardless of technology or programming language used. 

            <br/><span className='goal'><b>The main goal is to SOLVE PROBLEMS.</b></span><br/>
        
            With a background in design, I love clean and minimal designs that fulfil their functions while still being aesthetically pleasing.
            I have used a few programming languages and tools over the years and i've come to enjoy the new wave JavaScript and TypeScript are making
            and how it has planned to change the face of software development all over the globe.
            I do also love scouring dribbble for real great designs and also creating my own mockups and prototypes on Adobe XD.
          </p>
          <p>
            To see a more structured document containing my work experiences, educational background and a lot more... 
            <br />
            <a href='http://bit.ly/oluwajuwons-portfolio'>Please download my CV</a>
          </p>
        </section>

        <section className='tools-section'>
          <h1>
            Languages, Tools and Technologies I've worked with in the past 6 months
          </h1>
          <div className='tools-and-tech'>
            <img src={git} alt='React-Js' />
            <img src={javascript} alt='JavaScript' />
            <img src={typescript} alt='TypeScript' />
            <img src={node} alt='Node-Js' />
            <img src={react} alt='React-Js' />
            <img src={gatsby} alt='Gatsby-Js' />
            <img src={redux} alt='React-Js' />
            <img src={graphql} alt='React-Js' />
            <img src={PT} alt='React-Js' />

          </div>
        </section>
      </section>
    </div>
  )
}

export default About;
