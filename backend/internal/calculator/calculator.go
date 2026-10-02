package calculator

import (
	"errors"
	"math"
)

// Errors
var (
	ErrDivisionByZero = errors.New("division by zero")
	ErrInvalidResult  = errors.New("result is not a finite number")
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
