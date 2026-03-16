"use client";

/**
 * Theme context: light/dark mode. Persists to localStorage; layout runs an inline script
 * to apply theme before paint to avoid flash. ThemeToggle in Header uses toggleTheme().
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "github-explorer-theme";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Reads theme from localStorage, else system preference (prefers-color-scheme). */
function loadTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "dark" || raw === "light") return raw;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

/** Applies theme by setting "light" or "dark" class on <html>; CSS variables in globals.css. */
function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (root.classList.contains(theme)) return;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
}

/** Provides theme state; on mount reads from storage and applies. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const t = loadTheme();
    applyTheme(t);
    const id = setTimeout(() => setThemeState(t), 0);
    return () => clearTimeout(id);
  }, []);

  /** Set theme, apply to DOM, persist to localStorage. */
  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    applyTheme(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Hook for current theme and setTheme/toggleTheme. Use inside ThemeProvider. */
export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}
