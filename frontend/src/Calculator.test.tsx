import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { calculate } from './api'
import { Calculator } from './Calculator'

vi.mock('./api', () => ({ calculate: vi.fn() }))
const calculateMock = vi.mocked(calculate)

describe('Calculator', () => {
  beforeEach(() => {
    calculateMock.mockReset()
  })

  it('sends both numbers and shows the result', async () => {
    calculateMock.mockResolvedValue(5)
    const user = userEvent.setup()
    render(<Calculator />)

    await user.type(screen.getByLabelText(/first number/i), '2')
    await user.type(screen.getByLabelText(/second number/i), '3')
    await user.click(screen.getByRole('button', { name: /calculate/i }))

    expect(calculateMock).toHaveBeenCalledWith('add', 2, 3)
    expect(await screen.findByRole('status')).toHaveTextContent('5')
  })

  it('hides the second input for square root and sends only a', async () => {
    calculateMock.mockResolvedValue(3)
    const user = userEvent.setup()
    render(<Calculator />)

    await user.selectOptions(screen.getByLabelText(/operation/i), 'sqrt')
    expect(screen.queryByLabelText(/second number/i)).not.toBeInTheDocument()

    await user.type(screen.getByLabelText(/number \(a\)/i), '9')
    await user.click(screen.getByRole('button', { name: /calculate/i }))

    expect(calculateMock).toHaveBeenCalledWith('sqrt', 9, undefined)
    expect(await screen.findByRole('status')).toHaveTextContent('3')
  })

  it('shows field errors and does not call the API', async () => {
    const user = userEvent.setup()
    render(<Calculator />)

    const inputA = screen.getByLabelText(/first number/i)
    await user.type(inputA, 'abc')
    await user.click(screen.getByRole('button', { name: /calculate/i }))

    expect(screen.getByText('Enter a valid number.')).toBeInTheDocument()
    expect(screen.getByText('This field is required.')).toBeInTheDocument()
    expect(inputA).toHaveAttribute('aria-invalid', 'true')
    expect(calculateMock).not.toHaveBeenCalled()
  })

  it('shows the error returned by the API', async () => {
    calculateMock.mockRejectedValue(new Error('division by zero'))
    const user = userEvent.setup()
    render(<Calculator />)

    await user.type(screen.getByLabelText(/first number/i), '1')
    await user.type(screen.getByLabelText(/second number/i), '0')
    await user.click(screen.getByRole('button', { name: /calculate/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('division by zero')
  })

  it('disables the button while waiting for the response', async () => {
    calculateMock.mockReturnValue(new Promise(() => {}))
    const user = userEvent.setup()
    render(<Calculator />)

    await user.type(screen.getByLabelText(/first number/i), '1')
    await user.type(screen.getByLabelText(/second number/i), '2')
    await user.click(screen.getByRole('button', { name: /calculate/i }))

    expect(screen.getByRole('button', { name: /calculating/i })).toBeDisabled()
  })

  it('clears the previous result when an input changes', async () => {
    calculateMock.mockResolvedValue(5)
    const user = userEvent.setup()
    render(<Calculator />)

    const inputA = screen.getByLabelText(/first number/i)
    await user.type(inputA, '2')
    await user.type(screen.getByLabelText(/second number/i), '3')
    await user.click(screen.getByRole('button', { name: /calculate/i }))
    await screen.findByRole('status')

    await user.type(inputA, '1')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
  it('accepts a comma as decimal separator', async () => {
    calculateMock.mockResolvedValue(4.5)
    const user = userEvent.setup()
    render(<Calculator />)

    await user.type(screen.getByLabelText(/first number/i), '2,5')
    await user.type(screen.getByLabelText(/second number/i), '2')
    await user.click(screen.getByRole('button', { name: /calculate/i }))

    expect(calculateMock).toHaveBeenCalledWith('add', 2.5, 2)
  })

  it('toggles the sign of a', async () => {
    calculateMock.mockResolvedValue(-2)
    const user = userEvent.setup()
    render(<Calculator />)

    const inputA = screen.getByLabelText(/first number/i)
    await user.type(inputA, '5')
    await user.click(screen.getByRole('button', { name: 'Toggle sign of a' }))
    expect(inputA).toHaveValue('-5')

    await user.type(screen.getByLabelText(/second number/i), '3')
    await user.click(screen.getByRole('button', { name: /calculate/i }))
    expect(calculateMock).toHaveBeenCalledWith('add', -5, 3)
  })

  it('toggles the sign of b', async () => {
    calculateMock.mockResolvedValue(2)
    const user = userEvent.setup()
    render(<Calculator />)

    await user.type(screen.getByLabelText(/first number/i), '5')

    const inputB = screen.getByLabelText(/second number/i)
    await user.type(inputB, '3')
    await user.click(screen.getByRole('button', { name: 'Toggle sign of b' }))
    expect(inputB).toHaveValue('-3')

    await user.click(screen.getByRole('button', { name: /calculate/i }))
    expect(calculateMock).toHaveBeenCalledWith('add', 5, -3)
  })

  it('shows a generic message when the failure is not an Error', async () => {
    calculateMock.mockRejectedValue('boom')
    const user = userEvent.setup()
    render(<Calculator />)

    await user.type(screen.getByLabelText(/first number/i), '1')
    await user.type(screen.getByLabelText(/second number/i), '2')
    await user.click(screen.getByRole('button', { name: /calculate/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong.')
  })
})