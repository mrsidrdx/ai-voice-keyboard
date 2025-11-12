/**
 * Audio slicing utilities for 5-second chunks with 1-second overlap
 */

import type { Result } from "@/lib/result";

// Helper function to create properly typed Uint8Array for Web Audio API
// Web Audio API methods require Uint8Array with ArrayBuffer, not ArrayBufferLike
function createAudioDataArray(size: number): Uint8Array<ArrayBuffer> {
  const buffer = new ArrayBuffer(size);
  return new Uint8Array(buffer);
}

export type AudioSlice = {
  data: Blob;
  sequence: number;
  sessionId: string;
  timestamp: number;
  averageLevel?: number; // Average audio level (0-1)
  maxLevel?: number; // Peak audio level (0-1)
  isSilent?: boolean; // Whether the slice is considered silent
};

export class AudioSlicer {
  private sequence = 0;
  private sessionId: string;
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private sliceInterval: NodeJS.Timeout | null = null;
  private lastSliceEnd = 0;
  private onSliceCallback: ((slice: AudioSlice) => void) | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array<ArrayBuffer> | null = null;
  private audioLevelCallback: ((level: number) => void) | null = null;
  private levelCheckInterval: NodeJS.Timeout | null = null;
  private sliceLevelMonitorInterval: NodeJS.Timeout | null = null;
  private sliceLevels: number[] = [];
  private frequencyDataArray: Uint8Array<ArrayBuffer> | null = null; // For frequency visualization
  private readonly sliceDuration = 5000; // 5 seconds
  private readonly overlapDuration = 1000; // 1 second
  private readonly silenceThreshold = 0.015; // Threshold below which audio is considered silent
  private readonly minAudioSize = 1000; // Minimum blob size in bytes (increased significantly)
  private readonly minMaxLevel = 0.02; // Minimum peak level to consider non-silent

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  async startRecording(
    onSlice: (slice: AudioSlice) => void,
    onAudioLevel?: (level: number) => void
  ): Promise<Result<void, Error>> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 48000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      this.stream = stream;

      // Set up audio context for level detection
      this.audioContext = new AudioContext({ sampleRate: 48000 });
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048; // Increased for better resolution
      this.analyser.smoothingTimeConstant = 0.3; // Reduced for faster response
      source.connect(this.analyser);
      // For time-domain data, array size is fftSize
      this.dataArray = createAudioDataArray(this.analyser.fftSize);
      // For frequency data, array size is frequencyBinCount
      this.frequencyDataArray = createAudioDataArray(this.analyser.frequencyBinCount);

      // Store audio level callback
      this.audioLevelCallback = onAudioLevel || null;

