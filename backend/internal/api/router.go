package api

import "net/http"

// NewRouter returns an http.Handler with all API toutes registered
func NewRouter() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/{operation}", calculate)
	mux.HandleFunc("/api/{operation}", methodNotAllowed)
	mux.HandleFunc("/api/", notFound)
	return mux
}

// methodNotAllowed handles non-POST request to a valid operation path
func methodNotAllowed(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Allow", http.MethodPost)
	writeError(w, http.StatusMethodNotAllowed, "method not allowed")
}

// notFound handles any other path under api
func notFound(w http.ResponseWriter, r *http.Request) {
	writeError(w, http.StatusNotFound, "not found")
}
