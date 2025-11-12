import { db } from "@/server/db";
import { logger } from "@/lib/logger";
import type { Result } from "@/lib/result";
import { getEnv } from "@/lib/env";
import { mergePartialTranscripts } from "@/lib/transcription/merger";

export type Transcription = {
  id: string;
  userId: string;
  text: string;
  audioUrl: string | null;
  duration: number;
  status: "PROCESSING" | "DONE" | "ERROR";
  createdAt: Date;
};

export async function transcribeAudioSlice(
  audioBase64: string,
  context: string,
  dictionaryTerms: string[]
): Promise<Result<string, Error>> {
  try {
    const env = getEnv();
    const prompt = buildTranscriptionPrompt(dictionaryTerms);

    const formData = new FormData();
    const audioBlob = await base64ToBlob(audioBase64, "audio/webm");
    formData.append("file", audioBlob, "audio.webm");
    formData.append("model", "gpt-4o-transcribe");
    formData.append("language", "en");
    formData.append("prompt", prompt);
    // if (context) {
    //   formData.append("initial_prompt", context);
    // }

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

function buildTranscriptionPrompt(dictionaryTerms: string[]): string {
  if (dictionaryTerms.length === 0) {
    return `Format the transcription into clean, grammatically correct, and contextually consistent text.`;
  }

  const termsList = dictionaryTerms.join(", ");
  return `Format the transcription into clean, grammatically correct, and contextually consistent text. Apply the provided dictionary terms ${termsList} and spellings where relevant.
  `;
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
    const nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null;

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

export { mergePartialTranscripts };

