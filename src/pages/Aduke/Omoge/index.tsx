import React, { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

const Omoge: React.FC = () => {
  const [unlock, setUnlock] = useState<string>('');
  const navigate = useNavigate();

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target;
    setUnlock(value);
  };

  const moveToGallery = (): void => {
    navigate('/aduke/gallery');
  };

  return (
    <div className="omoge-page">
      <h1>Letter to Aduke</h1>
      <p className="note">
        My beloved, ayaa mi, I thought about this for a while, actually this is the cool thing I said I wanted to build that day (I don't know if you remember).
        Anyways, I've spent days trying to know what I want to put down, I've not sent you an email as well in a while Cos I just want to pour out my heart to you in one place (for some reason I'm almost in tears writing this <span role="img" aria-label="laugh">😂</span>, you know how emotional I can get).
        It's been an amazing past couple of weeks and loving you every single day makes me feel sooooooo good ugh (okay now I'm in tears). By the way, I wrote this whole thing on different days, today is that day where I watched greys anatomy and cried for most of the day.
        Loving you will always be a big deal for me, I feel like I've won in life, I feel like my heart is in the right place, also I noticed that loving you more and more, makes me love you more and more (I don't know if that makes sense).
      </p>
      <br />
      <p>
        I love how you're always there to support me in everything I do, I love how you're always there to encourage me, I love how you're always there to make me feel better when I'm down.
        I love how you're always there to make me laugh, I love how you're always there to make me smile, I love how you're always there to make me feel loved.
        I love how you're always there to make me feel special, I love how you're always there to make me feel like I'm the only one in the world.
        I love how you're always there to make me feel like I can do anything, I love how you're always there to make me feel like I'm the best.
      </p>
      <br />
      <p>
        I love how you're always there to listen to me, I love how you're always there to understand me, I love how you're always there to comfort me.
        I love how you're always there to hold me, I love how you're always there to hug me, I love how you're always there to kiss me.
        I love how you're always there to make me feel safe, I love how you're always there to make me feel secure, I love how you're always there to make me feel protected.
      </p>
      <br />
      <div className="unlock-section">
        <p>Enter the code to unlock the gallery</p>
        <input
          type="text"
          value={unlock}
          onChange={handleChange}
          placeholder="Enter code"
          className="unlock-input"
        />
        {unlock === 'omoge' && (
          <button onClick={moveToGallery} className="unlock-button">
            View Gallery
          </button>
        )}
      </div>
    </div>
  );
};

export default Omoge;
