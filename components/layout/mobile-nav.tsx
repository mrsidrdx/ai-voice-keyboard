"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic, BookOpen, History, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { href: "/dashboard/dictate", label: "Dictate", icon: Mic },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/dictionary", label: "Dictionary", icon: BookOpen },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-surface/95 backdrop-blur-lg pb-safe"
    >
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all",
                isActive
                  ? "text-[hsl(var(--brand-500))]"
                  : "text-[hsl(var(--text-muted))]"
              )}
            >
              {/* Active background */}
              {isActive && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute inset-0 bg-[hsl(var(--brand-500))]/10 rounded-xl"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="relative"
              >
                <Icon className="h-5 w-5" />
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveDot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[hsl(var(--brand-500))]"
                  />
                )}
              </motion.div>
              
              <span className={cn(
                "text-[10px] font-medium relative z-10",
                isActive ? "text-[hsl(var(--brand-500))]" : "text-[hsl(var(--text-muted))]"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}

