import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const RECORDINGS_DIR = path.resolve("recordings");

export async function saveCandidateAudio({ audioBuffer, mimeType }) {
  await mkdir(RECORDINGS_DIR, { recursive: true });

  const extension = mimeType?.includes("wav") ? "wav" : "webm";
  const fileName = `candidate-${new Date().toISOString().replace(/[:.]/g, "-")}.${extension}`;
  const filePath = path.join(RECORDINGS_DIR, fileName);

  await writeFile(filePath, audioBuffer);

  return {
    fileName,
    filePath,
  };
}
