"use client";

import { RecordButton } from "@/components/dictate/record-button";
import { TranscriptDisplay } from "@/components/dictate/transcript-display";
import { Waveform } from "@/components/dictate/waveform";
import { Button } from "@/components/ui/button";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { Copy, Check, Download, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function DictatePage() {
  const {
    isRecording,
    transcript,
    audioLevel,
    startRecording,
    stopRecording,
    copyToClipboard,
    setTranscript,
  } = useAudioRecorder();

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setTranscript("");
  };

  const handleDownload = () => {
    const blob = new Blob([transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
          Voice Dictation
        </h1>
        <p className="text-[hsl(var(--text-muted))] text-sm sm:text-base max-w-2xl">
          Click the button below to start recording. Your speech will be transcribed in real-time with AI-powered accuracy.
        </p>
      </motion.div>

      {/* Recording Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className={cn(
          "relative overflow-hidden rounded-[var(--radius-xl)] border border-[hsl(var(--border))] p-8 sm:p-12",
          "bg-gradient-to-br from-[hsl(var(--surface))] to-[hsl(var(--mist))]",
          "shadow-lg transition-all duration-500",
          isRecording && "shadow-2xl shadow-[hsl(var(--accent))]/20"
        )}
      >
        {/* Animated background gradient when recording */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 voice-gradient"
            />
          )}
        </AnimatePresence>

        <div className="relative z-10 flex flex-col items-center space-y-8">
          {/* Record Button */}
          <RecordButton
            isRecording={isRecording}
            onStart={startRecording}
            onStop={stopRecording}
          />

          {/* Status Text */}
          <motion.div
            key={isRecording ? "recording" : "idle"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center space-y-2"
          >
            <p className="text-lg font-medium text-[hsl(var(--text))]">
              {isRecording ? "Recording in progress..." : "Click to start recording"}
            </p>
            <p className="text-sm text-[hsl(var(--text-muted))]">
            {isRecording
                ? "Speak clearly into your microphone"
                : "Your voice will be transcribed instantly"}
            </p>
          </motion.div>

          {/* Waveform Visualization */}
          <div className="w-full max-w-2xl">
            <Waveform isRecording={isRecording} audioLevel={audioLevel} />
          </div>

          {/* Recording indicator */}
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--accent))]/10 border border-[hsl(var(--accent))]/20"
            >
              <div className="h-2 w-2 rounded-full bg-[hsl(var(--accent))] animate-pulse" />
              <span className="text-sm font-medium text-[hsl(var(--accent))]">
                Live
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Transcript Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="space-y-4"
      >
        {/* Transcript Header with Actions */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[hsl(var(--text))]">
            Transcript
          </h2>
          
          <AnimatePresence>
            {transcript && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="rounded-full gap-2"
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Check className="h-4 w-4 text-[hsl(var(--success))]" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Copy className="h-4 w-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <span className="hidden sm:inline">
                    {copied ? "Copied!" : "Copy"}
                  </span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="rounded-full gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Download</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="rounded-full gap-2 text-[hsl(var(--danger))] hover:text-[hsl(var(--danger))] hover:bg-[hsl(var(--danger))]/10"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Clear</span>
              </Button>
              </motion.div>
            )}
          </AnimatePresence>
          </div>

        {/* Transcript Display */}
        <div className="relative rounded-[var(--radius-xl)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-md overflow-hidden">
          <TranscriptDisplay
            value={transcript}
            onChange={setTranscript}
            placeholder=""
          />
        </div>

        {/* Word Count */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between text-xs text-[hsl(var(--text-muted))] px-2"
          >
            <span>
              {transcript.split(/\s+/).filter(Boolean).length} words · {transcript.length} characters
            </span>
            <span>
              Auto-saved
            </span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

