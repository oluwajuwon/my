import React from 'react';
import { withRouter } from 'react-router-dom';
import card from './assets/card-cover.png'
import './style.css';

const Birthday = (props) => {

  const gotoCard = () => {
    window.open(`https://drive.google.com/file/d/1ROcG4fTR0Nr8LBFmB4odXvzM6WRnneFZ/view?usp=sharing`, '_blank');
  }
  

  return (
    <div className="omoge-birthday">
      <div className="heading">
        <h1>Happy Birthday My Baby <span role="img">🎉🥳</span></h1>
        <p>So this is what I did with the virtual card Idea lol. Click on the image below</p>
      </div>
      <div className="card-container" onClick={gotoCard}>
        <img src={card} alt="Card" />
      </div>
    </div>
  )
}

export default withRouter(Birthday);
