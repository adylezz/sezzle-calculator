export type Operation =
    | 'add'
    | 'subtract'
    | 'multiply'
    | 'divide'
    | 'power'
    | 'percentage'
    | 'sqrt'

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value == 'object' && value != null
}

// Sends a calculation to the backend and returns the result
// Throws an Error with a user-facing message on any failure
export async function calculate(
    operation: Operation,
    a: number,
    b?: number,
): Promise<number> {
    const body = b == undefined ? { a } : { a, b }

    const response = await fetch(`/api/${operation}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    }).catch(() => {
        throw new Error('Could not reach the server. Please check that the backend is running.')
    })

    const data: unknown = await response.json().catch(() => null)

    if (!response.ok) {
        const message =
        isObject(data) && typeof data.error === 'string'
            ? data.error
            : `Request failed with status ${response.status}.`
        throw new Error(message)
    }

    if (!isObject(data) || typeof data.result !== 'number') {
        throw new Error('Unexpected response from the server.')
    }

    return data.result
}