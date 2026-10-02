package calculator

import (
	"errors"
	"math"
)

// Errors
var (
	ErrDivisionByZero = errors.New("division by zero")
	ErrInvalidResult  = errors.New("result is not a finite number")
	ErrNegativeSqrt   = errors.New("square root of a negative number")
)

// checkResult returns ErrInvalidResult if the result is not a finite number
func checkResult(r float64) (float64, error) {
	if math.IsInf(r, 0) || math.IsNaN(r) {
		return 0, ErrInvalidResult
	}
	return r, nil
}

// Adition
func Add(a, b float64) (float64, error) {
	return checkResult(a + b)
}

// Subtraction
func Subtract(a, b float64) (float64, error) {
	return checkResult(a - b)
}

// Multiply
func Multiply(a, b float64) (float64, error) {
	return checkResult(a * b)
}

// Divide + ErrDivisionByZero
func Divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, ErrDivisionByZero
	}
	return checkResult(a / b)
}

// Power returns a raised to the power of b
func Power(a, b float64) (float64, error) {
	return checkResult(math.Pow(a, b))
}

// Square root of a + negative
func Sqrt(a float64) (float64, error) {
	if a < 0 {
		return 0, ErrNegativeSqrt
	}
	return checkResult(math.Sqrt(a))
}

// Percentage of b
func Percentage(a, b float64) (float64, error) {
	return checkResult(a * b / 100)
}
