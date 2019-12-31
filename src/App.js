import React, { useState } from 'react';
import logo from './logo.svg';
import { Switch, Route } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import Header from './components/Header';
import Footer from './components/Footer';
import About from './components/About';
import Portfolio from './components/Portfolio';
import Contact from './components/Contact';
import { lightTheme, darkTheme } from './appStyle';

function App() {
  const [colorMode, setColorMode] = useState('Light');

  const handleColorToggle = (e) => {
    e.preventDefault();
    if(colorMode === 'Light') {
      return setColorMode('Dark')
    }
    return setColorMode('Light');
  }
  
  return (
    <div className="App" style={colorMode === 'Dark'? darkTheme : lightTheme}>
      <Header toggleColorMode={handleColorToggle} />
      <Switch>
        <Route exact component={Home} path='/'/>
        <Route component={About} path='/about-me' />
        <Route component={Portfolio} path='/portfolio' />
        <Route component={Contact} path='/contact' />
      </Switch>
      <Footer />
    </div>
  );
}

export default App;
