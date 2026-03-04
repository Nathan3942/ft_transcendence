
# docs/CONTRACT_AUTH.md
# Transcendence — Contrat Auth (OAuth 42 + sessions cookies)

## Objectif
Auth simple, sûre et stable : OAuth 42 côté backend, session via cookie httpOnly.

## Stratégie
- OAuth 42 : le backend gère l’échange `code → token → user`
- Session côté backend (table `sessions`) OU session signée (si choisi)
- Cookie :
  - `httpOnly: true`
  - `sameSite`: `lax` en dev (recommandé), ajustable si besoin
  - `secure`: `false` en dev http, `true` en prod https
  - `path: /`

## Endpoints
### 1) Démarrer le login
- `GET /api/v1/auth/42`
- Réponse : redirection vers 42

### 2) Callback OAuth 42
- `GET /api/v1/auth/42/callback?code=...&state=...`
- Actions backend :
  1) échange du `code`
  2) récup profil utilisateur 42
  3) `find-or-create user` en DB
  4) crée session + cookie
  5) redirect vers le frontend (ex: `/`)

### 3) Me (source of truth)
- `GET /api/v1/me`
- 200 : `{ data: userPublic, meta: {} }`
- 401 : erreur standard (voir CONTRACT_ERRORS)

### 4) Logout
- `POST /api/v1/auth/logout`
- Action : supprimer session + clear cookie
- 204 recommandé

## Données user renvoyées au front (userPublic)
Le backend ne renvoie jamais :
- access token OAuth
- refresh token OAuth
- session id brute (si sensible)

Exemple `userPublic` :
```json
{
  "id": 1,
  "username": "sam",
  "avatarUrl": "https://...",
  "createdAt": "..."
}
```