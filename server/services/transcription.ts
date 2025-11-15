import { db } from "@/server/db";
import { logger } from "@/lib/logger";
import type { Result } from "@/lib/result";
import { getEnv } from "@/lib/env";

export type Transcription = {
  id: string;
  userId: string;
  text: string;
  audioUrl: string | null;
  duration: number;
  status: "PROCESSING" | "DONE" | "ERROR";
  createdAt: Date;
};

/**
 * Transcribe a single audio chunk with context from previous chunks
 * 
 * STREAMING WORKFLOW:
 * - Client sends audio chunks at regular intervals (e.g., every 2-3 seconds)
 * - Each chunk is transcribed with awareness of previous transcriptions
 * - Context parameter should contain the accumulated transcription so far
 * - Result is merged with accumulated text using mergePartialTranscripts()
 * 
 * @param audioBase64 - Base64 encoded audio chunk
 * @param context - Previously transcribed text from this session
 * @param dictionaryTerms - User's custom dictionary terms for accurate spelling
 */
export async function transcribeAudioSlice(
  audioBase64: string,
  context: string,
  dictionaryTerms: string[]
): Promise<Result<string, Error>> {
  try {
    const env = getEnv();
    const prompt = buildTranscriptionPrompt(context, dictionaryTerms);

    const formData = new FormData();
    const audioBlob = await base64ToBlob(audioBase64, "audio/webm");
    formData.append("file", audioBlob, "audio.webm");
    formData.append("model", "gpt-4o-transcribe");
    formData.append("language", "en");
    formData.append("prompt", prompt);

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Whisper API error: ${error}`);
    }

    const data = (await response.json()) as { text: string };
    logger.info("Transcription response", { text: data.text });
    return { ok: true, value: data.text };
  } catch (error) {
    logger.error("Failed to transcribe audio", error);
    return {
      ok: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

function buildTranscriptionPrompt(context: string, dictionaryTerms: string[]): string {
  const baseInstructions = `Format the transcription into clean, grammatically correct, and contextually consistent text.

CRITICAL: Apply retrospective adjustments based on context that emerges later in the speech.

Guidelines:

1. SENTENCE CONTINUATION DETECTION
   - When a pause occurs mid-thought followed by continuation, merge the segments into a single sentence
   - Look for incomplete sentences (missing objects, dangling prepositions, incomplete clauses)
   - Detect when the next segment completes or clarifies the previous thought
   - Example: "I went to the store... to buy some milk" → "I went to the store to buy some milk."

2. CONTEXTUAL RETROSPECTION
   - After processing each new segment, review the previous 2-3 sentences
   - Adjust punctuation and structure if new information provides clarity
   - If a later statement clarifies an earlier ambiguous one, restructure for coherence
   - Example: "The meeting is important. Tomorrow at 3pm." → "The meeting is important and will be held tomorrow at 3pm."

3. NATURAL PAUSE HANDLING
   - Brief pauses (thinking pauses) should not create sentence breaks
   - Only create new sentences when there's a clear topic shift or complete thought
   - Preserve intentional emphasis or dramatic pauses with appropriate punctuation (em dash, ellipsis)

4. FALSE START CORRECTION
   - Remove or integrate false starts and self-corrections naturally
   - Example: "I think... well actually I know that..." → "I know that..."

5. PRESERVE INTENT
   - Don't over-correct informal speech if it reflects the speaker's style
   - Maintain the speaker's emphasis and meaning
   - Keep appropriate paragraph breaks for topic shifts`;

  // Build the prompt with context and dictionary terms
  const contextWindow = getContextWindow(context);
  let prompt = baseInstructions;

  if (contextWindow) {
    prompt += `\n\nPREVIOUS TRANSCRIPTION CONTEXT:\n${contextWindow}`;
  }

  if (dictionaryTerms.length > 0) {
    const termsList = dictionaryTerms.join(", ");
    prompt += `\n\n6. DICTIONARY TERMS
   - Apply the provided dictionary terms and spellings where relevant: ${termsList}`;
  }

  return prompt;
}

/**
 * Extract a rolling context window from the accumulated transcription
 * Keeps approximately last 200-300 characters to stay within API limits
 * while providing enough context for continuity
 */
function getContextWindow(fullContext: string, maxChars = 300): string {
  if (!fullContext || fullContext.trim().length === 0) {
    return "";
  }

  const trimmed = fullContext.trim();
  
  // If context is short enough, return it all
  if (trimmed.length <= maxChars) {
    return trimmed;
  }

  // Get the last N characters
  let contextWindow = trimmed.slice(-maxChars);
  
  // Try to start at a sentence boundary for better coherence
  const sentenceStart = contextWindow.search(/[.!?]\s+[A-Z]/);
  if (sentenceStart !== -1 && sentenceStart < maxChars / 2) {
    // Found a sentence boundary in the first half, use it
    contextWindow = contextWindow.slice(sentenceStart + 2); // +2 to skip ". "
  } else {
    // Otherwise, try to start at a word boundary
    const wordStart = contextWindow.indexOf(" ");
    if (wordStart !== -1 && wordStart < 50) {
      contextWindow = contextWindow.slice(wordStart + 1);
    }
  }

  return contextWindow;
}

async function base64ToBlob(base64: string, mimeType: string): Promise<Blob> {
  const response = await fetch(`data:${mimeType};base64,${base64}`);
  return response.blob();
}

export async function createTranscription(
  userId: string,
  text: string,
  duration: number,
  audioUrl?: string
): Promise<Result<Transcription, Error>> {
  try {
    const transcription = await db.transcription.create({
      data: {
        userId,
        text,
        duration,
        audioUrl: audioUrl ?? null,
        status: "DONE",
      },
    });

    logger.info("Transcription created", {
      userId,
      transcriptionId: transcription.id,
    });
    return { ok: true, value: transcription };
  } catch (error) {
    logger.error("Failed to create transcription", error, { userId });
    return {
      ok: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export async function getUserTranscriptions(
  userId: string,
  limit = 50,
  cursor?: string
): Promise<Result<{ transcriptions: Transcription[]; nextCursor: string | null }, Error>> {
  try {
    const transcriptions = await db.transcription.findMany({
      where: { userId },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "desc" },
    });

    const hasMore = transcriptions.length > limit;
    const items = hasMore ? transcriptions.slice(0, limit) : transcriptions;
    const nextCursor = hasMore ? items.at(-1)?.id ?? null : null;

    return {
      ok: true,
      value: {
        transcriptions: items,
        nextCursor,
      },
    };
  } catch (error) {
    logger.error("Failed to get transcriptions", error, { userId });
    return {
      ok: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export async function deleteTranscription(
  userId: string,
  id: string
): Promise<Result<void, Error>> {
  try {
    // Verify ownership
    const existing = await db.transcription.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return { ok: false, error: new Error("Transcription not found") };
    }

    await db.transcription.delete({ where: { id } });

    logger.info("Transcription deleted", { userId, transcriptionId: id });
    return { ok: true, value: undefined };
  } catch (error) {
    logger.error("Failed to delete transcription", error, { userId, id });
    return {
      ok: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export { mergePartialTranscripts } from "@/lib/transcription/merger";

