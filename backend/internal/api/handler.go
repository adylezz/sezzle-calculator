package api

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"

	"github.com/adylezz/sezzle-calculator/backend/internal/calculator"
)

// maxBodyBytes caps the reques body, a calculation need a few bytes
const maxBodyBytes = 1 << 10 // 1KB

// calculate handles POST/api/{operation}
func calculate(w http.ResponseWriter, r *http.Request) {
	name := r.PathValue("operation")
	op, ok := operations[name]
	if !ok {
		writeError(w, http.StatusNotFound, "unknown operation: "+name)
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, maxBodyBytes)
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()

	var req calculateRequest
	if err := dec.Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "request body must be a JSON object with numeric fields")
		return
	}
	if err := dec.Decode(&struct{}{}); err != io.EOF {
		writeError(w, http.StatusBadRequest, "request body must be a JSON object")
		return
	}
	if req.A == nil {
		writeError(w, http.StatusBadRequest, `missing required field "a"`)
		return
	}
	if op.needsB && req.B == nil {
		writeError(w, http.StatusBadRequest, `missing required field "b"`)
		return
	}

	var b float64
	if req.B != nil {
		b = *req.B
	}

	result, err := op.fn(*req.A, b)
	if err != nil {
		writeCalculatorError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, resultResponse{Result: result})
}

// writeCalculatorError maps calculator errors to http responses
// Known domain errors are 422, anything else is 500 without internal details
func writeCalculatorError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, calculator.ErrDivisionByZero),
		errors.Is(err, calculator.ErrNegativeSqrt),
		errors.Is(err, calculator.ErrInvalidResult):
		writeError(w, http.StatusUnprocessableEntity, err.Error())

	default:
		writeError(w, http.StatusInternalServerError, "internal server error")
	}
}
