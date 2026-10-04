# Stage 1: build the frontend
FROM node:24-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: build the backend
FROM golang:1.27-alpine AS backend
WORKDIR /app/backend
COPY backend/ ./
RUN CGO_ENABLED=0 go build -o /server ./cmd/server

# Stage 3: minimal runtime image
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=backend /server /server
COPY --from=frontend /app/frontend/dist /static
ENV STATIC_DIR=/static
EXPOSE 8080
ENTRYPOINT ["/server"]