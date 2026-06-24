export function createObjectUrl(blob: Blob | null) {
  if (!blob) {
    return "";
  }

  return URL.createObjectURL(blob);
}

export function getAudioFileName(userId: string, entryId: string) {
  return `${userId}/${entryId}.webm`;
}
