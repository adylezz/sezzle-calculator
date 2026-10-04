package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/adylezz/sezzle-calculator/backend/internal/api"
)

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}

func run() error {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	srv := &http.Server{
		Addr:              ":" + port,
		Handler:           newHandler(os.Getenv("STATIC_DIR")),
		ReadHeaderTimeout: 2 * time.Second,
		ReadTimeout:       5 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	serverErr := make(chan error, 1)
	go func() {
		log.Printf("server listening on %s", srv.Addr)
		serverErr <- srv.ListenAndServe()
	}()

	select {
	case err := <-serverErr:
		return err // failed to start, port already in use
	case <-ctx.Done():
	}

	log.Println("shutting down...")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return srv.Shutdown(shutdownCtx)
}

// newHandler returns the API router alone, or, when staticDir is set,
// a mux that serves the API under /api/ and the frontend build everywhere else.
func newHandler(staticDir string) http.Handler {
	apiRouter := api.NewRouter()
	if staticDir == "" {
		return apiRouter
	}

	mux := http.NewServeMux()
	mux.Handle("/api/", apiRouter)
	mux.Handle("/", http.FileServer(http.Dir(staticDir)))
	return mux
}
