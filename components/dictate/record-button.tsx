"use client";

import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

type RecordButtonProps = {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
};

export function RecordButton({
  isRecording,
  onStart,
  onStop,
  disabled,
}: RecordButtonProps) {
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setPulseKey((prev) => prev + 1);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isRecording]);

  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse rings when recording */}
      <AnimatePresence>
        {isRecording && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`${pulseKey}-${i}`}
                className="absolute h-32 w-32 sm:h-40 sm:w-40 rounded-full border-2 border-[hsl(var(--accent))]"
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{
                  duration: 2,
                  delay: i * 0.4,
                  ease: "easeOut",
                  repeat: Infinity,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Main button */}
      <motion.button
      onClick={isRecording ? onStop : onStart}
      disabled={disabled}
      className={cn(
          "relative z-10 flex items-center justify-center rounded-full shadow-2xl",
          "transition-all duration-300 focus:outline-none focus-visible:ring-4",
          "backdrop-blur-sm",
          isRecording
            ? "h-32 w-32 sm:h-40 sm:w-40 bg-gradient-to-br from-[hsl(var(--accent))] via-[hsl(var(--success))] to-[hsl(var(--accent))]/80 focus-visible:ring-[hsl(var(--accent))]/30"
            : "h-28 w-28 sm:h-36 sm:w-36 bg-gradient-to-br from-[hsl(var(--brand-500))] via-[hsl(var(--brand-400))] to-[hsl(var(--brand-600))] focus-visible:ring-[hsl(var(--brand-500))]/30",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        animate={{
          boxShadow: isRecording
            ? [
                "0 20px 60px rgba(160, 200, 120, 0.3), 0 0 40px rgba(160, 200, 120, 0.2)",
                "0 20px 80px rgba(160, 200, 120, 0.5), 0 0 60px rgba(160, 200, 120, 0.3)",
                "0 20px 60px rgba(160, 200, 120, 0.3), 0 0 40px rgba(160, 200, 120, 0.2)",
              ]
            : "0 20px 60px rgba(89, 123, 237, 0.3), 0 10px 30px rgba(89, 123, 237, 0.2)",
        }}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: isRecording ? Infinity : 0,
            ease: "easeInOut",
          },
        }}
      >
        {/* Inner glow effect */}
        <div
          className={cn(
            "absolute inset-2 rounded-full blur-2xl transition-opacity duration-500",
        isRecording
              ? "bg-[hsl(var(--accent))] opacity-60"
              : "bg-[hsl(var(--brand-400))] opacity-40"
          )}
        />
        
        {/* Outer glow effect */}
        <div
          className={cn(
            "absolute inset-0 rounded-full blur-xl transition-opacity duration-300",
        isRecording
              ? "bg-[hsl(var(--accent))] opacity-50"
              : "bg-[hsl(var(--brand-500))] opacity-40"
          )}
        />

        {/* Icon */}
        <motion.div
          initial={false}
          animate={{ rotate: isRecording ? 0 : 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10"
        >
          <AnimatePresence mode="wait">
      {isRecording ? (
              <motion.div
                key="stop"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Square className="h-10 w-10 sm:h-12 sm:w-12 text-white fill-white" />
              </motion.div>
      ) : (
              <motion.div
                key="mic"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Mic className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
              </motion.div>
      )}
          </AnimatePresence>
        </motion.div>

        {/* Recording indicator dots */}
      {isRecording && (
          <motion.div
            className="absolute -bottom-2 flex gap-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-white"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        )}
      </motion.button>
    </div>
  );
}

