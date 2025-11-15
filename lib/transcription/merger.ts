/**
 * Incremental transcription merging logic for streaming audio chunks
 * 
 * MEMORY & CONTEXT MANAGEMENT:
 * - Each audio chunk is transcribed with context from previous chunks
 * - Context window is limited to ~300 chars to stay within API limits
 * - Merging must handle overlaps, continuations, and semantic boundaries
 * 
 * WORKFLOW:
 * 1. Audio chunk N arrives
 * 2. Previous transcription (chunks 1...N-1) is used as context
 * 3. Whisper API transcribes chunk N with context awareness
 * 4. New transcription is merged with accumulated text
 * 5. Result becomes context for chunk N+1
 * 
 * Uses intelligent pattern detection to preserve speaker's natural intent
 * and maintain contextual coherence across transcript segments.
 */

/**
 * Check if previous text appears incomplete and should merge with next segment
 */
function shouldMergeWithPrevious(previous: string, current: string): boolean {
  if (!previous || !current) return false;

  const prevTrimmed = previous.trim();
  const currTrimmed = current.trim();

  // Check if previous sentence seems incomplete
  const incompleteSentencePatterns = [
    /\b(to|for|with|and|but|because|that|which|when|where|while|if|as|or|nor)\s*$/i,
    /,\s*$/, // Ends with comma
    /\.\.\.\s*$/, // Ends with ellipsis
    /:\s*$/, // Ends with colon
    /-\s*$/, // Ends with dash
  ];

  const hasIncompletePattern = incompleteSentencePatterns.some((pattern) =>
    pattern.test(prevTrimmed)
  );

  // Check if current text naturally continues the thought
  const continuesThought =
    !/^[A-Z]/.test(currTrimmed) || // Doesn't start with capital
    /^(to|for|with|and|but|because|that|which|when|where|while|if|as|or)\b/i.test(
      currTrimmed
    );

  // Additional heuristic: If previous is very short (< 15 chars), likely incomplete
  const isPreviousVeryShort = prevTrimmed.length < 15 && !/[.!?]$/.test(prevTrimmed);

  return hasIncompletePattern || continuesThought || isPreviousVeryShort;
}

/**
 * Detect if text contains a false start or self-correction pattern
 */
function cleanFalseStarts(text: string): string {
  // Remove patterns like "I think... well actually" or "um... so"
  let cleaned = text
    // Remove filler words followed by corrections
    .replaceAll(/\b(um|uh|like|you know)\s*\.\.\.\s*/gi, "")
    // Remove "I think... well actually/I mean" patterns
    .replaceAll(/\bI think\s*\.\.\.\s*(well\s+)?(actually|I mean)\b/gi, "I")
    // Remove repetitive starts: "The... the meeting"
    .replaceAll(/\b(\w+)\s*\.\.\.\s*\1\b/gi, "$1")
    // Clean up multiple spaces
    .replaceAll(/\s+/g, " ");

  return cleaned.trim();
}

/**
 * Determine the appropriate connector between segments
 */
function getConnector(prev: string, next: string): string {
  const prevTrimmed = prev.trim();
  const nextTrimmed = next.trim();

  // No connector if next starts with punctuation
  if (/^[,;.!?]/.test(nextTrimmed)) return "";

  // No connector if prev ends with dash or ellipsis (direct continuation)
  if (/-\s*$/.test(prevTrimmed) || /\.\.\.\s*$/.test(prevTrimmed)) return "";

  // Use space if next continues naturally (lowercase start or conjunction)
  if (
    !/^[A-Z]/.test(nextTrimmed) ||
    /^(and|but|or|so|yet|for|nor|to|with)\b/i.test(nextTrimmed)
  ) {
    return " ";
  }

  // Default to space for new sentences
  return " ";
}

export function mergePartialTranscripts(prev: string, next: string): string {
  if (!prev) return cleanFalseStarts(next);
  if (!next) return cleanFalseStarts(prev);

  // Clean false starts in both segments
  const cleanPrev = cleanFalseStarts(prev);
  const cleanNext = cleanFalseStarts(next);

  // STRATEGY 1: Context-based merging
  // Check if segments should merge based on linguistic patterns
  // This is crucial for streaming since API may split mid-sentence
  if (shouldMergeWithPrevious(cleanPrev, cleanNext)) {
    const connector = getConnector(cleanPrev, cleanNext);
    return (cleanPrev + connector + cleanNext).trim();
  }

  // STRATEGY 2: Overlap detection using LCS
  // When context is provided to Whisper, it may repeat the last few words
  // Find and deduplicate overlapping content
  const tail = cleanPrev.slice(-200);
  const head = cleanNext.slice(0, 200);

  const overlap = findLongestCommonSubsequence(tail, head);

  // Low confidence threshold: if overlap is too short, intelligently join
  if (overlap.length < 10) {
    const connector = getConnector(cleanPrev, cleanNext);
    return (cleanPrev + connector + cleanNext).trim();
  }

  // Found significant overlap - merge by removing duplicate
  const cutIndex = cleanPrev.lastIndexOf(overlap);

  if (cutIndex === -1) {
    // Overlap not found at expected position, fall back to smart concatenation
    const connector = getConnector(cleanPrev, cleanNext);
    return (cleanPrev + connector + cleanNext).trim();
  }

  // Merge: prev up to overlap end + next after overlap
  const overlapEnd = cutIndex + overlap.length;
  const merged = cleanPrev.slice(0, overlapEnd) + cleanNext.slice(overlap.length);

  return merged.trim();
}

function findLongestCommonSubsequence(str1: string, str2: string): string {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = new Array(m + 1)
    .fill(null)
    .map(() => new Array(n + 1).fill(0));

  // Build DP table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Reconstruct LCS
  let i = m;
  let j = n;
  const lcs: string[] = [];

  while (i > 0 && j > 0) {
    if (str1[i - 1] === str2[j - 1]) {
      lcs.unshift(str1[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return lcs.join("");
}

export { shouldMergeWithPrevious };


