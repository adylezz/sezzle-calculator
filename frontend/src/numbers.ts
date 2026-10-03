export type ParseResult =
    | { ok: true; value: number }
    | { ok: false; error: string }

const NUMBER_PATTERN = /^-?(\d+(\.\d*)?|\.\d+)$/

export function parseNumber(input: string): ParseResult {
    const text = input.trim()
    if (text === '') {
        return { ok: false, error: 'This field is required.'}
    }
    if (text.includes(',')) {
        return { ok: false, error: 'Use a dot (.) as the decimal separator.'}
    }
    if (!NUMBER_PATTERN.test(text)) {
        return { ok: false, error: 'Enter a valud number.'}
    }
    const value = Number(text)
    if (!Number.isFinite(value)) {
        return { ok: false, error: 'This number is too large.'}
    }
    return { ok: true, value }
}

// Rounds to 12 significant digits to hide float noise
export function formatResult(value: number): string {
    return String(Number(value.toPrecision(12)))
}