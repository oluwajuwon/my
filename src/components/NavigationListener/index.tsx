import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const NavigationListener = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return null;
};

export default NavigationListener;
