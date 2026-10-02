package api

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestWriteCalculatorErrorHidesUnexpectedErrors(t *testing.T) {
	rec := httptest.NewRecorder()

	writeCalculatorError(rec, errors.New("secret internal detail"))

	if rec.Code != http.StatusInternalServerError {
		t.Errorf("status = %d, want %d", rec.Code, http.StatusInternalServerError)
	}
	if strings.Contains(rec.Body.String(), "secret") {
		t.Errorf("response leaks internal error: %s", rec.Body.String())
	}
}
