"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

type WaveformProps = {
  isRecording: boolean;
  audioLevel?: number; // Current audio level (0-1)
  barCount?: number;
};

export function Waveform({
  isRecording,
  audioLevel = 0,
  barCount = 40,
}: WaveformProps) {
  const [heights, setHeights] = useState<number[]>(
    Array(barCount).fill(0.1)
  );
  const previousLevelRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const barPhasesRef = useRef<number[]>(
    Array.from({ length: barCount }, () => Math.random() * Math.PI * 2)
  );
  const barSpeedsRef = useRef<number[]>(
    Array.from({ length: barCount }, () => 0.02 + Math.random() * 0.03)
  );

  useEffect(() => {
    if (!isRecording) {
      // Decay to zero when not recording
      const decayInterval = setInterval(() => {
        setHeights((prev) => prev.map((h) => Math.max(0.05, h * 0.85)));
        previousLevelRef.current = 0;
      }, 50);
      return () => clearInterval(decayInterval);
    }

    // Continuous animation using requestAnimationFrame for smooth 60fps
    let lastTime = performance.now();
    
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      // Update time for wave motion
      timeRef.current += deltaTime * 0.001; // Convert to seconds
      
      // Smooth the audio level for stable base height
      const smoothedLevel = previousLevelRef.current * 0.3 + audioLevel * 0.7;
      previousLevelRef.current = smoothedLevel;

      // Generate continuous wave motion
      setHeights(
        Array.from({ length: barCount }, (_, i) => {
          // Each bar has its own phase and speed for varied motion
          const phase = barPhasesRef.current[i];
          const speed = barSpeedsRef.current[i];
          
          // Create multiple wave patterns for rich motion
          const wave1 = Math.sin(timeRef.current * speed + phase);
          const wave2 = Math.sin(timeRef.current * speed * 1.5 + phase + Math.PI / 3);
          const wave3 = Math.sin(timeRef.current * speed * 0.7 + i * 0.5);
          
          // Combine waves for complex motion
          const wavePattern = (wave1 * 0.5 + wave2 * 0.3 + wave3 * 0.2);
          
          // Base height scales with audio level
          // Wave pattern adds continuous motion
          const baseHeight = Math.max(0.1, smoothedLevel);
          const waveAmplitude = baseHeight * 0.4; // Wave amplitude scales with volume
          
          // Final height: base + wave motion
          const height = baseHeight + wavePattern * waveAmplitude;
          
          // Clamp between 0.05 (barely visible) and 1.0 (full height)
          return Math.max(0.05, Math.min(1, height));
        })
      );

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording, audioLevel, barCount]);

  return (
    <div className="flex items-center justify-center gap-1 h-20 px-4">
      {heights.map((height, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-gradient-to-t from-[hsl(var(--brand-500))] to-[hsl(var(--accent))]"
          style={{
            height: `${height * 100}%`,
          }}
          animate={{
            opacity: isRecording ? 0.8 : 0.3,
          }}
          transition={{
            opacity: { duration: 0.3 },
          }}
        />
      ))}
    </div>
  );
}

