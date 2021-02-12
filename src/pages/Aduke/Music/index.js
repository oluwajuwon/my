import React from 'react';
import { withRouter } from 'react-router-dom';
import three from './assets/3.jpg';
import six from './assets/6.JPG';
import './style.css';

const Music = (props) => {

  const gotoAppleMusic = () => {
    window.open(`https://music.apple.com/ng/playlist/jiggy-aduduke/pl.u-06oxDBAIWBvmop6`, '_blank');
  }
  
  const moveToGallery = () => {
    props.history.push('/omoge/gallery')
  }

  return (
    <div className="omoge-music">
      <div className="heading">
        <h1>Music for Aduke</h1>
        <p>I know how much you love music as well, so I kinda curated a playlist for you, and sang one song for you lol (ignore how husky my voice is joor</p>
        </div>
      <div className="omoge-playlist">
        <div className="row">
          <div className="col-md-4 cursor-pointer" onClick={gotoAppleMusic}>

            <img src={three} alt="music" />
            <div className="d-flex justify-content-between w-100">
              <p>Jiggy aDuduke</p>
              <p>20 songs</p>
            </div>
            <p>These songs get me excited, the way you get me jiggy</p>
          </div>

          <div className="col-md-4">
            <img src={six} alt="music" className="her-song" />
            <div className="d-flex justify-content-between w-100">
              <p>Your song</p>
            </div>
            <p>I recorded this one as a voice clip, when you get here, just ask me for it and I'll send it to you</p>
            </div>
        </div>
        <p className="mt-5">I hope you enjoy this as much as I enjoyed building it, and I hope it warms your heart my love. I love you<span role="img" aria-label="heart"> ❤️</span></p>
        <div className="mt-4">
          <button className="btn btn-next" onClick={moveToGallery}>
            Move to the previous stage
          </button>
        </div>
      </div>
    </div>
  )
}

export default withRouter(Music);
