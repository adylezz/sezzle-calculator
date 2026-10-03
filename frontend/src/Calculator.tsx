import { useState, type FormEvent } from 'react'
import { calculate, type Operation } from './api'
import { formatResult, parseNumber } from './numbers'
import { OPERATIONS } from './operations'

type FieldErrors = { a?: string; b?: string }

export function Calculator() {
    const [operation, setOperation] = useState<Operation>('add')
    const [a, setA] = useState('')
    const [b, setB] = useState('')
    const [FieldErrors, setFieldErrors] = useState<FieldErrors>({})
    const [result, setResult] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const needsB = OPERATIONS.find((op) => op.value === operation)?.needsB ?? true

    function resetOutput() {
        setResult(null)
        setError(null)
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
          error={FieldErrors.a}
          onChange={(value) => {
            setA(value)
            setFieldErrors((prev) => ({ ...prev, a: undefined }))
            resetOutput()
          }}
        />
  
        {needsB && (
          <NumberField
            id="b"
            label="Second number (b)"
            value={b}
            error={FieldErrors.b}
            onChange={(value) => {
              setB(value)
              setFieldErrors((prev) => ({ ...prev, b: undefined }))
              resetOutput()
            }}
          />
        )}
  
        <button type="submit" disabled={loading}>
          {loading ? 'Calculating…' : 'Calculate'}
        </button>
  
        <div aria-live="polite">
          {result !== null && (
            <p className="result">
              Result: <output>{result}</output>
            </p>
          )}
        </div>
  
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </form>
    )
}

interface NumberFieldProps {
    id: string
    label: string
    value: string
    error?: string
    onChange: (value: string) => void
}

function NumberField({ id, label, value, error, onChange }: NumberFieldProps) {
    const errorId = `${id}-error`
    return (
        <div className="field">
        <label htmlFor={id}>{label}</label>
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
        {error && (
            <p id={errorId} className="field-error">
            {error}
            </p>
        )}
        </div>
    )
}