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
          "min-h-[400px] w-full resize-none text-base leading-relaxed",
          "bg-[hsl(var(--surface))] border-[hsl(var(--border))]",
          "rounded-[var(--radius-lg)] p-6",
          "focus:ring-2 focus:ring-[hsl(var(--brand-500))]/20 focus:border-[hsl(var(--brand-500))]",
          "placeholder:text-[hsl(var(--text-muted))]/50",
          "transition-all duration-200",
        className
      )}
    />
      {!value && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="text-center space-y-2 px-4">
            <div className="text-4xl">🎙️</div>
            <p className="text-sm text-[hsl(var(--text-muted))]">
              Start recording to see your transcription
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

