import React from 'react';
import { imageDetails } from './data';
import { withRouter } from 'react-router-dom';
import './style.css';

const Gallery = (props) => {

  const moveToMusic = () => {
    props.history.push('/omoge/music');
  }

  const moveToLetter = () => {
    props.history.push('/omoge');
  }
  return (
    <div className="omoge-gallery">
      <div className="heading">
        <h1>Gallery for Aduke</h1>
        <p>I know how much you love memories, and I know how much you love black and white photos as well</p>
        <p>Below are some of my favourtite images of us (or you) from the very first day we hung out till now</p>
      </div>
      <div className="image-section pt-4">
        <div className="row">
          {imageDetails.map(item => (
            <div className="col-md-3 mt-4">
              <div className='gallery-image'>
                  <img src={item.image} alt={item.name} />
              </div>
              <p className='gallery-description mt-2'>
                {item.description}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-left">
          Do you also remember this? -> <a href="https://drive.google.com/file/d/1o16ArXj6f7NIPK_hYH39NNBnAsfauBb-/view?usp=sharing" target="_blank" className="text-white text-decoration">click me!</a>
        </p>
        <p className="mt-5 text-left">
          I cherish every single moment we spend together, and I'm looking forward to making way more memories with you, I also understand the process is just as important as the destination, and I'll never take that for granted
        </p>
        <div className="d-flex justify-content-between mt-5">
        <button className="btn btn-next" onClick={moveToLetter}>
            Move to the previous stage
          </button>
          <button className="btn btn-next" onClick={moveToMusic}>
            Move to the next stage
          </button>
        </div>
      </div>

    </div>
  )
}

export default withRouter(Gallery);
