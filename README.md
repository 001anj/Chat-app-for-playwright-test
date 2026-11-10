# Chat app for testing

A small full-stack app for giving and viewing feedback between users. Vue 3 + Pinia on the frontend, Express + routing-controllers + Prisma on the backend.

## Prerequisites

- NodeJS >= 18.17.1
- Docker

## Local Setup

```
cp .env.example .env
npm install
```

Database:
```
docker-compose up
```

First time setup:
```
npm run db:migrate
npm run db:seed // seeds demo users and feedback
```

Service + Client:
```
npm run dev
```

## Testing

Both test suites expect the app to already be running (`npm run dev`, or just the API for API tests) and the database migrated — they don't start servers for you. The database is reseeded automatically before each run.

### API tests

Start the backend, then run the API tests against it:
```
npm run dev:service
```
```
npm run api-test
```

Interactive UI mode:
```
npm run api-test-ui
```

### UI (e2e) tests

Start the full stack (frontend + backend), then run the e2e tests against it:
```
npm run dev
```
```
npm run e2e-test
```

Interactive UI mode:
```
npm run e2e-ui
```

### CI

`.github/workflows/api-test.yml` and `.github/workflows/ui-test.yml` run these same suites on push/PR to `main`/`master`, each spinning up its own Postgres service container and publishing JUnit results to the GitHub Checks tab.

## Project Structure

- `src/` — Vue 3 frontend (views, components, Pinia stores, router)
- `src/api/` — Express backend (routing-controllers modules for auth and feedback)
- `prisma/` — database schema, migrations, and seed script

## Scripts

- `npm run dev` — run frontend and backend together
- `npm run dev:client` — frontend only (Vite)
- `npm run dev:service` — backend only (nodemon)
- `npm run lint` / `npm run lint:fix` — lint the codebase
- `npm run db:migrate` — run Prisma migrations
- `npm run db:seed` — seed demo data
- `npm run api-test` / `npm run api-test-ui` — run API tests (requires the backend running)
- `npm run e2e-test` / `npm run e2e-ui` — run e2e UI tests (requires the full app running)
