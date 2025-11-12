/**
 * Audio encoding utilities
 * Converts Blob to base64 for API transmission
 */

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove data URL prefix if present
      const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function base64ToBlob(base64: string, mimeType: string): Promise<Blob> {
  const response = await fetch(`data:${mimeType};base64,${base64}`);
  return response.blob();
}

