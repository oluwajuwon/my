import React from 'react';
import './style.css';
import gitHub from '../../assets/github-logo.png'
import medium from '../../assets/medium-logo.png';
import twitter from '../../assets/twitter-logo.png';
import dev from '../../assets/dev-logo.png';

const Contact = () => {
  return (
    <div className='main-bg'>
      <div>
        <section className='contact-section'>

          <section className='contact-intro'>
            <h1>
              <span role='img' aria-label="email">☎️</span> HitMeUp
            </h1>
            <p>
              Want to work with me
              or Got a project for me ?
            </p>
          </section>

          <section className='main-contact'>
            <p><span aria-label="email" role="img">📧</span> <a href="mailto:jfagbohungbe@gmail?Subject=Hi%20Juwonlo" target="_top">Send me an Email </a></p>

            <p>Do you just want to say hi?</p>

            <div className='contact-social-icons'>
              <a href='https://twitter.com/The_Oluwajuwon' target='_blank' rel='noopener noreferrer'><img src={twitter} alt='Twitter link' /></a>
            </div>

            <p>Want to see what I've been up to?</p>
            <div className='contact-social-icons'>
            <a href='https://github.com/oluwajuwon' target='_blank' rel='noopener noreferrer'><img src={gitHub} alt='gitHub link' /></a>
            <a href='https://medium.com/@jfagbohungbe' target='_blank' rel='noopener noreferrer'><img src={medium} alt='Medium link' /></a>
            <a href='https://dev.to/oluwajuwon/' target='_blank' rel='noopener noreferrer'><img src={dev} alt='Dev.to link' /></a>
            </div>
          </section>
        </section>
      </div>
    </div>
  )
}

export default Contact;
