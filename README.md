# TradeMate

AI-powered trade intelligence platform for tariffs, HS codes, and shipping routes.

## Prerequisites

- Docker + Docker Compose
- PostgreSQL running locally on port `5432` (database: `trademate_db`)
- Memgraph running locally on port `7687` (install from [memgraph.com](https://memgraph.com/download))

## First-time setup

1. Copy and fill in all `.env` files:
   ```
   server/.env
   client/.env
   admin-portal/.env
   data_pipeline/.env
   knowledge_graph/.env
   tipp_scrapping/.env
   ```

2. Build and start everything:
   ```bash
   sudo docker compose up --build
   ```

## Day-to-day

```bash
# Start all services
sudo docker compose up

# Stop all services
sudo docker compose down

# Rebuild a single service (e.g. after adding a pip/npm package)
sudo docker compose up --build server
sudo docker compose up --build client
```

## Services & ports

| Service | URL | Notes |
|---|---|---|
| Main API (FastAPI) | http://localhost:8000 | Core backend |
| Data Pipeline API | http://localhost:8001 | RAG ingestion |
| Knowledge Graph API | http://localhost:8002 | Memgraph interface |
| TIPP Scraper API | http://localhost:8003 | Rate scraping |
| Client (Next.js) | http://localhost:3001 | User-facing app |
| Admin Portal (Next.js) | http://localhost:3002 | Admin dashboard |
| Celery Flower | http://localhost:5555 | Task monitor |
| Redis | localhost:6379 | Internal only |

## External services (not in Docker)

**PostgreSQL** — runs on the host machine, accessed from containers via `host.docker.internal:5432`.

**Memgraph** — runs on the host machine on port `7687` (Bolt protocol). Start it before running `docker compose up`. The knowledge-graph service connects to it via `host.docker.internal:7687`.

## Hot reload behavior

| Layer | Code change | Dependency change (pip/npm) |
|---|---|---|
| Python backends | Auto-reloads (uvicorn `--reload`) | Rebuild required |
| Next.js frontends | Auto-reloads (HMR) | Rebuild required |
| `NEXT_PUBLIC_*` env vars | — | Rebuild required |
