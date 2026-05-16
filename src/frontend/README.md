# eks-demo-frontend

React (Vite) dashboard for the EKS demo project.
Displays live health and status probes against the backend API.

## Features

- **Check /health** — fires the backend liveness endpoint
- **Check /api/status** — fires the backend status endpoint
- Shows JSON response, HTTP status, and round-trip latency
- CORS-compliant — origin is whitelisted on the backend via `ALLOWED_ORIGINS`

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080` | Backend base URL — injected from Kubernetes ConfigMap in production |

> Vite bakes `VITE_*` env vars into the bundle at build time.
> In a Kubernetes deployment, pass the correct value via a ConfigMap → env var → build arg pipeline,
> **or** serve the frontend with a config endpoint / runtime injection approach.

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy and edit env
cp .env.example .env
# Edit VITE_API_BASE_URL if your backend runs on a different port

# 3. Start the dev server
npm run dev
```

App runs on `http://localhost:3000`.

## Production Build

```bash
npm run build    # output in ./dist/
npm run preview  # preview the production build locally
```
