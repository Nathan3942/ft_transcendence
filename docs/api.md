# ft_transcendence — API Documentation

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Health Check](#health-check)
  - [Auth](#auth)
  - [Users](#users)
  - [Friends](#friends)
  - [Stats & Leaderboard](#stats--leaderboard)
  - [Matches](#matches)
  - [Tournaments](#tournaments)
- [Data Models](#data-models)
- [Database Schema](#database-schema)

---

## Overview

| | |
|---|---|
| **Base URL** | `/api/v1` |
| **Format** | JSON |
| **Success response** | `{ "data": ... }` |
| **Error response** | `{ "error": "...", "message": "...", "code": ... }` |
| **Authentication** | JWT stored in httpOnly cookie `token` |

---

## Authentication

JWT token is issued on login/register and stored in a **httpOnly cookie** (`token`).
It is automatically sent with each request. Duration: **7 days**.

Token payload:
```json
{ "id": number, "username": string }
```

After authentication, `request.user` is available in all protected routes.

Protected routes return `401` if the cookie is missing or invalid.

---

## Error Handling

### Error Format

```json
{
  "error": "NotFoundError",
  "message": "User not found",
  "code": 404
}
```

### Error Types

| Class | HTTP Status | Description |
|---|---|---|
| `BadRequestError` | 400 | Invalid input data |
| `UnauthorizedError` | 401 | Missing or invalid token |
| `ForbiddenError` | 403 | Action not allowed for this user |
| `NotFoundError` | 404 | Resource not found |
| `ConflictError` | 409 | Resource already exists |

---

## Endpoints

---

### Health Check

#### `GET /ping`

Server health check.

**Auth required**: No

**Response**
```json
{ "data": "pong" }
```

---

### Auth

#### `POST /auth/register`

Register a new user account.

**Auth required**: No

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `username` | string | Yes | Unique username |
| `email` | string | Yes | Unique email address |
| `password` | string | Yes | Min 8 characters |

**Response** `201`
```json
{
  "data": {
    "user": {
      "id": 1,
      "username": "alice",
      "email": "alice@example.com",
      "display_name": null,
      "avatar_url": "/uploads/avatars/default.svg",
      "is_online": 1,
      "created_at": "2026-03-08T12:00:00.000Z"
    }
  }
}
```

**Side effects**: Sets JWT cookie, sets `is_online = 1`

**Errors**
- `400` — Missing fields or password < 8 chars
- `409` — Username or email already taken

---

#### `POST /auth/login`

Login with email and password.

**Auth required**: No

**Request body**

| Field | Type | Required |
|---|---|---|
| `email` | string | Yes |
| `password` | string | Yes |

**Response** `200` — Same structure as `/auth/register`

**Side effects**: Sets JWT cookie, sets `is_online = 1`

**Errors**
- `400` — Missing fields
- `401` — Invalid credentials

---

#### `GET /auth/me`

Get the currently authenticated user's profile.

**Auth required**: Yes

**Response** `200`
```json
{ "data": { /* PublicUser */ } }
```

**Errors**
- `401` — Not authenticated
- `404` — User not found

---

#### `POST /auth/logout`

Logout the current user.

**Auth required**: Yes

**Response** `200`
```json
{ "data": { "message": "Logged out" } }
```

**Side effects**: Sets `is_online = 0`, clears JWT cookie

**Errors**
- `401` — Not authenticated

---

### Users

#### `GET /users`

Get all users.

**Auth required**: No

**Response** `200`
```json
{ "data": [ /* PublicUser[] */ ] }
```

**Errors**
- `404` — No users in database

---

#### `GET /users/:id`

Get a single user by ID.

**Auth required**: No

**Path params**

| Param | Type | Description |
|---|---|---|
| `id` | number | User ID |

**Response** `200`
```json
{ "data": { /* PublicUser */ } }
```

**Errors**
- `404` — User not found

---

#### `PATCH /users/:id`

Update a user's profile. Only the authenticated user can update their own profile.

**Auth required**: Yes

**Path params**

| Param | Type | Description |
|---|---|---|
| `id` | number | User ID |

**Request body** (all fields optional)

| Field | Type | Description |
|---|---|---|
| `username` | string | New unique username |
| `email` | string | New unique email |
| `display_name` | string | New display name (unique) |
| `avatar_url` | string | Avatar URL |

**Response** `200`
```json
{ "data": { /* PublicUser */ } }
```

**Errors**
- `400` — Invalid fields
- `403` — Not the authenticated user
- `404` — User not found

---

#### `POST /users/:id/avatar`

Upload an avatar image. Only the authenticated user can upload their own avatar.

**Auth required**: Yes

**Path params**

| Param | Type | Description |
|---|---|---|
| `id` | number | User ID |

**Request body**: `multipart/form-data`

| Field | Type | Constraints |
|---|---|---|
| `file` | File | image/jpeg, image/png, image/gif, image/webp — max 5MB |

**Response** `200`
```json
{ "data": { /* PublicUser */ } }
```

**Errors**
- `400` — No file uploaded or invalid file type/size
- `403` — Not the authenticated user
- `404` — User not found

---

#### `DELETE /users/:id`

Delete a user account. Only the authenticated user can delete their own account.

**Auth required**: Yes

**Path params**

| Param | Type | Description |
|---|---|---|
| `id` | number | User ID |

**Response** `200`
```json
{ "data": { "message": "User deleted", "id": 1 } }
```

**Errors**
- `403` — Not the authenticated user
- `404` — User not found

---

### Friends

#### `POST /users/:id/friends`

Send a friend request.

**Auth required**: Yes

**Path params**

| Param | Type | Description |
|---|---|---|
| `id` | number | Requester's user ID (must match authenticated user) |

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `friendId` | number | Yes | ID of the user to befriend |

**Response** `201`
```json
{
  "data": {
    "id": 5,
    "requester_id": 1,
    "addressee_id": 2,
    "status": "pending",
    "created_at": "2026-03-08T12:00:00.000Z"
  }
}
```

**Errors**
- `400` — Missing `friendId` or cannot add yourself
- `403` — Not the authenticated user
- `404` — Target user not found
- `409` — Request already pending or already friends

---

#### `PATCH /users/:id/friends/:friendId`

Accept or reject a pending friend request. Only the addressee can respond.

**Auth required**: Yes

**Path params**

| Param | Type | Description |
|---|---|---|
| `id` | number | Addressee's user ID (must match authenticated user) |
| `friendId` | number | Requester's user ID |

**Request body**

| Field | Type | Required | Values |
|---|---|---|---|
| `action` | string | Yes | `"accept"` or `"reject"` |

**Response** `200`
```json
{ "data": { "message": "Friend request accepted" } }
```

**Errors**
- `400` — Invalid action
- `403` — Not the addressee of this request
- `404` — No pending request found

---

#### `GET /users/:id/friends/requests`

Get all pending incoming friend requests for a user.

**Auth required**: Yes

**Path params**

| Param | Type | Description |
|---|---|---|
| `id` | number | User ID (must match authenticated user) |

**Response** `200`
```json
{
  "data": [
    {
      "friendship_id": 5,
      "requester_id": 2,
      "username": "bob",
      "display_name": "Bob",
      "avatar_url": "/uploads/avatars/default.svg",
      "created_at": "2026-03-08T12:00:00.000Z"
    }
  ]
}
```

**Errors**
- `403` — Not the authenticated user
- `404` — User not found

---

#### `GET /users/:id/friends`

Get accepted friends list with online status.

**Auth required**: No

**Path params**

| Param | Type | Description |
|---|---|---|
| `id` | number | User ID |

**Response** `200`
```json
{
  "data": [
    {
      "friendship_id": 5,
      "id": 2,
      "username": "bob",
      "display_name": "Bob",
      "avatar_url": "/uploads/avatars/default.svg",
      "is_online": 1
    }
  ]
}
```

**Errors**
- `404` — User not found

---

#### `DELETE /users/:id/friends/:friendId`

Remove a friend.

**Auth required**: Yes

**Path params**

| Param | Type | Description |
|---|---|---|
| `id` | number | User ID (must match authenticated user) |
| `friendId` | number | Friend's user ID |

**Response** `200`
```json
{ "data": { "message": "Friend removed" } }
```

**Errors**
- `403` — Not the authenticated user
- `404` — Friendship not found

---

### Stats & Leaderboard

#### `GET /users/:id/stats`

Get user statistics.

**Auth required**: No

**Path params**

| Param | Type | Description |
|---|---|---|
| `id` | number | User ID |

**Response** `200`
```json
{
  "data": {
    "userId": 1,
    "username": "alice",
    "totalMatches": 10,
    "wins": 7,
    "losses": 3,
    "winrate": 0.7,
    "tournamentsWon": 2
  }
}
```

**Errors**
- `400` — Invalid user ID
- `404` — User not found

---

#### `GET /users/:id/matches`

Get user match history.

**Auth required**: Yes

**Path params**

| Param | Type | Description |
|---|---|---|
| `id` | number | User ID |

**Response** `200`
```json
{
  "data": [
    {
      "matchId": 12,
      "opponentId": 2,
      "opponentName": "bob",
      "userScore": 5,
      "opponentScore": 3,
      "won": true,
      "finishedAt": "2026-03-08T14:00:00.000Z"
    }
  ]
}
```

**Errors**
- `400` — Invalid user ID
- `401` — Not authenticated
- `404` — User not found

---

#### `GET /leaderboard`

Get the leaderboard sorted by wins.

**Auth required**: No

**Query params**

| Param | Type | Required | Default | Description |
|---|---|---|---|---|
| `limit` | number | No | `20` | Max entries (max `100`) |

**Response** `200`
```json
{
  "data": [
    {
      "userId": 1,
      "username": "alice",
      "wins": 20,
      "losses": 3,
      "totalMatches": 23,
      "winrate": 0.87
    }
  ]
}
```

**Errors**
- `400` — Invalid limit value

---

### Matches

#### `GET /matches`

Get all matches.

**Auth required**: No

**Response** `200`
```json
{
  "data": [ /* Match[] */ ]
}
```

---

#### `GET /matches/:id`

Get a match by ID with players and scores.

**Auth required**: No

**Path params**

| Param | Type | Description |
|---|---|---|
| `id` | number | Match ID |

**Response** `200`
```json
{
  "data": {
    "id": 1,
    "tournamentId": null,
    "round": null,
    "status": "finished",
    "winnerId": 1,
    "startedAt": "2026-03-08T13:00:00.000Z",
    "finishedAt": "2026-03-08T13:10:00.000Z",
    "createdAt": "2026-03-08T12:59:00.000Z",
    "players": [
      { "userId": 1, "score": 5 },
      { "userId": 2, "score": 3 }
    ]
  }
}
```

**Errors**
- `404` — Match not found

---

#### `POST /matches`

Create a new match.

**Auth required**: No

**Request body** (all optional)

| Field | Type | Default | Description |
|---|---|---|---|
| `tournamentId` | number \| null | `null` | Tournament ID |
| `round` | number \| null | `null` | Round number |
| `status` | string | `"pending"` | `"pending"`, `"in_progress"`, or `"finished"` |

**Response** `201`
```json
{ "data": { /* Match */ } }
```

**Errors**
- `400` — Invalid data
- `404` — Tournament not found

---

#### `DELETE /matches/:id`

Delete a match.

**Auth required**: No

**Path params**

| Param | Type | Description |
|---|---|---|
| `id` | number | Match ID |

**Response** `200`
```json
{ "data": { "message": "Match deleted", "id": 1 } }
```

**Errors**
- `404` — Match not found

---

#### `GET /matches/status/:status`

Get matches filtered by status.

**Auth required**: No

**Path params**

| Param | Type | Values |
|---|---|---|
| `status` | string | `"pending"`, `"in_progress"`, `"finished"` |

**Response** `200`
```json
{ "data": [ /* Match[] */ ] }
```

**Errors**
- `400` — Invalid status value

---

#### `GET /tournaments/:tournamentId/matches`

Get all matches in a tournament.

**Auth required**: No

**Path params**

| Param | Type | Description |
|---|---|---|
| `tournamentId` | number | Tournament ID |

**Response** `200`
```json
{ "data": [ /* Match[] */ ] }
```

**Errors**
- `404` — Tournament not found

---

#### `POST /matches/:id/players`

Add a player to a match.

**Auth required**: No

**Path params**

| Param | Type | Description |
|---|---|---|
| `id` | number | Match ID |

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `userId` | number | Yes | User ID |
| `score` | number \| null | No | Initial score |

**Response** `201`
```json
{
  "data": {
    "id": 3,
    "matchId": 1,
    "userId": 2,
    "score": null
  }
}
```

**Errors**
- `400` — Invalid data or player already in match
- `404` — Match or user not found

---

#### `PATCH /matches/:id/score`

Update a player's score in a match.

**Auth required**: No

**Path params**

| Param | Type | Description |
|---|---|---|
| `id` | number | Match ID |

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `userId` | number | Yes | User ID |
| `score` | number | Yes | New score (>= 0) |

**Response** `200`
```json
{ "data": { "matchId": 1, "userId": 2, "score": 4 } }
```

**Errors**
- `400` — Invalid data (negative score)
- `404` — Match, user, or player assignment not found

---

#### `PATCH /matches/:id/status`

Update a match status.

**Auth required**: No

**Path params**

| Param | Type | Description |
|---|---|---|
| `id` | number | Match ID |

**Request body**

| Field | Type | Required | Values |
|---|---|---|---|
| `status` | string | Yes | `"pending"`, `"in_progress"`, `"finished"` |

**Status transitions**

```
pending → in_progress
pending → finished
in_progress → finished
```
Finished matches cannot be modified.

**Response** `200`
```json
{ "data": { "message": "Match status updated", "matchId": 1, "status": "in_progress" } }
```

**Errors**
- `400` — Invalid status or invalid transition
- `404` — Match not found

---

#### `POST /matches/:id/start`

Start a match (sets status to `in_progress`, records start time).

**Auth required**: No

**Path params**

| Param | Type | Description |
|---|---|---|
| `id` | number | Match ID |

**Response** `200`
```json
{ "data": { "message": "Match started", "matchId": 1, "status": "in_progress" } }
```

**Errors**
- `400` — Match is not in `pending` status
- `404` — Match not found

---

#### `POST /matches/:id/finish`

Finish a match (sets status to `finished`, records end time and winner).

**Auth required**: No

**Path params**

| Param | Type | Description |
|---|---|---|
| `id` | number | Match ID |

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `winnerId` | number \| null | No | Winner's user ID (must be a player in the match) |

**Response** `200`
```json
{ "data": { "message": "Match finished", "matchId": 1, "status": "finished", "winnerId": 1 } }
```

**Errors**
- `400` — Match not `in_progress`, invalid winner, or winner not a player in this match
- `404` — Match or winner not found

---

#### `POST /matches/result`

Save a completed match result in one request (creates match + assigns players with scores).

**Auth required**: No

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `player1Id` | number | Yes | Player 1 user ID |
| `player2Id` | number \| null | No | Player 2 user ID (`null` for AI matches) |
| `scorePlayer1` | number | Yes | Player 1 score (>= 0) |
| `scorePlayer2` | number | Yes | Player 2 score (>= 0) |
| `winnerId` | number \| null | No | Winner's user ID |

**Response** `201`
```json
{
  "data": {
    "id": 7,
    "tournamentId": null,
    "round": null,
    "status": "finished",
    "winnerId": 1,
    "startedAt": null,
    "finishedAt": "2026-03-08T14:00:00.000Z",
    "createdAt": "2026-03-08T14:00:00.000Z",
    "players": [
      { "userId": 1, "score": 5 },
      { "userId": 2, "score": 3 }
    ]
  }
}
```

**Errors**
- `400` — Negative scores, invalid player IDs, or winner not a player
- `404` — Player not found

---

### Tournaments

#### `GET /tournaments`

Get all tournaments.

**Auth required**: No

**Response** `200`
```json
{ "data": [ /* Tournament[] */ ] }
```

---

#### `GET /tournaments/:id`

Get a tournament by ID with its player list.

**Auth required**: No

**Path params**

| Param | Type | Description |
|---|---|---|
| `id` | number | Tournament ID |

**Response** `200`
```json
{
  "data": {
    "id": 1,
    "name": "Spring Cup",
    "status": "finished",
    "winnerId": 1,
    "createdAt": "2026-03-08T10:00:00.000Z",
    "players": [1, 2, 3, 4]
  }
}
```

**Errors**
- `404` — Tournament not found

---

#### `POST /tournaments`

Create a new tournament.

**Auth required**: No

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Unique tournament name |

**Response** `201`
```json
{
  "data": {
    "id": 1,
    "name": "Spring Cup",
    "status": "open",
    "winnerId": null,
    "createdAt": "2026-03-08T10:00:00.000Z"
  }
}
```

**Errors**
- `400` — Missing name or name already exists

---

#### `DELETE /tournaments/:id`

Delete a tournament.

**Auth required**: No

**Path params**

| Param | Type | Description |
|---|---|---|
| `id` | number | Tournament ID |

**Response** `200`
```json
{ "data": { "message": "Tournament deleted", "id": 1 } }
```

**Errors**
- `404` — Tournament not found

---

#### `POST /tournaments/:id/players`

Add a player to a tournament.

**Auth required**: No

**Path params**

| Param | Type | Description |
|---|---|---|
| `id` | number | Tournament ID |

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `userId` | number | Yes | User ID |

**Response** `201`
```json
{
  "data": {
    "id": 3,
    "tournamentId": 1,
    "userId": 2,
    "joinedAt": "2026-03-08T10:05:00.000Z"
  }
}
```

**Errors**
- `400` — Player already registered or invalid `userId`
- `404` — Tournament or user not found

---

#### `GET /tournaments/:id/players`

Get all players registered in a tournament.

**Auth required**: No

**Path params**

| Param | Type | Description |
|---|---|---|
| `id` | number | Tournament ID |

**Response** `200`
```json
{ "data": [ /* TournamentPlayer[] */ ] }
```

**Errors**
- `404` — Tournament not found

---

#### `POST /tournaments/result`

Save a complete tournament result in one request. Creates the tournament, all players (including AI bots), and all matches.

**Auth required**: No

**Request body**

```json
{
  "name": "Spring Cup",
  "players": [
    { "name": "alice", "isAi": false },
    { "name": "bob", "isAi": false },
    { "name": "Bot-X", "isAi": true }
  ],
  "matches": [
    {
      "player1Name": "alice",
      "player2Name": "bob",
      "scorePlayer1": 5,
      "scorePlayer2": 3,
      "winnerName": "alice",
      "round": 1
    }
  ],
  "championName": "alice"
}
```

| Field | Type | Required | Constraints |
|---|---|---|---|
| `name` | string | Yes | Unique tournament name |
| `players` | array | Yes | Min 2 players |
| `players[].name` | string | Yes | Username |
| `players[].isAi` | boolean | Yes | `true` for bot players |
| `matches` | array | Yes | Min 1 match |
| `matches[].player1Name` | string | Yes | Must be in `players` list |
| `matches[].player2Name` | string | Yes | Must be in `players` list |
| `matches[].scorePlayer1` | number | Yes | >= 0 |
| `matches[].scorePlayer2` | number | Yes | >= 0 |
| `matches[].winnerName` | string | Yes | Must be `player1Name` or `player2Name` |
| `matches[].round` | number | Yes | Round number |
| `championName` | string | Yes | Must be in `players` list |

**Response** `201`
```json
{
  "data": {
    "tournament": {
      "id": 1,
      "name": "Spring Cup",
      "status": "finished",
      "winnerId": 1,
      "createdAt": "2026-03-08T10:00:00.000Z"
    },
    "champion": "alice",
    "matchesCount": 3
  }
}
```

**Side effects**: Creates users for all player names if they don't exist (including bots).

**Errors**
- `400` — Missing required fields, < 2 players, < 1 match, champion not in players list
- `409` — Tournament name already exists

---

## Data Models

### PublicUser

```typescript
{
  id: number
  username: string
  email: string
  display_name: string | null
  avatar_url: string | null        // defaults to '/uploads/avatars/default.svg'
  is_online: number                // 0 = offline, 1 = online
  created_at: string               // ISO 8601 datetime
}
```

### Match

```typescript
{
  id: number
  tournamentId: number | null
  round: number | null
  status: 'pending' | 'in_progress' | 'finished'
  winnerId: number | null
  startedAt: string | null         // ISO 8601 datetime
  finishedAt: string | null        // ISO 8601 datetime
  createdAt: string                // ISO 8601 datetime
}
```

### MatchWithPlayers

Extends `Match` with:
```typescript
{
  players: Array<{
    userId: number
    score: number | null
  }>
}
```

### Tournament

```typescript
{
  id: number
  name: string
  status: 'open' | 'in_progress' | 'finished'
  winnerId: number | null
  createdAt: string                // ISO 8601 datetime
}
```

### TournamentWithPlayers

Extends `Tournament` with:
```typescript
{
  players: number[]                // array of user IDs
}
```

### UserStats

```typescript
{
  userId: number
  username: string
  totalMatches: number
  wins: number
  losses: number
  winrate: number                  // 0.0 to 1.0
  tournamentsWon: number
}
```

### MatchHistory (per match, from user perspective)

```typescript
{
  matchId: number
  opponentId: number | null
  opponentName: string | null
  userScore: number | null
  opponentScore: number | null
  won: boolean
  finishedAt: string | null
}
```

### LeaderboardEntry

```typescript
{
  userId: number
  username: string
  wins: number
  losses: number
  totalMatches: number
  winrate: number                  // 0.0 to 1.0
}
```

### Friendship

```typescript
{
  id: number
  requester_id: number
  addressee_id: number
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
}
```

---

## Database Schema

```sql
CREATE TABLE users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  username     TEXT NOT NULL UNIQUE,
  email        TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT UNIQUE,
  avatar_url   TEXT,
  is_online    INTEGER NOT NULL DEFAULT 0,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE friends (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'blocked')),
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (requester_id, addressee_id)
);

CREATE TABLE tournaments (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL UNIQUE,
  status     TEXT DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'finished')),
  winner_id  INTEGER REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tournament_players (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER NOT NULL REFERENCES tournaments(id),
  user_id       INTEGER NOT NULL REFERENCES users(id),
  joined_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (tournament_id, user_id)
);

CREATE TABLE matches (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER REFERENCES tournaments(id),
  round         INTEGER,
  status        TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'finished')),
  winner_id     INTEGER REFERENCES users(id),
  started_at    DATETIME,
  finished_at   DATETIME,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE match_player (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL REFERENCES matches(id),
  user_id  INTEGER NOT NULL REFERENCES users(id),
  score    INTEGER,
  UNIQUE (match_id, user_id)
);
```

---

## Route Summary

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/ping` | No | Health check |
| POST | `/auth/register` | No | Register user |
| POST | `/auth/login` | No | Login |
| GET | `/auth/me` | **Yes** | Current user profile |
| POST | `/auth/logout` | **Yes** | Logout |
| GET | `/users` | No | List all users |
| GET | `/users/:id` | No | Get user |
| PATCH | `/users/:id` | **Yes** | Update user profile |
| POST | `/users/:id/avatar` | **Yes** | Upload avatar |
| DELETE | `/users/:id` | **Yes** | Delete user |
| POST | `/users/:id/friends` | **Yes** | Send friend request |
| PATCH | `/users/:id/friends/:friendId` | **Yes** | Accept/reject request |
| GET | `/users/:id/friends/requests` | **Yes** | Pending requests |
| GET | `/users/:id/friends` | No | Friends list |
| DELETE | `/users/:id/friends/:friendId` | **Yes** | Remove friend |
| GET | `/users/:id/stats` | No | User stats |
| GET | `/users/:id/matches` | **Yes** | Match history |
| GET | `/leaderboard` | No | Leaderboard |
| GET | `/matches` | No | All matches |
| GET | `/matches/:id` | No | Match by ID |
| POST | `/matches` | No | Create match |
| DELETE | `/matches/:id` | No | Delete match |
| GET | `/matches/status/:status` | No | Matches by status |
| POST | `/matches/:id/players` | No | Add player to match |
| PATCH | `/matches/:id/score` | No | Update score |
| PATCH | `/matches/:id/status` | No | Update status |
| POST | `/matches/:id/start` | No | Start match |
| POST | `/matches/:id/finish` | No | Finish match |
| POST | `/matches/result` | No | Save match result |
| GET | `/tournaments` | No | All tournaments |
| GET | `/tournaments/:id` | No | Tournament by ID |
| POST | `/tournaments` | No | Create tournament |
| DELETE | `/tournaments/:id` | No | Delete tournament |
| POST | `/tournaments/:id/players` | No | Add player |
| GET | `/tournaments/:id/players` | No | Tournament players |
| GET | `/tournaments/:tournamentId/matches` | No | Tournament matches |
| POST | `/tournaments/result` | No | Save tournament result |
