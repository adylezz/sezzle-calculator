import type { Operation } from './api'

export interface OperationOption {
    value: Operation
    label: string
    needsB: boolean
}

export const OPERATIONS: OperationOption[] = [
    { value: 'add', label: 'Add (a + b)', needsB: true },
    { value: 'subtract', label: 'Subtract (a - b)', needsB: true },
    { value: 'multiply', label: 'Multiply (a × b)', needsB: true },
    { value: 'divide', label: 'Divide (a ÷ b)', needsB: true },
    { value: 'power', label: 'Power (a ^ b)', needsB: true },
    { value: 'percentage', label: 'Percentage (a% of b)', needsB: true },
    { value: 'sqrt', label: 'Square Root (√a)', needsB: false },
]