      // Start monitoring audio levels
      if (this.audioLevelCallback) {
        this.levelCheckInterval = setInterval(() => {
          const level = this.getCurrentAudioLevel();
          this.audioLevelCallback?.(level);
        }, 50); // Update every 50ms for smooth visualization
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      this.mediaRecorder = mediaRecorder;
      this.sequence = 0;
      this.lastSliceEnd = Date.now();
      this.onSliceCallback = onSlice;
      this.sliceLevels = [];

      // Monitor audio levels during recording for slice analysis
      // Use time-domain data for amplitude detection
      // Time domain data array size is fftSize (not frequencyBinCount)
      const sliceDataArray = createAudioDataArray(this.analyser.fftSize);
      this.sliceLevelMonitorInterval = setInterval(() => {
        if (this.analyser && sliceDataArray) {
          this.analyser.getByteTimeDomainData(sliceDataArray);
          const amplitude = this.calculateAmplitude(sliceDataArray);
          this.sliceLevels.push(amplitude);
        }
      }, 100); // Sample every 100ms

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && this.onSliceCallback) {
          // Calculate audio levels for this slice
          const averageLevel =
            this.sliceLevels.length > 0
              ? this.sliceLevels.reduce((a, b) => a + b, 0) / this.sliceLevels.length
              : 0;
          const maxLevel = this.sliceLevels.length > 0 ? Math.max(...this.sliceLevels) : 0;
          
          // More strict silence detection: check blob size, average level, AND max level
          const isSilent =
            event.data.size < this.minAudioSize ||
            averageLevel < this.silenceThreshold ||
            maxLevel < this.minMaxLevel;

          // Debug logging
          console.log("🎤 Audio slice analysis:", {
            sequence: this.sequence,
            blobSize: event.data.size,
            averageLevel: averageLevel.toFixed(4),
            maxLevel: maxLevel.toFixed(4),
            isSilent,
            samples: this.sliceLevels.length,
            thresholds: {
              minSize: this.minAudioSize,
              avgThreshold: this.silenceThreshold,
              maxThreshold: this.minMaxLevel,
            },
          });

          const slice: AudioSlice = {
            data: event.data,
            sequence: this.sequence++,
            sessionId: this.sessionId,
            timestamp: Date.now(),
            averageLevel,
            maxLevel,
            isSilent,
          };
          this.onSliceCallback(slice);

          // Reset for next slice
          this.sliceLevels = [];
        }
      };

      // Clean up level monitor when slice interval stops
      const originalSliceInterval = setInterval(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          mediaRecorder.start(); // Start new slice immediately
        }
      }, this.sliceDuration);

      this.sliceInterval = originalSliceInterval;

      // Start recording
      mediaRecorder.start();

      return { ok: true, value: undefined };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  private getCurrentAudioLevel(): number {
    if (!this.analyser || !this.dataArray || !this.frequencyDataArray) {
      return 0;
    }
    // Use time-domain data for accurate amplitude/volume detection
    this.analyser.getByteTimeDomainData(this.dataArray);
    const amplitude = this.calculateAmplitude(this.dataArray);
    
    // Also get frequency data for more responsive visualization
    // Frequency data responds better to voice characteristics
    this.analyser.getByteFrequencyData(this.frequencyDataArray);
    const frequencyLevel = this.calculateFrequencyLevel(this.frequencyDataArray);
    
    // Use the maximum of both for best responsiveness
    const level = Math.max(amplitude, frequencyLevel);
    
    // Debug logging (throttled to every ~1 second)
    if (Math.random() < 0.02) {
      console.log("📊 Audio level:", {
        amplitude: amplitude.toFixed(3),
        frequency: frequencyLevel.toFixed(3),
        combined: level.toFixed(3),
      });
    }
    
    return level;
  }

  private calculateFrequencyLevel(dataArray: Uint8Array): number {
    // Focus on voice frequency range (85-255 Hz to 3000 Hz)
    // For fftSize 2048 at 48kHz, each bin is ~23.4 Hz
    // Voice range bins: ~4 to ~128
    const voiceStartBin = 4;
    const voiceEndBin = Math.min(128, dataArray.length);
    
    let sum = 0;
    let max = 0;
    let count = 0;
    
    for (let i = voiceStartBin; i < voiceEndBin; i++) {
      sum += dataArray[i];
      max = Math.max(max, dataArray[i]);
      count++;
    }
    
    if (count === 0) return 0;
    
    const average = sum / count;
    // Normalize and combine average with peak
    const normalized = (average / 255) * 0.6 + (max / 255) * 0.4;
    return Math.min(1, normalized * 2); // Scale up for visibility
  }

  private calculateAmplitude(dataArray: Uint8Array): number {
    // Calculate RMS (Root Mean Square) for accurate amplitude measurement
    let sumSquares = 0;
    let peak = 0;
    let nonZeroCount = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
      // Normalize: 128 is silence, range is 0-255
      const normalized = (dataArray[i] - 128) / 128.0;
      const absValue = Math.abs(normalized);
      
      sumSquares += normalized * normalized;
      peak = Math.max(peak, absValue);
      
      // Count non-zero samples
      if (absValue > 0.01) {
        nonZeroCount++;
      }
    }
    
    // If too few non-zero samples, likely silence
    if (nonZeroCount < dataArray.length * 0.1) {
      return 0;
    }
    
    const rms = Math.sqrt(sumSquares / dataArray.length);
    
    // Return raw RMS without excessive scaling
    // This gives us accurate amplitude values
    return Math.min(1, rms * 5); // Moderate scaling for visualization
  }

  private calculateAverageLevel(dataArray: Uint8Array): number {
    // For slice analysis, use frequency data to get overall energy
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    // Normalize to 0-1 range (255 is max value)
    return sum / (dataArray.length * 255);
  }

  stopRecording(): Promise<void> {
    return new Promise((resolve) => {
      // Stop level monitoring
      if (this.levelCheckInterval) {
        clearInterval(this.levelCheckInterval);
        this.levelCheckInterval = null;
      }

      if (this.sliceLevelMonitorInterval) {
        clearInterval(this.sliceLevelMonitorInterval);
        this.sliceLevelMonitorInterval = null;
      }

      if (this.sliceInterval) {
        clearInterval(this.sliceInterval);
        this.sliceInterval = null;
      }

      if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
        // Ensure we capture the final slice
        // Capture final levels before stopping
        const finalSliceDataArray = createAudioDataArray(this.analyser?.fftSize || 256);
        const finalLevels: number[] = [];
        const finalLevelMonitor = setInterval(() => {
          if (this.analyser && finalSliceDataArray) {
            this.analyser.getByteTimeDomainData(finalSliceDataArray);
            const amplitude = this.calculateAmplitude(finalSliceDataArray);
            finalLevels.push(amplitude);
          }
        }, 100);

        this.mediaRecorder.ondataavailable = (event) => {
          clearInterval(finalLevelMonitor);
          if (event.data.size > 0 && this.onSliceCallback) {
            // Combine current slice levels with final levels
            const allLevels = [...this.sliceLevels, ...finalLevels];
            const averageLevel =
              allLevels.length > 0
                ? allLevels.reduce((a, b) => a + b, 0) / allLevels.length
                : 0;
            const maxLevel =
              allLevels.length > 0 ? Math.max(...allLevels) : 0;
            // More strict silence detection: check blob size, average level, AND max level
            const isSilent =
              event.data.size < this.minAudioSize ||
              averageLevel < this.silenceThreshold ||
              maxLevel < this.minMaxLevel;

            const slice: AudioSlice = {
              data: event.data,
              sequence: this.sequence++,
              sessionId: this.sessionId,
              timestamp: Date.now(),
              averageLevel,
              maxLevel,
              isSilent,
            };
            this.onSliceCallback(slice);
          }
          resolve();
        };
        this.mediaRecorder.stop();
      } else {
        resolve();
      }

      // Clean up audio context
      if (this.audioContext) {
        this.audioContext.close().catch(console.error);
        this.audioContext = null;
      }
      this.analyser = null;
      this.dataArray = null;
      this.frequencyDataArray = null;
      this.sliceLevels = [];

      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
        this.stream = null;
      }

      this.mediaRecorder = null;
      this.onSliceCallback = null;
      this.audioLevelCallback = null;
    });
  }

  getSessionId(): string {
    return this.sessionId;
  }
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function createAudioSlicer(): AudioSlicer {
  return new AudioSlicer(generateSessionId());
}

