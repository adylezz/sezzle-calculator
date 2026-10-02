package api

import "github.com/adylezz/sezzle-calculator/backend/internal/calculator"

// operations describes how to run one calculator operation
type operation struct {
	needsB bool
	fn     func(a, b float64) (float64, error)
}

// operations maps the {op} path segment to its implementation
var operations = map[string]operation{
	"add":        {needsB: true, fn: calculator.Add},
	"subtract":   {needsB: true, fn: calculator.Subtract},
	"multiply":   {needsB: true, fn: calculator.Multiply},
	"divide":     {needsB: true, fn: calculator.Divide},
	"power":      {needsB: true, fn: calculator.Power},
	"percentage": {needsB: true, fn: calculator.Percentage},
	"sqrt":       {needsB: true, fn: sqrt},
}

// sqrt adapts calcularot. Sqrt to the two-operand signature
// b is ignored by design: square root takes a single operand
func sqrt(a, _ float64) (float64, error) {
	return calculator.Sqrt(a)
}
