import React from 'react';
import './style.css';
import { projects } from './projects';

const Portfolio = () => {
  return (
    <div>
      <section className='portfolio-section'>
        <section className='portfolio-intro'>
          <h1>
            <span role='img'>💼</span>MyPortfolio
          </h1>
          <p>
            Below are some of the projects I've worked on and their stacks
          </p>
        </section>

        <section className='portfolio-projects'>
          {projects.map(project => (
            <div key={project.id} className='project-item'>
              <h2>{project.name}</h2>
              <p>MyRole: {project.role}</p>
              <p className='project-description'>
                {project.description}
              </p>
              <div className='project-image'>
                <img src={project.image} alt={project.name} />
              </div>
              <div className='project-technologies'>
                {project.technologies.map((tech, i) => (
                  <div key={i}  className='item'>{tech}</div>
                ))}
              </div>
            </div>
          ))}

        </section>
      </section>
    </div>
  )
}

export default Portfolio;
