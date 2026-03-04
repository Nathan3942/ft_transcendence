# docs/RUNBOOK.md
# Transcendence — Runbook (dev & tests)

## Objectif
Permettre à n’importe qui de lancer le projet “from scratch”.

## Prérequis
- Node.js (version à fixer, ex: 20+)
- npm/pnpm (à fixer)
- SQLite (via fichier `.db` dans le repo ou volume docker)

## Variables d’environnement (exemple)
Créer `.env` (ne pas commit) :
- `PORT=4000`
- `FRONTEND_ORIGIN=http://localhost:3000`
- `DATABASE_PATH=./data/app.db`

OAuth 42 (noms à adapter) :
- `OAUTH42_CLIENT_ID=...`
- `OAUTH42_CLIENT_SECRET=...`
- `OAUTH42_CALLBACK_URL=http://localhost:4000/api/v1/auth/42/callback`
- `OAUTH42_AUTHORIZATION_URL=...` (si nécessaire)
- `OAUTH42_TOKEN_URL=...`
- `OAUTH42_USERINFO_URL=...`

Cookies/session :
- `SESSION_SECRET=...` (si cookie signé)
- `SESSION_TTL_SECONDS=...`

## Lancer en dev (sans docker)
1) installer deps
2) lancer backend
3) vérifier `/api/v1/health`

Exemple :
- `GET http://localhost:4000/api/v1/health` → `{ data: { ok: true } }`

## Tests manuels indispensables
### 1) Health
- `GET /api/v1/health` → 200

### 2) OAuth
- `GET /api/v1/auth/42` → redirect vers 42
- login → callback → cookie présent
- `GET /api/v1/me` → 200 si connecté
- `POST /api/v1/auth/logout` → 204
- `GET /api/v1/me` → 401 après logout

### 3) Erreurs
- endpoint test qui throw `NotFoundError` → 404 + format erreur
- endpoint validation invalide → 400 + details

### 4) CORS + cookies
Depuis le frontend :
- fetch `/api/v1/me` avec `credentials: "include"`
- pas d’erreur CORS
- cookie reçu lors du callback OAuth

### 5) WebSocket
- se connecter à `/api/v1/ws`
- envoyer `ping` → recevoir `pong`

## Conventions Git (mini)
- Branches :
  - `main` stable
  - `feat/<topic>` pour features
  - `docs/<topic>` pour docs
- PR obligatoire pour merge sur main (même petite)
- Toute modif de contrat = PR + annonce à l’équipe
