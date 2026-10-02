package api_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/adylezz/sezzle-calculator/backend/internal/api"
)

type response struct {
	Result *float64 `json:"result"`
	Error  *string  `json:"error"`
}

func TestRouter(t *testing.T) {
	const post, get = http.MethodPost, http.MethodGet

	tests := []struct {
		name       string
		method     string
		path       string
		body       string
		wantStatus int
		wantResult float64 //only checked when wantStatus 200
	}{
		// 200: success
		{"add", post, "/api/add", `{"a": 2, "b": 3}`, 200, 5},
		{"subtract", post, "/api/subtract", `{"a": 5, "b": 8}`, 200, -3},
		{"multiply", post, "/api/multiply", `{"a": 4, "b": 2.5}`, 200, 10},
		{"divide", post, "/api/divide", `{"a": 10, "b": 4}`, 200, 2.5},
		{"power", post, "/api/power", `{"a": 2, "b": 10}`, 200, 1024},
		{"percentage", post, "/api/percentage", `{"a": 50, "b": 200}`, 200, 100},
		{"sqrt", post, "/api/sqrt", `{"a": 9}`, 200, 3},
		{"sqrt ignores b", post, "/api/sqrt", `{"a": 16, "b": 99}`, 200, 4},
		{"zero is a valid value", post, "/api/add", `{"a": 0, "b": 0}`, 200, 0},

		// 400: bad request
		{"malformed JSON", post, "/api/add", `{"a": 2,`, 400, 0},
		{"empty body", post, "/api/add", ``, 400, 0},
		{"null body", post, "/api/add", `null`, 400, 0},
		{"array body", post, "/api/add", `[1, 2]`, 400, 0},
		{"string instead of number", post, "/api/add", `{"a": "2", "b": 3}`, 400, 0},
		{"unknown field", post, "/api/add", `{"a": 1, "b": 2, "c": 3}`, 400, 0},
		{"missing b", post, "/api/add", `{"a": 1}`, 400, 0},
		{"missing a in sqrt", post, "/api/sqrt", `{"b": 4}`, 400, 0},
		{"number out of float64 range", post, "/api/add", `{"a": 1e400, "b": 1}`, 400, 0},
		{"body over 1 KB", post, "/api/add", `{"a": 1, "b": 2` + strings.Repeat(" ", 2048) + `}`, 400, 0},
		{"trailing data after object", post, "/api/add", `{"a": 1, "b": 2}{"a": 3}`, 400, 0},

		// 422: mathematically invalid
		{"division by zero", post, "/api/divide", `{"a": 1, "b": 0}`, 422, 0},
		{"sqrt of negative", post, "/api/sqrt", `{"a": -4}`, 422, 0},
		{"power overflows", post, "/api/power", `{"a": 10, "b": 400}`, 422, 0},
		{"multiply overflows", post, "/api/multiply", `{"a": 1e308, "b": 10}`, 422, 0},

		// routing
		{"unknown operation", post, "/api/modulo", `{"a": 1, "b": 2}`, 404, 0},
		{"extra path segment", post, "/api/add/extra", `{"a": 1, "b": 2}`, 404, 0},
		{"wrong method", get, "/api/add", ``, 405, 0},
	}

	router := api.NewRouter()

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(tt.method, tt.path, strings.NewReader(tt.body))
			req.Header.Set("Content-Type", "application/json")
			rec := httptest.NewRecorder()

			router.ServeHTTP(rec, req)

			if rec.Code != tt.wantStatus {
				t.Fatalf("status = %d, want %d; body = %s", rec.Code, tt.wantStatus, rec.Body.String())
			}
			if ct := rec.Header().Get("Content-Type"); ct != "application/json" {
				t.Errorf("Content-Type = %q, want %q", ct, "application/json")
			}

			var got response
			if err := json.NewDecoder(rec.Body).Decode(&got); err != nil {
				t.Fatalf("response is not valid JSON: %v", err)
			}

			if tt.wantStatus == http.StatusOK {
				if got.Result == nil {
					t.Fatal("missing result field ")
				}
				if *got.Result != tt.wantResult {
					t.Errorf("result = %v, want %v", *got.Result, tt.wantResult)
				}
				if got.Error != nil {
					t.Errorf("unexpected error field: %q", *got.Error)
				}
				return
			}

			if got.Error == nil || *got.Error == "" {
				t.Error("missing error message")
			}
			if got.Result != nil {
				t.Errorf("unexpected result field: %v", *got.Result)
			}
		})
	}
}

func TestMethodNotAllowedSetsAllowHeader(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/add", nil)
	rec := httptest.NewRecorder()

	api.NewRouter().ServeHTTP(rec, req)

	if got := rec.Header().Get("Allow"); got != http.MethodPost {
		t.Errorf("Allow = %q, want %q", got, http.MethodPost)
	}
}
