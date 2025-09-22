import React, { createContext, useState, useContext, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initialize theme immediately
  const initialTheme = localStorage.getItem("theme") === "dark";
  document.documentElement.setAttribute(
    "data-theme",
    initialTheme ? "dark" : "light"
  );

  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(initialTheme);

  useEffect(() => {
    // Set mounted to true when component mounts
    setMounted(true);
    // Ensure light mode is set by default if no theme is saved
    if (!localStorage.getItem("theme")) {
      localStorage.setItem("theme", "light");
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !darkMode ? "dark" : "light";
    setDarkMode(!darkMode);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Only render children once mounted to avoid hydration issues
  if (!mounted) {
    return null; // or a loading spinner if you prefer
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
