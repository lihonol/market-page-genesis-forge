
import React from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, Sparkles } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="rounded-full w-9 h-9"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 transition-all" />
      ) : theme === "dark" ? (
        <Sun className="h-5 w-5 transition-all" />
      ) : (
        <Sparkles className="h-5 w-5 transition-all text-pink-400" />
      )}
    </Button>
  );
}
