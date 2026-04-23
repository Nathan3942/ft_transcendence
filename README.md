# ft_transcendence

A full-stack web application for playing **Pong** — live, multiplayer, with tournaments and user management. Built as the final project of the 42 Common Core.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Fastify + Node.js (TypeScript) |
| Frontend | TypeScript + Tailwind CSS + Vite (SPA) |
| Database | SQLite (better-sqlite3) |
| Auth | JWT + bcrypt |
| Real-time | WebSockets (@fastify/websocket) |
| Infra | Docker + docker-compose |

---

## Modules implemented

**Major modules**
- Backend framework (Fastify + Node.js)
- Standard user management — registration, login, avatars, friends, stats, match history
- Remote players — two players on separate machines via WebSocket
- Multiple players — more than 2 players in the same game
- AI opponent — computer-controlled player with identical paddle speed constraints

**Minor modules** (2 minor = 1 major)
- Frontend toolkit (Tailwind CSS)
- Database (SQLite)
- User and game stats dashboards
- Support on all devices (responsive design)
- Expanding browser compatibility (cross-browser support)
- Multiple languages (i18n)

**Core mandatory features**
- Live 1v1 Pong game (same keyboard or remote)
- Tournament system with matchmaking and bracket display
- Alias registration per tournament
- HTTPS / WSS everywhere
- Input validation, SQL injection and XSS protection
- Passwords hashed with bcrypt

---

## Getting started

### Prerequisites

- Docker and docker-compose

### 1. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

```env
JWT_SECRET=<a_strong_random_secret>
```

All credentials must stay in `.env` — never commit them.

### 2. Run

```bash
docker compose up --build
```

The app is served over HTTPS at `https://localhost`.

---

## Project structure

```
srcs/
├── app.ts              # Fastify app setup
├── server.ts           # Entry point
├── config/             # Environment config
├── database/           # SQLite schema & migrations
├── models/             # Data types / schemas (Zod)
├── repository/         # DB access layer
├── routes/             # HTTP route handlers
├── services/           # Business logic
│   ├── authService.ts
│   ├── friendsService.ts
│   ├── matchService.ts
│   ├── statsService.ts
│   ├── tournamentService.ts
│   └── userService.ts
├── plugins/            # Fastify plugins (JWT, CORS, etc.)
├── ws/                 # WebSocket handlers (game)
├── game/               # Pong game logic
├── tournament/         # Tournament & matchmaking logic
├── utils/
└── frontend/           # Vite SPA (TypeScript + Tailwind)
```

> [!NOTE]
> The frontend has its own [README](srcs/frontend/README.md) with full documentation on its architecture, components, routing, and i18n setup.

---

## Environment variables

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | `development` / `production` | `development` |
| `PORT` | Backend HTTP port | `3000` |
| `DATABASE_PATH` | Path to SQLite file | `./data/transcendence.db` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |
| `JWT_SECRET` | Secret for signing JWTs | **required** |
