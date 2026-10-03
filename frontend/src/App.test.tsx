import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe ('App', () => {
    it('renders the calculator window', () => {
        render(<App />)
        expect(screen.getByRole('heading', { name: /calculator/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /calculate/i })).toBeInTheDocument()
    })
})