# AI Prompts Used

I used Claude as a tutor to learn Go, React and TypeScript while building this project step by step.

## 1. Planning and architecture
> [Pasted the assignment]
> "I want to build this step by step with you so I can understand how it workds, how it was built and every detail of it."

**Outcome:** Agreed on the architecture (pure calculation logic separated from the HTTP layer), Go standard library with no frameworks, a form-based UI instead of a keypad to avoid expression parsing and a phased plan.

> Act as a senior Go engineer mentoring a developer who is new to Go.
> Context: I'm building a calculator REST API for a take-home assignment. Phase 2 is done: internal/calculator exposes pure functions (Add, Subtract, Multiply, Divide, Power, Percentage take (a, b float64); Sqrt takes (a float64); all return (float64, error)) and sentinel errors (ErrDivisionByZero, ErrNegativeSqrt, ErrInvalidResult), tested at 100%.

> Task: Help me implement internal/api: HTTP handlers that decode JSON, validate input, call the calculator package, and return JSON results or errors. Wire it in cmd/server. Include handler tests with httptest.

> Constraints:
>    - Go standard library only (net/http, Go 1.22+ routing patterns)
>    - internal/calculator must not change or import anything from api
>    - Map calculator errors to HTTP status codes with errors.Is
>    - Distinguish a missing field from a zero value
>    - Every response, including errors, is JSON with a consistent shape

> Process:
>    - Explain each concept before showing code, one step at a time
>    - Tell me how to verify each step before moving on
>    - If a design decision is open (endpoint design, error format, status codes), present the trade-offs and ask me instead of assuming

**Outcome:** Agreed and shared the phases we need to add JSON and helpers, register operations, handler, decodification and errors mapping, tests with httptest and try curl.


## 2. Environment setup and debugging
> "`go version` returns 'go is not recognized' right after installing Go with winget."

**Outcome:** Learned that terminals load PATH at startup; restarting the editor fixed it.

> "`go run ./cmd/server` returns 'directory not found'." (+ output of `tree /f`)

**Outcome:** The file had been created in a misnamed folder; I fixed the project structure.