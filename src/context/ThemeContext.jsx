import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const THEMES = {
  light: {
    id: "light",
    name: "Light",
    icon: "☀️",
    description: "Clean and bright",
    colors: {
      primary: "#0084ff",
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#1e293b",
    },
  },
  dark: {
    id: "dark",
    name: "Dark",
    icon: "🌙",
    description: "Easy on the eyes",
    colors: {
      primary: "#60a5fa",
      background: "#0f172a",
      surface: "#1e293b",
      text: "#f1f5f9",
    },
  },
  ocean: {
    id: "ocean",
    name: "Ocean",
    icon: "🌊",
    description: "Deep sea calm",
    colors: {
      primary: "#06b6d4",
      background: "#0c1929",
      surface: "#0f2942",
      text: "#e0f2fe",
    },
  },
  forest: {
    id: "forest",
    name: "Forest",
    icon: "🌲",
    description: "Nature inspired",
    colors: {
      primary: "#22c55e",
      background: "#0f1a0f",
      surface: "#1a2e1a",
      text: "#dcfce7",
    },
  },
  sunset: {
    id: "sunset",
    name: "Sunset",
    icon: "🌅",
    description: "Warm and cozy",
    colors: {
      primary: "#f97316",
      background: "#1c1412",
      surface: "#2d1f1a",
      text: "#fef3c7",
    },
  },
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("neurolearn_theme");
    if (saved && THEMES[saved]) return saved;

    // Check system preference
    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  });

  useEffect(() => {
    localStorage.setItem("neurolearn_theme", theme);

    // Apply theme to document
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);

    // Apply theme class for Tailwind
    document.body.className = document.body.className
      .replace(/theme-\w+/g, "")
      .trim();
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  const cycleTheme = () => {
    const themeKeys = Object.keys(THEMES);
    const currentIndex = themeKeys.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setTheme(themeKeys[nextIndex]);
  };

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, cycleTheme, themes: THEMES }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
