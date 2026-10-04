# AI Usage Log

## How I used AI

- **Tool:** Claude (Anthropic), through the chat interface.
- **Starting point:** I had no prior experience with Go, React or TypeScript. I used Claude as a tutor and reviewer so I could build this project step by step and understand every part of it.
- **Who wrote the code:** I wrote most of the code myself after Claude explained each concept. In some places Claude provided code that I adapted. I read, ran and tested every change before committing it.
- **Design decisions:** When a decision was open (endpoint design, status codes, how to serve the frontend), I asked Claude to lay out the trade-offs and I chose.
- **Verification:** Every change was checked with tests, `curl` or by running the app. The examples in the README are real outputs, not expected ones.
- **About this log:** My conversations were in Spanish; the prompts below are translated. Long prompts are trimmed with `[...]`.

## 1. Planning and architecture

> [Pasted the assignment]
> "I want to build this step by step with you so I can understand how it works, how it is built and every detail of it."

**Outcome:** Architecture with pure calculation logic separated from the HTTP layer; Go standard library only; a form-based UI instead of a keypad, to avoid parsing expressions; a phased plan.

## 2. Calculator logic

> "I need the calculator to have Addition, Subtraction, Multiplication, Division and, as optional: Exponentiation, Square Root, Percentage. Intuitive UI for the frontend (React), and the backend (REST API) should use JSON."

**Outcome:** A step-by-step plan, starting with the pure logic in `internal/calculator`: one function per operation, sentinel errors (`ErrDivisionByZero`, `ErrNegativeSqrt`, `ErrInvalidResult`) and table-driven tests at 100% coverage. I chose `float64`, documenting the precision trade-off, and defined percentage as `a × b / 100`.

## 3. HTTP layer

> Act as a senior Go engineer mentoring a developer who is new to Go. [...]
> Task: Help me implement internal/api: HTTP handlers that decode JSON, validate input, call the calculator package, and return JSON results or errors. [...]
> Constraints: Go standard library only; internal/calculator must not change; map calculator errors to status codes with errors.Is; distinguish a missing field from a zero value; every response is JSON with a consistent shape.
> Process: explain each concept before showing code, one step at a time; tell me how to verify each step; if a design decision is open, present the trade-offs and ask me.

**Outcome:** Built the layer in steps: request/response types and JSON helpers, an operation registry, the handler, strict decoding, error-to-status mapping, `httptest` tests and manual checks with `curl`.

## 4. Environment setup and debugging

> "`go version` returns 'go is not recognized' right after installing Go with winget."

**Outcome:** Terminals load PATH at startup; restarting the editor fixed it.

> "`go run ./cmd/server` returns 'directory not found'." (+ output of `tree /f`)

**Outcome:** A file had been created in a misnamed folder. I fixed the project structure.

## 5. Frontend

> "Everything should look like a retro calculator. The colors I'll provide are from my personal brand, and we'll use them to personalize the calculator."
> **Additional prompts for the form, validation, API client and tests not preserved; summary:* I asked Claude to guide me through building the form, a typed API client and component tests with Vitest and React Testing Library.

**Outcome:** Claude proposed ways to combine the palette, and I picked one. The colors were checked for contrast: pink, the lowest-contrast color, is used only for large text, borders and focus rings. The VT323 pixel font is bundled locally so the app works offline.

## 6. README verification

> "I don't understand what I have to do with `[TODO: paste real response body]`."

**Outcome:** Ran every example against the real server and pasted the actual output. Multi-line `curl` commands failed in Windows `cmd`, because `\` is bash syntax, so I added a Windows note to the README.

## 7. Frontend coverage

> "`npm install` is taking very long." (+ verbose log)

**Outcome:** The log showed `UNABLE_TO_VERIFY_LEAF_SIGNATURE`: something on my machine was intercepting HTTPS. Fixed with `NODE_OPTIONS=--use-system-ca`, so Node uses the Windows certificate store. I chose not to use `strict-ssl false`, which disables certificate checks entirely.

> (+ coverage report showing an uncovered function in `Calculator.tsx`)

**Outcome:** The sign toggle of the second field was never tested. I added a test. The one remaining uncovered branch is an unreachable defensive fallback, which I documented instead of testing.

## 8. Docker

> "Docker: Go should serve the compiled frontend, a multi-stage Dockerfile, and its README section."

**Outcome:** Of two options (`go:embed` or serving a directory set by `STATIC_DIR`), I chose the directory, so the backend still compiles and tests without a frontend build. Claude provided the Dockerfile; I built it, ran it, and checked that `docker stop` triggers graceful shutdown.

## Where the AI was wrong

- **Conflicting route patterns.** Claude first suggested registering the frontend at `"GET /"` next to `"/api/"`. In Go 1.22+ that combination is ambiguous for requests like `GET /api/add`, and the server panics at startup. It was corrected to `"/"` before it shipped.