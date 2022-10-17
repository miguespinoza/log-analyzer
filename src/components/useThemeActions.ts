import { useCallback } from "react";

export function useThemeActions(): {
  getTheme: () => "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
} {
  const setTheme = useCallback((theme: "dark" | "light") => {
    const storedTheme = getCurrentTheme();
    if (storedTheme !== theme) {
      localStorage.setItem("theme", theme);
      if (theme === "dark")
        document.getElementById("root")?.classList.add("dark");
      else document.getElementById("root")?.classList.remove("dark");
    }
  }, []);

  const getTheme = useCallback(() => {
    const storedTheme = getCurrentTheme();
    if (storedTheme === "dark") return "dark";
    else return "light";
  }, []);

  return { getTheme, setTheme };
}

export function getCurrentTheme(): "dark" | "light" {
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme === "dark") return "dark";
  else return "light";
}

export function useApplyTheme() {
  const { getTheme } = useThemeActions();
  const theme = getTheme();
  if (theme === "dark") document.getElementById("root")?.classList.add("dark");
  else document.getElementById("root")?.classList.remove("dark");
}
