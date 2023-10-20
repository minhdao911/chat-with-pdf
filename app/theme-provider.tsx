"use client";

import { FunctionComponent, createContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

export const ThemeContext = createContext({
  theme: "light",
  setTheme: (value: Theme) => {},
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: FunctionComponent<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme && theme === "dark") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
