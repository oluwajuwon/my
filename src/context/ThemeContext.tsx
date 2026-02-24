import React, { createContext, useContext, useState, useCallback } from "react";

export type ColorMode = "Light" | "Dark";

interface ThemeContextType {
  colorMode: ColorMode;
  toggleColorMode: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [colorMode, setColorMode] = useState<ColorMode>("Dark");

  const toggleColorMode = useCallback(() => {
    setColorMode((prev) => (prev === "Light" ? "Dark" : "Light"));
  }, []);

  const isDark = colorMode === "Dark";

  return (
    <ThemeContext.Provider value={{ colorMode, toggleColorMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
