import { useState, type FormEvent } from 'react'
import { calculate, type Operation } from './api'
import { formatResult, parseNumber, toggleSign } from './numbers'
import { OPERATIONS } from './operations'

type FieldErrors = { a?: string; b?: string }

export function Calculator() {
  const [operation, setOperation] = useState<Operation>('add')
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const needsB = OPERATIONS.find((op) => op.value === operation)?.needsB ?? true

  function resetOutput() {
    setResult(null)
    setError(null)
  }

  function updateA(value: string) {
    setA(value)
    setFieldErrors((prev) => ({ ...prev, a: undefined }))
    resetOutput()
  }

  function updateB(value: string) {
    setB(value)
    setFieldErrors((prev) => ({ ...prev, b: undefined }))
    resetOutput()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    resetOutput()

    const parsedA = parseNumber(a)
    const parsedB = needsB ? parseNumber(b) : null

    const errors: FieldErrors = {}
    if (!parsedA.ok) errors.a = parsedA.error
    if (parsedB && !parsedB.ok) errors.b = parsedB.error
    setFieldErrors(errors)
    if (!parsedA.ok || (parsedB && !parsedB.ok)) return

    setLoading(true)
    try {
      const value = await calculate(operation, parsedA.value, parsedB?.value)
      setResult(formatResult(value))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="calculator" onSubmit={handleSubmit}>
      <div className="display" aria-live="polite">
        {error !== null ? (
          <p className="display-error" role="alert">
            {error}
          </p>
        ) : result !== null ? (
          <output className="display-value">{result}</output>
        ) : (
          <span className="display-value" aria-hidden="true">
            0
          </span>
        )}
      </div>

      <div className="field">
        <label htmlFor="operation">Operation</label>
        <select
          id="operation"
          value={operation}
          onChange={(e) => {
            setOperation(e.target.value as Operation)
            setFieldErrors({})
            resetOutput()
          }}
        >
          {OPERATIONS.map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      </div>

      <NumberField
        id="a"
        label={needsB ? 'First number (a)' : 'Number (a)'}
        value={a}
        error={fieldErrors.a}
        onChange={updateA}
        onToggleSign={() => updateA(toggleSign(a))}
      />

      {needsB && (
        <NumberField
          id="b"
          label="Second number (b)"
          value={b}
          error={fieldErrors.b}
          onChange={updateB}
          onToggleSign={() => updateB(toggleSign(b))}
        />
      )}

      <button type="submit" className="key key-primary" disabled={loading}>
        <span aria-hidden="true">= </span>
        {loading ? 'Calculating…' : 'Calculate'}
      </button>
    </form>
  )
}

interface NumberFieldProps {
  id: string
  label: string
  value: string
  error?: string
  onChange: (value: string) => void
  onToggleSign: () => void
}

function NumberField({ id, label, value, error, onChange, onToggleSign }: NumberFieldProps) {
  const errorId = `${id}-error`
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-row">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        <button
          type="button"
          className="key key-sign"
          onClick={onToggleSign}
          aria-label={`Toggle sign of ${id}`}
        >
          ±
        </button>
      </div>
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  )
}