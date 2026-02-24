import React from 'react';
import { useNavigate } from 'react-router-dom';
import three from './assets/3.jpg';
import six from './assets/6.JPG';
import './style.css';

interface PlaylistItem {
  image: string;
  title: string;
  songCount: string;
  url: string;
}

const Music: React.FC = () => {
  const navigate = useNavigate();

  const gotoAppleMusic = (): void => {
    window.open('https://music.apple.com/ng/playlist/jiggy-aduduke/pl.u-06oxDBAIWBvmop6', '_blank');
  };

  const moveToGallery = (): void => {
    navigate('/aduke/gallery');
  };

  const playlists: PlaylistItem[] = [
    {
      image: three,
      title: 'Jiggy aDuduke',
      songCount: '20 songs',
      url: 'https://music.apple.com/ng/playlist/jiggy-aduduke/pl.u-06oxDBAIWBvmop6'
    },
    {
      image: six,
      title: 'Omoge Mi',
      songCount: '1 song',
      url: '#'
    }
  ];

  return (
    <div className="omoge-music">
      <div className="heading">
        <h1>Music for Aduke</h1>
        <p>I know how much you love music as well, so I kinda curated a playlist for you, and sang one song for you lol (ignore how husky my voice is joor</p>
      </div>
      <div className="omoge-playlist">
        <div className="row">
          {playlists.map((playlist, index) => (
            <div 
              key={index}
              className="col-md-4 cursor-pointer mt-4" 
              onClick={index === 0 ? gotoAppleMusic : undefined}
            >
              <img src={playlist.image} alt={playlist.title} />
              <div className="d-flex justify-content-between w-100">
                <p>{playlist.title}</p>
                <p>{playlist.songCount}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="navigation-buttons">
        <button onClick={moveToGallery}>Go to Gallery</button>
      </div>
    </div>
  );
};

export default Music;
