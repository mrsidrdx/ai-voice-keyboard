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
      className="h-9 w-9 rounded-full hover:bg-[hsl(var(--muted))] hover:scale-110 transition-all duration-300 relative overflow-hidden"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {/* Background glow */}
      <motion.div
        initial={false}
        animate={{
          opacity: theme === "dark" ? 0.1 : 0,
          scale: theme === "dark" ? 1.5 : 1,
        }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--warning))] to-[hsl(var(--accent))] rounded-full blur-md"
      />
      
      <motion.div
        initial={false}
        animate={{ 
          rotate: theme === "dark" ? 180 : 0,
          scale: theme === "dark" ? 1.1 : 1,
        }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
        className="relative z-10"
      >
        <motion.div
          key={theme}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ duration: 0.3 }}
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4 text-[hsl(var(--text))]" />
          ) : (
            <Sun className="h-4 w-4 text-[hsl(var(--warning))]" />
          )}
        </motion.div>
      </motion.div>
    </Button>
  );
}

