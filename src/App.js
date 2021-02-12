import React, { useState } from 'react';
import { Switch, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Header from './components/Header';
import Footer from './components/Footer';
import NavigationListener from './components/NavigationListener';
import About from './pages/About';
import Portfolio from './pages/Portfolio';
import Contact from './pages/Contact';
import Stories from './pages/Stories';
import NotFound from './pages/NotFound';
import Aduke from './pages/Aduke';
import { lightTheme, darkTheme } from './appStyle';
import './App.css';

function App() {
  const [colorMode, setColorMode] = useState('Light');
  const location = useLocation();

  const handleColorToggle = (e) => {
    e.preventDefault();
    if(colorMode === 'Light') {
      return setColorMode('Dark')
    }
    return setColorMode('Light');
  }
  
  return (
    <div className="App" style={colorMode === 'Dark'? darkTheme : lightTheme}>
      <NavigationListener />
      {!location.pathname.split("/").includes("omoge")
        && <Header toggleColorMode={handleColorToggle} />
      }
      <Switch>
        <Route exact component={Home} path='/'/>
        <Route component={About} path='/about-me' />
        <Route component={Portfolio} path='/portfolio' />
        <Route component={Contact} path='/contact' />
        <Route component={Stories} path='/stories' />
        <Route component={Aduke} path='/omoge' />
        <Route component={NotFound} path='*' />
      </Switch>
      {!location.pathname.split("/").includes("omoge")
        && <Footer />
      }
    </div>
  );
}

export default App;
