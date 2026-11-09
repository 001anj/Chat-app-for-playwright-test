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
