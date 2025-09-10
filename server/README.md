Find Housing – Express + PostgreSQL API

Quick start
- Copy .env.example to .env and set DATABASE_URL, PORT.
- Start Postgres quickly with docker-compose: `docker-compose up -d`
- Install deps: `cd server && npm i`
- Initialize schema: `npm run seed` (creates tables and sample data)
- Run dev API: `npm run dev` (default http://localhost:4000)

Endpoints
- GET /health – simple healthcheck
- POST /admin/init – initialize schema (idempotent)
- GET /companies – list companies
- GET /areas – list areas
- GET /listings – list listings (shape matches client Listing type)
- POST /listings – create listing
- POST /users – create user (name, age, gender, employer, passcode)

Notes
- Authentication is intentionally omitted (MVP). Passcode stored as plain text.
- Schema includes preferences table for future matching features.

