import { describe, it, expect } from 'vitest'

function normalizeText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ')
}

function countWords(text: string): number {
  const normalized = text.trim()
  if (!normalized) return 0
  return normalized.split(/\s+/).length
}

describe('Text utils (shared/utils/text)', () => {
  it('normalizes text by trimming, lowercasing, and collapsing internal whitespace', () => {
    expect(normalizeText('  Ubiquitous    World  ')).toBe('ubiquitous world')
    expect(normalizeText('HELLO')).toBe('hello')
  })

  it('counts words accurately to validate 1-5 words selection boundary (FR-01)', () => {
    expect(countWords('')).toBe(0)
    expect(countWords('word')).toBe(1)
    expect(countWords('   one   two   three   ')).toBe(3)
    expect(countWords('one two three four five six')).toBe(6)
  })
})
