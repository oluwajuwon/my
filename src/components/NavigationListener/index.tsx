import React, { useState } from "react";
import { useLocation } from "react-router-dom";

const NavigationListener: React.FC = () => {
  const location = useLocation();
  const [currentLocation, setCurrentLocation] = useState<string>(location.pathname);

  if (currentLocation !== location.pathname) {
    window.scrollTo(0, 0);
    setCurrentLocation(location.pathname);
  }

  return null;
};

export default NavigationListener;
