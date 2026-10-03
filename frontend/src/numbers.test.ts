import { describe, expect, it } from 'vitest'
import { formatResult, parseNumber, toggleSign } from './numbers'

describe('parseNumber', () => {
  it.each([
    ['42', 42],
    ['-3', -3],
    ['2.5', 2.5],
    ['2,5', 2.5],
    ['-1,25', -1.25],
    ['.5', 0.5],
    [',5', 0.5],
    ['5.', 5],
    ['  7  ', 7],
    ['0', 0],
  ])('parses %j as %s', (input, expected) => {
    expect(parseNumber(input)).toEqual({ ok: true, value: expected })
  })

  it.each([
    ['', 'This field is required.'],
    ['   ', 'This field is required.'],
    ['1,000.5', 'Use only one decimal separator.'],
    ['1,2,3', 'Use only one decimal separator.'],
    ['1.2.3', 'Use only one decimal separator.'],
    ['abc', 'Enter a valid number.'],
    ['1e3', 'Enter a valid number.'],
    ['+5', 'Enter a valid number.'],
    ['-', 'Enter a valid number.'],
  ])('rejects %j', (input, error) => {
    expect(parseNumber(input)).toEqual({ ok: false, error })
  })

  it('rejects numbers too large for float64', () => {
    expect(parseNumber('9'.repeat(400))).toEqual({
      ok: false,
      error: 'This number is too large.',
    })
  })
})

describe('toggleSign', () => {
  it.each([
    ['5', '-5'],
    ['-5', '5'],
    ['', '-'],
    ['-', ''],
    [' 2.5 ', '-2.5'],
  ])('turns %j into %j', (input, expected) => {
    expect(toggleSign(input)).toBe(expected)
  })
})

describe('formatResult', () => {
  it.each([
    [0.1 + 0.2, '0.3'],
    [5, '5'],
    [-2.5, '-2.5'],
    [1 / 3, '0.333333333333'],
    [1e21, '1e+21'],
  ])('formats %s as %s', (value, expected) => {
    expect(formatResult(value)).toBe(expected)
  })
})