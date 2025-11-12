"use client";

import { useState, useCallback, useRef } from "react";
import { createAudioSlicer, type AudioSlice } from "@/lib/audio/slicer";
import { blobToBase64 } from "@/lib/audio/encoder";
import { mergePartialTranscripts } from "@/lib/transcription/merger";
import { useToast } from "@/components/ui/use-toast";

type RecordingState = "idle" | "recording" | "processing" | "error";

export function useAudioRecorder() {
  const [state, setState] = useState<RecordingState>("idle");
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0); // Current audio level (0-1)
  const slicerRef = useRef<ReturnType<typeof createAudioSlicer> | null>(null);
  const contextRef = useRef<string>("");
  const transcriptRef = useRef<string>("");
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      const slicer = createAudioSlicer();
      slicerRef.current = slicer;
      setTranscript("");
      transcriptRef.current = "";
      contextRef.current = "";
      setIsRecording(true);
      setState("recording");

      const result = await slicer.startRecording(
        async (slice: AudioSlice) => {
          try {
            // Skip silent slices - don't send to API
            if (slice.isSilent) {
              console.log("Skipping silent audio slice", {
                sequence: slice.sequence,
                averageLevel: slice.averageLevel,
                maxLevel: slice.maxLevel,
                size: slice.data.size,
                isSilent: slice.isSilent,
              });
              return;
            }

            // Additional safety check: verify blob size before encoding
            if (slice.data.size < 1000) {
              console.log("⏭️ Skipping tiny audio slice", {
                sequence: slice.sequence,
                size: slice.data.size,
              });
              return;
            }

            console.log("✅ Processing audio slice - sending to API", {
              sequence: slice.sequence,
              size: slice.data.size,
              avgLevel: slice.averageLevel,
              maxLevel: slice.maxLevel,
            });

            const base64 = await blobToBase64(slice.data);

            const response = await fetch("/api/transcriptions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                audioSlice: base64,
                context: contextRef.current,
                sessionId: slice.sessionId,
                sequence: slice.sequence,
                isFinal: false,
              }),
            });

            const data = (await response.json()) as
              | { ok: true; value: { partialText: string } }
              | { ok: false; error: { message: string } };

            if (!data.ok) {
              throw new Error(data.error.message);
            }

            // Merge with existing transcript using functional update
            setTranscript((prev) => {
              const merged = mergePartialTranscripts(prev, data.value.partialText);
              contextRef.current = merged.slice(-200); // Keep last 200 chars for context
              transcriptRef.current = merged; // Keep ref in sync
              return merged;
            });
          } catch (error) {
            console.error("Failed to process slice:", error);
            toast({
              title: "Error",
              description: "Failed to transcribe audio slice",
              variant: "destructive",
            });
          }
        },
        (level: number) => {
          // Update audio level for waveform visualization
          setAudioLevel(level);
        }
      );

      if (!result.ok) {
        throw result.error;
      }
    } catch (error) {
      setState("error");
      setIsRecording(false);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to start recording",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopRecording = useCallback(async () => {
    if (!slicerRef.current) return;

    setIsRecording(false);
    setAudioLevel(0); // Reset audio level
    setState("processing");

    // Get final slice - wait for it to be captured
    const slicer = slicerRef.current;
    await slicer.stopRecording();

    // Wait a bit for any pending slice processing
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Capture current transcript after all slices are processed
    const currentTranscript = transcriptRef.current;

    // Send final request to save transcription
    if (currentTranscript.trim()) {
      try {
        const response = await fetch("/api/transcriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioSlice: "", // Empty for final
            context: contextRef.current,
            sessionId: slicer.getSessionId(),
            sequence: 999,
            isFinal: true,
            finalText: currentTranscript, // Send current transcript for saving
          }),
        });

        if (!response.ok) {
          console.error("Failed to save transcription");
        }
      } catch (error) {
        console.error("Failed to finalize transcription:", error);
      }
    }

    slicerRef.current = null;
    setState("idle");
  }, [transcript]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(transcript);
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
  }, [transcript, toast]);

  return {
    state,
    isRecording,
    transcript,
    audioLevel, // Expose audio level for waveform
    startRecording,
    stopRecording,
    copyToClipboard,
    setTranscript,
  };
}

