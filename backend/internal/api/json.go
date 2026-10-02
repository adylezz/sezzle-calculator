// Package api exposes the calculator package as a JSON REST API
package api

import (
	"encoding/json"
	"net/http"
)

// calculateRequest is the JSON body accepted by every operation
// Fields are pointers so missing field (nil) can be told apart of 0
type calculateRequest struct {
	A *float64 `json:"a"`
	B *float64 `json:"b"`
}

// resultResponse is the JSON body returned on success
type resultResponse struct {
	Result float64 `json:"result"`
}

// errorResponse is the Json body returned on any failure
type errorResponse struct {
	Error string `json:"error"`
}

// writeJSON writes v as JSON with the given http status code
func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	// The status is already sent, so an encoding error cannot be
	// reported to the client, it is deliberately ignored
	_ = json.NewEncoder(w).Encode(v)
}

// writeError writes a JSON error body with the given http status code
func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, errorResponse{Error: msg})
}
