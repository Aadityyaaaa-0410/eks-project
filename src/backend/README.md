# eks-demo-backend

Express.js API backend for the EKS demo project.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Kubernetes **liveness** probe — always 200 while process is alive |
| GET | `/ready` | Kubernetes **readiness** probe — 200 when app is ready to serve |
| GET | `/api/status` | App metadata: name, version, env, uptime, timestamp |

## Environment Variables

### ConfigMap-mapped (non-sensitive)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | Port to listen on |
| `APP_NAME` | `eks-demo-backend` | Service name |
| `APP_ENV` | `development` | Environment label |
| `LOG_LEVEL` | `info` | `error` / `warn` / `info` / `debug` |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated list of CORS-allowed origins |

### Secret-mapped (sensitive)

| Variable | Description |
|---|---|
| `API_KEY` | API key (never logged) |
| `DB_PASSWORD` | Database password (never logged) |

> The app will **not crash** if these are absent — it logs that they are missing and continues.

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy and edit env
cp .env.example .env

# 3. Start with hot-reload
npm run dev
```

Server starts on `http://localhost:8080`.

## Production Start

```bash
npm start
```

## Graceful Shutdown

Send `SIGTERM` (or `SIGINT` locally). The server:
1. Stops accepting new connections
2. Sets readiness to `false` (readiness probe will start failing)
3. Closes existing connections cleanly
4. Exits with code `0`
5. Force-exits after 10 s if still open
