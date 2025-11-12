"use client";

import { Button } from "@/components/ui/button";
import { Copy, Trash2, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { useState } from "react";

type TranscriptCardProps = {
  id: string;
  text: string;
  createdAt: Date;
  onDelete: (id: string) => void;
};

export function TranscriptCard({
  id,
  text,
  createdAt,
  onDelete,
}: TranscriptCardProps) {
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const preview = text.slice(0, 200) + (text.length > 200 ? "..." : "");
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* Gradient overlay on hover */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.03 : 0 }}
        className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--brand-500))] to-[hsl(var(--accent))] pointer-events-none"
      />

      {/* Header */}
      <div className="relative flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--text-muted))]">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatDistanceToNow(createdAt, { addSuffix: true })}</span>
          <span className="text-[hsl(var(--border))]">•</span>
          <span>{wordCount} words</span>
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
          transition={{ duration: 0.2 }}
          className="flex gap-1"
        >
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
            className="h-8 w-8 rounded-full hover:bg-[hsl(var(--brand-500))]/10 hover:text-[hsl(var(--brand-500))]"
            >
            <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(id)}
            className="h-8 w-8 rounded-full hover:bg-[hsl(var(--danger))]/10 hover:text-[hsl(var(--danger))]"
            >
            <Trash2 className="h-3.5 w-3.5" />
            </Button>
        </motion.div>
          </div>

      {/* Content */}
      <div className="relative">
        <p className="text-sm leading-relaxed text-[hsl(var(--text))]">
          {preview}
        </p>
        </div>

      {/* Bottom accent line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[hsl(var(--brand-500))] to-[hsl(var(--accent))] origin-left"
      />
    </motion.div>
  );
}

