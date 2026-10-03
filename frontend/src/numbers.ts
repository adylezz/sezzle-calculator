export type ParseResult =
  | { ok: true; value: number }
  | { ok: false; error: string }

const NUMBER_PATTERN = /^-?(\d+([.,]\d*)?|[.,]\d+)$/

export function parseNumber(input: string): ParseResult {
  const text = input.trim()
  if (text === '') {
    return { ok: false, error: 'This field is required.' }
  }
  if ((text.match(/[.,]/g) ?? []).length > 1) {
    return { ok: false, error: 'Use only one decimal separator.' }
  }
  if (!NUMBER_PATTERN.test(text)) {
    return { ok: false, error: 'Enter a valid number.' }
  }
  const value = Number(text.replace(',', '.'))
  if (!Number.isFinite(value)) {
    return { ok: false, error: 'This number is too large.' }
  }
  return { ok: true, value }
}

// Flips the sign of the typed text. An empty field becomes "-" so users
// on keyboards without a minus key (iOS decimal pad) can start a negative number.
export function toggleSign(input: string): string {
  const text = input.trim()
  return text.startsWith('-') ? text.slice(1) : `-${text}`
}

// Rounds to 12 significant digits to hide float64 noise (0.1 + 0.2 -> 0.3).
export function formatResult(value: number): string {
  return String(Number(value.toPrecision(12)))
}