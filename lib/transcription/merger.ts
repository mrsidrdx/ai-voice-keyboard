/**
 * Incremental transcription merging logic
 * Uses LCS (Longest Common Subsequence) to align overlapping segments
 */

export function mergePartialTranscripts(prev: string, next: string): string {
  if (!prev) return next;
  if (!next) return prev;

  // Find overlap window near the end of prev and start of next
  const tail = prev.slice(-200);
  const head = next.slice(0, 200);
  
  const overlap = findLongestCommonSubsequence(tail, head);
  
  // Low confidence threshold: if overlap is too short, just append
  if (overlap.length < 10) {
    return prev + " " + next;
  }
  
  // Find where overlap starts in prev
  const cutIndex = prev.lastIndexOf(overlap);
  
  if (cutIndex === -1) {
    return prev + " " + next;
  }
  
  // Merge: prev up to overlap + next after overlap
  const merged = prev.slice(0, cutIndex + overlap.length) + next.slice(overlap.length);
  
  return merged.trim();
}

function findLongestCommonSubsequence(str1: string, str2: string): string {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

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

