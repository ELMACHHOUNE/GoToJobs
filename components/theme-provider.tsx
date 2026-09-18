"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem("gotojobs.theme") as Theme | null;
  return stored ?? "system";
}

function getInitialResolvedTheme(theme: Theme): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

export function ThemeProvider({ children, ...props }: { children: ReactNode } & Record<string, unknown>) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() =>
    getInitialResolvedTheme(getInitialTheme())
  );

  useEffect(() => {
    localStorage.setItem("gotojobs.theme", theme);
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "system") {
      const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(system);
      setResolvedTheme(system);
    } else {
      root.classList.add(theme);
      setResolvedTheme(theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem {...props}>
        {children}
      </NextThemesProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}