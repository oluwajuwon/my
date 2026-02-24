import React from 'react';
import { Route, Routes } from "react-router-dom";
import Omoge from './Omoge';
import Gallery from './Gallery';
import Music from './Music';
import Birthday from './Birthday';
import { AdukeProps } from './types';
import './style.css';

const Aduke: React.FC<AdukeProps> = () => {
  return (
    <div className="aduke-page">
      <Routes>
        <Route path="/" element={<Birthday />} />
        <Route path="/omoge" element={<Omoge />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/music" element={<Music />} />
      </Routes>
    </div>
  );
};

export default Aduke;
