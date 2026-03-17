# OverWatch HTML Root - Workstream G Tooling

This workspace now includes lint/test tooling for:

- `backend` (TypeScript + Vitest + ESLint)
- `frontend` (static frontend + Playwright smoke tests + ESLint)
- `e2e` Playwright smoke checks
- Docker and docker-compose for local containerized runs

## Local Setup (PowerShell)

From `overwatch_html_root`:

```powershell
.\install_dependencies.ps1
```

## Backend Commands

```powershell
Set-Location .\backend
npm run lint
npm run test
```

## Frontend Commands

```powershell
Set-Location .\frontend
npm run lint
npm run test
npm run test:e2e
```

If your dev server is already running, refresh after changes. If tests fail on navigation, restart your dev server and rerun.

## E2E Base URL (optional)

`frontend/playwright.config.ts` defaults to `http://127.0.0.1:4173`.

Override in PowerShell when needed:

```powershell
$env:E2E_BASE_URL = "http://127.0.0.1:3000"
Set-Location .\frontend
npm run test:e2e
```

## Docker

```powershell
docker compose up --build
```

App: `http://localhost:3000`  
Postgres: `localhost:5432`
