export function normalizeText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function countWords(text: string): number {
  const normalized = text.trim()
  if (!normalized) return 0
  return normalized.split(/\s+/).length
}
