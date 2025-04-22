
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light" | "aurora";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  themeStyles: {
    background: string;
    gradient: string;
    cardGradient: string;
    buttonGradient: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Define theme styles for each theme
const themeStyleOptions = {
  light: {
    background: "bg-gray-50",
    gradient: "bg-gradient-to-br from-blue-50 to-indigo-100",
    cardGradient: "bg-gradient-to-br from-white to-gray-50",
    buttonGradient: "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600",
  },
  dark: {
    background: "bg-gray-900",
    gradient: "bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-950",
    cardGradient: "bg-gradient-to-br from-gray-800 to-gray-900",
    buttonGradient: "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800",
  },
  aurora: {
    background: "bg-gray-900",
    gradient: "bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900",
    cardGradient: "bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg border-white/10",
    buttonGradient: "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600",
  }
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("aurora"); // Default to aurora theme
  const [themeStyles, setThemeStyles] = useState(themeStyleOptions.aurora);

  useEffect(() => {
    // Check for saved theme or system preference
    const savedTheme = localStorage.getItem("bookmarket_theme") as Theme | null;
    
    if (savedTheme && (savedTheme === "light" || savedTheme === "dark" || savedTheme === "aurora")) {
      setTheme(savedTheme);
    } else {
      // Default to aurora theme
      setTheme("aurora");
    }
  }, []);

  useEffect(() => {
    // Update document class when theme changes
    const root = window.document.documentElement;
    root.classList.remove("light", "dark", "aurora");
    root.classList.add(theme);
    
    // Update theme styles
    setThemeStyles(themeStyleOptions[theme]);
    
    localStorage.setItem("bookmarket_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      if (prevTheme === "light") return "dark";
      if (prevTheme === "dark") return "aurora";
      return "light";
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, themeStyles }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
