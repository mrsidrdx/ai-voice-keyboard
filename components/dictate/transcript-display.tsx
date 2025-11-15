"use client";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type TranscriptDisplayProps = {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function TranscriptDisplay({
  value,
  onChange,
  placeholder = "Your transcription will appear here...",
  className,
}: TranscriptDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
    <Textarea
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className={cn(
          "min-h-[400px] w-full text-base leading-relaxed",
          "bg-[hsl(var(--surface))]/80 backdrop-blur-sm border-[hsl(var(--border))]",
          "rounded-[var(--radius-lg)] p-6",
          "focus:ring-2 focus:ring-[hsl(var(--brand-500))]/30 focus:border-[hsl(var(--brand-500))]",
          "focus:shadow-xl focus:shadow-[hsl(var(--brand-500))]/10",
          "placeholder:text-[hsl(var(--text-muted))]/50",
          "transition-all duration-300",
          "hover:border-[hsl(var(--border))]/80 hover:shadow-md",
        className
      )}
    />
      {!value && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="text-center space-y-3 px-4">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-5xl"
            >
              🎙️
            </motion.div>
            <p className="text-sm font-medium text-[hsl(var(--text-muted))]">
              Start recording to see your transcription
            </p>
            <p className="text-xs text-[hsl(var(--text-muted))]/70">
              Your words will appear here in real-time
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

