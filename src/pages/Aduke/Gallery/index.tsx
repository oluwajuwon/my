import React from 'react';
import { imageDetails } from './data';
import { useNavigate } from 'react-router-dom';
import { ImageDetail } from './types';
import './style.css';

const Gallery: React.FC = () => {
  const navigate = useNavigate();

  const moveToMusic = (): void => {
    navigate('/aduke/music');
  };

  const moveToLetter = (): void => {
    navigate('/aduke');
  };

  return (
    <div className="omoge-gallery">
      <div className="heading">
        <h1>Gallery for Aduke</h1>
        <p>I know how much you love memories, and I know how much you love black and white photos as well</p>
        <p>Below are some of my favourite images of us (or you) from the very first day we hung out till now</p>
      </div>
      <div className="image-section pt-4">
        <div className="row">
          {imageDetails.map((item: ImageDetail, index: number) => (
            <div className="col-md-3 mt-4" key={index}>
              <div className='gallery-image'>
                <img src={item.image} alt={item.name || `Gallery image ${index + 1}`} />
              </div>
              <p className='gallery-description mt-2'>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="navigation-buttons">
        <button onClick={moveToLetter}>Go to Letter</button>
        <button onClick={moveToMusic}>Go to Music</button>
      </div>
    </div>
  );
};

export default Gallery;
