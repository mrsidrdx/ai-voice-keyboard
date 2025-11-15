"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "./theme-toggle";

type NavbarProps = {
  userName?: string;
};

export function Navbar({ userName }: NavbarProps) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 border-b border-[hsl(var(--border))]/60 bg-gradient-to-r from-[hsl(var(--surface))]/95 via-[hsl(var(--surface))]/98 to-[hsl(var(--surface))]/95 backdrop-blur-xl px-6 py-4 shadow-lg"
    >
      <div className="flex items-center justify-between max-w-[1400px] mx-auto">
        {/* Logo & Brand */}
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--brand-500))] to-[hsl(var(--accent))] rounded-xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
            <div className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-[hsl(var(--brand-500))] to-[hsl(var(--brand-400))] shadow-lg group-hover:shadow-xl transition-all duration-300">
              <Sparkles className="h-5 w-5 text-white drop-shadow-sm" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-[hsl(var(--brand-500))] to-[hsl(var(--accent))] bg-clip-text text-transparent">
              AI Voice Keyboard
            </h1>
          </div>
        </motion.div>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {userName && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-[hsl(var(--muted))]/80 to-[hsl(var(--muted))]/60 backdrop-blur-sm border border-[hsl(var(--border))]/50 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[hsl(var(--brand-500))] to-[hsl(var(--accent))] flex items-center justify-center text-white text-sm font-semibold shadow-md">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-[hsl(var(--text))]">
                {userName}
              </span>
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="rounded-full hover:bg-[hsl(var(--muted))] text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text))]"
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign out</span>
          </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}

