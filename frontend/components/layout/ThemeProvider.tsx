"use client";

/**
 * ThemeProvider.tsx
 * 
 * Group Project Documentation:
 * This component provides universal light/dark mode state management across the Next.js application.
 * It uses React Context to share the active theme ('light' or 'dark') and a toggle function.
 * 
 * Features:
 * 1. Synchronizes and persists the user's choice in browser LocalStorage.
 * 2. Defaults to the user's operating system preference (prefers-color-scheme) if no preference is saved.
 * 3. Toggles the 'dark' class on the document's root element (<html>) which triggers the dark styles.
 */

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Create the context with an undefined default, ensuring it's used within a Provider
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Defaulting to "dark" since the platform was originally built exclusively in dark mode.
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // 1. Check local storage for previously saved theme preference.
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    
    // 2. Query the system preferences if no theme is found in local storage.
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    
    const initialTheme = savedTheme || systemTheme;
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(initialTheme);
    
    // 3. Set the 'dark' class on <html> if the initial theme is dark.
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  // Handler to switch between themes and store the setting in LocalStorage
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    // Toggle class on the root element
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom React Hook to access the current theme context.
 * Throws an error if used outside a ThemeProvider context container.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
