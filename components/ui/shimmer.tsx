"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type ShimmerProps = {
  className?: string;
  count?: number;
  variant?: "card" | "line" | "circle" | "button";
};

export function Shimmer({ className, count = 1, variant = "card" }: ShimmerProps) {
  const shimmerClasses = {
    card: "h-32 w-full rounded-[var(--radius-lg)]",
    line: "h-4 w-full rounded-[var(--radius-sm)]",
    circle: "h-12 w-12 rounded-full",
    button: "h-10 w-24 rounded-[var(--radius-md)]",
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`shimmer-${index}`}
          className={cn(
            "relative overflow-hidden bg-[hsl(var(--muted))]",
            shimmerClasses[variant],
            className
          )}
        >
          {/* Shimmer overlay */}
          <div
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[hsl(var(--surface))]/60 to-transparent"
            style={{
              animation: "shimmer-slide 1.2s ease-in-out infinite",
            }}
          />
        </div>
      ))}
    </>
  );
}

type ShimmerCardProps = {
  className?: string;
};

export function ShimmerCard({ className }: ShimmerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "space-y-4 rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6",
        className
      )}
    >
      <div className="space-y-3">
        <Shimmer variant="line" className="w-3/4" />
        <Shimmer variant="line" className="w-1/2" />
      </div>
      <div className="space-y-2">
        <Shimmer variant="line" className="w-full" />
        <Shimmer variant="line" className="w-full" />
        <Shimmer variant="line" className="w-5/6" />
      </div>
    </motion.div>
  );
}

type ShimmerTableProps = {
  rows?: number;
  className?: string;
};

export function ShimmerTable({ rows = 5, className }: ShimmerTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "space-y-3 rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6",
        className
      )}
    >
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-[hsl(var(--border))]">
        <Shimmer variant="line" className="w-1/3" />
        <Shimmer variant="line" className="w-1/3" />
        <Shimmer variant="line" className="w-1/6" />
      </div>
      
      {/* Rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex gap-4 items-center">
            <Shimmer variant="line" className="w-1/3" />
            <Shimmer variant="line" className="w-1/3" />
            <div className="flex gap-2 w-1/6 justify-end">
              <Shimmer variant="button" className="w-8 h-8" />
              <Shimmer variant="button" className="w-8 h-8" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

type ShimmerListProps = {
  items?: number;
  className?: string;
};

export function ShimmerList({ items = 3, className }: ShimmerListProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("space-y-4", className)}
    >
      {Array.from({ length: items }).map((_, index) => (
        <ShimmerCard key={index} />
      ))}
    </motion.div>
  );
}
