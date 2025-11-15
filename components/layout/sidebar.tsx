"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic, BookOpen, History, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const navItems = [
  { href: "/dashboard/dictate", label: "Dictate", icon: Mic },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/dictionary", label: "Dictionary", icon: BookOpen },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isExpanded ? 260 : 72 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative border-r border-[hsl(var(--border))]/60 bg-gradient-to-b from-[hsl(var(--surface))]/95 to-[hsl(var(--muted))]/80 backdrop-blur-xl hidden md:block shadow-lg"
    >
      <div className="sticky top-0 h-screen flex flex-col p-4">
        {/* Toggle Button */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isExpanded ? (
            <ChevronLeft className="h-3 w-3 text-[hsl(var(--text-muted))]" />
          ) : (
            <ChevronRight className="h-3 w-3 text-[hsl(var(--text-muted))]" />
          )}
        </motion.button>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 mt-4">
          {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
            <Link
              href={item.href}
              className={cn(
                    "group relative flex items-center gap-3 rounded-[14px] px-3 py-3 text-sm font-medium overflow-hidden",
                    "transition-all duration-300",
                isActive
                      ? "bg-gradient-to-r from-[hsl(var(--brand-500))] to-[hsl(var(--brand-400))] text-white shadow-lg shadow-[hsl(var(--brand-500))]/25"
                      : "text-[hsl(var(--text-muted))] hover:bg-[hsl(var(--muted))]/80 hover:text-[hsl(var(--text))] hover:shadow-sm"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--brand-500))] to-[hsl(var(--brand-400))] rounded-[14px]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  <Icon className={cn(
                    "h-5 w-5 relative z-10 flex-shrink-0 transition-all duration-300",
                    isActive ? "text-white drop-shadow-sm" : "group-hover:scale-110"
                  )} />
                  
                  <AnimatePresence mode="wait">
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative z-10 whitespace-nowrap"
                      >
              {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Hover effect */}
                  {!isActive && (
                    <motion.div
                      className="absolute inset-0 bg-[hsl(var(--muted))] opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.2 }}
                    />
                  )}
            </Link>
              </motion.div>
          );
        })}
      </nav>

        {/* Footer - collapsed indicator */}
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center pb-4"
          >
            <div className="h-1 w-8 rounded-full bg-border" />
          </motion.div>
        )}
      </div>
    </motion.aside>
  );
}

