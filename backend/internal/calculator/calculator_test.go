package calculator

import (
	"errors"
	"math"
	"testing"
)

const epsilon = 1e-9

// almostEqual checks if two float64 values are almost equal
func almostEqual(a, b float64) bool {
	return math.Abs(a-b) <= epsilon
}

func TestBinaryOperations(t *testing.T) {
	tests := []struct {
		name    string
		op      func(a, b float64) (float64, error)
		a, b    float64
		want    float64
		wantErr error
	}{
		{"add positive numbers", Add, 2, 3, 5, nil},
		{"add negative numbers", Add, -2, -3, -5, nil},
		{"add decimal numbers", Add, 0.1, 0.2, 0.3, nil},
		{"add overflow", Add, math.MaxFloat64, math.MaxFloat64, 0, ErrInvalidResult},
		{"subtract", Subtract, 10, 4, 6, nil},
		{"subtract to negative", Subtract, 4, 10, -6, nil},
		{"multiply", Multiply, 3, 4, 12, nil},
		{"multiply by zero", Multiply, 5, 0, 0, nil},
		{"multiply overflow", Multiply, math.MaxFloat64, 2, 0, ErrInvalidResult},
		{"divide", Divide, 10, 4, 2.5, nil},
		{"divide negative", Divide, -9, 3, -3, nil},
		{"divide by zero", Divide, 1, 0, 0, ErrDivisionByZero},
		{"divide zero by zero", Divide, 0, 0, 0, ErrDivisionByZero},
		{"divide overflow", Divide, math.MaxFloat64, 0.1, 0, ErrInvalidResult},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := tt.op(tt.a, tt.b)

			if !errors.Is(err, tt.wantErr) {
				t.Fatalf("error = %v, want %v", err, tt.wantErr)
			}
			if tt.wantErr != nil {
				return
			}
			if !almostEqual(got, tt.want) {
				t.Errorf("got %v, want %v", got, tt.want)
			}
		})
	}
}
