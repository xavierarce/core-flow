"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { AppButton } from "./AppButton/AppButton";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <AppButton
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="text-muted-foreground hover:text-foreground"
      aria-label="Toggle theme"
    >
      <Sun size={18} className="hidden dark:block" />
      <Moon size={18} className="block dark:hidden" />
    </AppButton>
  );
};
