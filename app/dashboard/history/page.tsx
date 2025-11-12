"use client";

import { useEffect, useState } from "react";
import { TranscriptCard } from "@/components/history/transcript-card";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Loader2 } from "lucide-react";

type Transcription = {
  id: string;
  text: string;
  createdAt: string;
};

export default function HistoryPage() {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTranscriptions();
  }, []);

  const fetchTranscriptions = async () => {
    try {
      const response = await fetch("/api/transcriptions");
      const data = (await response.json()) as
        | { ok: true; value: { transcriptions: Transcription[] } }
        | { ok: false };

      if (data.ok) {
        setTranscriptions(data.value.transcriptions);
      }
    } catch (error) {
      console.error("Failed to fetch transcriptions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/transcriptions/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTranscriptions((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete transcription:", error);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-2"
      >
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-[hsl(var(--text))] to-[hsl(var(--text-muted))] bg-clip-text text-transparent">
          History
        </h1>
        <p className="text-[hsl(var(--text-muted))] text-sm sm:text-base">
          View and manage your past transcriptions
        </p>
      </motion.div>

      {/* Content */}
      <div className="space-y-4">
      {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 space-y-4"
          >
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--brand-500))]" />
            <p className="text-sm text-[hsl(var(--text-muted))]">Loading your transcriptions...</p>
          </motion.div>
      ) : transcriptions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-20 space-y-6 rounded-[var(--radius-xl)] border-2 border-dashed border-[hsl(var(--border))] bg-[hsl(var(--mist))]"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--brand-500))] to-[hsl(var(--accent))] rounded-full blur-2xl opacity-20" />
              <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-[hsl(var(--brand-500))]/10 to-[hsl(var(--accent))]/10 flex items-center justify-center">
                <FileText className="h-10 w-10 text-[hsl(var(--brand-500))]" />
              </div>
            </div>
            <div className="text-center space-y-2 max-w-md">
              <h3 className="text-lg font-semibold text-[hsl(var(--text))]">
                No transcriptions yet
              </h3>
              <p className="text-sm text-[hsl(var(--text-muted))]">
                Start dictating to see your history here. All your transcriptions will be saved automatically.
            </p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-6 px-4 py-3 rounded-[var(--radius-lg)] bg-gradient-to-r from-[hsl(var(--mist))] to-[hsl(var(--cloud))] border border-[hsl(var(--border))]"
            >
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[hsl(var(--brand-500))]" />
                <span className="text-sm font-medium text-[hsl(var(--text))]">
                  {transcriptions.length} {transcriptions.length === 1 ? 'transcription' : 'transcriptions'}
                </span>
              </div>
              <div className="h-4 w-px bg-[hsl(var(--border))]" />
              <span className="text-xs text-[hsl(var(--text-muted))]">
                Total words: {transcriptions.reduce((acc, t) => acc + t.text.split(/\s+/).filter(Boolean).length, 0).toLocaleString()}
              </span>
            </motion.div>

            {/* Transcriptions List */}
            <AnimatePresence mode="popLayout">
              {transcriptions.map((transcription, index) => (
                <motion.div
                  key={transcription.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
            <TranscriptCard
              id={transcription.id}
              text={transcription.text}
              createdAt={new Date(transcription.createdAt)}
              onDelete={handleDelete}
            />
                </motion.div>
          ))}
            </AnimatePresence>
          </>
        )}
        </div>
    </div>
  );
}

