"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-full hover:bg-[hsl(var(--muted))]"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        {theme === "light" ? (
          <Moon className="h-4 w-4 text-[hsl(var(--text))]" />
        ) : (
          <Sun className="h-4 w-4 text-[hsl(var(--text))]" />
        )}
      </motion.div>
    </Button>
  );
}

