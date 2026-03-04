# API Documentation — ft_transcendence

**Base URL** : `http://localhost:3000/api/v1`
**Format** : JSON
**Auth** : JWT Bearer token (header `Authorization: Bearer <token>`)

---

## Format des réponses

### Succès
```json
{ "data": <payload> }
```

### Erreur
```json
{
  "error": "ErrorName",
  "message": "Description lisible",
  "details": []
}
```

### Codes d'erreur

| Code | Nom | Cas |
|------|-----|-----|
| 400 | `BadRequestError` | Champ manquant ou invalide |
| 401 | `UnauthorizedError` | Token absent ou invalide |
| 403 | `ForbiddenError` | Action non autorisée (pas propriétaire) |
| 404 | `NotFoundError` | Ressource introuvable |
| 409 | `ConflictError` | Doublon (username, email, relation existante) |

---

## Authentification

### `POST /auth/register`
Créer un compte utilisateur.

**Auth requise** : Non

**Body**
```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "motdepasse123"
}
```

**Réponse** `201`
```json
{
  "data": {
    "id": 1,
    "username": "alice",
    "email": "alice@example.com",
    "display_name": null,
    "avatar_url": null,
    "is_online": 0,
    "created_at": "2026-03-04T10:00:00.000Z"
  }
}
```

**Erreurs**
- `400` — champ manquant ou password trop court (< 8 caractères)
- `409` — username ou email déjà utilisé

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"motdepasse123"}'
```

---

### `POST /auth/login`
Se connecter et obtenir un JWT (valable 7 jours).

**Auth requise** : Non

**Body**
```json
{
  "email": "alice@example.com",
  "password": "motdepasse123"
}
```

**Réponse** `200`
```json
{
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "id": 1,
      "username": "alice",
      "email": "alice@example.com",
      "display_name": null,
      "avatar_url": "/uploads/avatars/default.svg",
      "is_online": 1,
      "created_at": "2026-03-04 10:00:00"
    }
  }
}
```

**Erreurs**
- `401` — identifiants invalides (message volontairement vague)

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"motdepasse123"}'
```

---

### `GET /auth/me`
Retourner le profil de l'utilisateur connecté.

**Auth requise** : Oui

**Réponse** `200`
```json
{
  "data": {
    "id": 1,
    "username": "alice",
    "email": "alice@example.com",
    "display_name": "Alice",
    "avatar_url": "/uploads/avatars/avatar-1-1234567890.png",
    "is_online": 1,
    "created_at": "2026-03-04 10:00:00"
  }
}
```

```bash
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer <token>"
```

---

### `POST /auth/logout`
Se déconnecter. Met `is_online` à 0.

**Auth requise** : Oui

**Réponse** `200`
```json
{ "data": { "message": "Logged out" } }
```

```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer <token>"
```

---

## Utilisateurs

### `GET /users`
Liste tous les utilisateurs.

**Auth requise** : Non

**Réponse** `200`
```json
{
  "data": [
    {
      "id": 1,
      "username": "alice",
      "email": "alice@example.com",
      "display_name": "Alice",
      "avatar_url": "/uploads/avatars/default.svg",
      "is_online": 1,
      "created_at": "2026-03-04 10:00:00"
    }
  ]
}
```

**Erreurs**
- `404` — aucun utilisateur en base

```bash
curl http://localhost:3000/api/v1/users
```

---

### `GET /users/:id`
Retourner un utilisateur par son ID.

**Auth requise** : Non

**Params** : `id` (integer)

**Réponse** `200` — même structure que ci-dessus (objet unique)

**Erreurs**
- `404` — utilisateur introuvable

```bash
curl http://localhost:3000/api/v1/users/1
```

---

### `PATCH /users/:id`
Mettre à jour son propre profil.

**Auth requise** : Oui — l'utilisateur ne peut modifier que son propre profil

**Params** : `id` (integer)

**Body** (tous les champs sont optionnels)
```json
{
  "username": "nouveau_username",
  "email": "nouveau@example.com",
  "display_name": "Mon Alias",
  "avatar_url": "https://example.com/photo.jpg"
}
```

**Réponse** `200` — profil mis à jour

**Erreurs**
- `400` — body vide
- `401` — non authentifié
- `403` — tentative de modifier le profil d'un autre utilisateur
- `404` — utilisateur introuvable
- `409` — username ou email déjà pris

```bash
curl -X PATCH http://localhost:3000/api/v1/users/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"display_name":"Mon Alias","email":"nouveau@example.com"}'
```

---

### `POST /users/:id/avatar`
Uploader une image comme avatar. Remplace l'avatar existant.

**Auth requise** : Oui — uniquement son propre avatar

**Params** : `id` (integer)

**Body** : `multipart/form-data`, champ `file`
**Types acceptés** : `image/jpeg`, `image/png`, `image/gif`, `image/webp`
**Taille max** : 5 MB

**Réponse** `200` — profil avec `avatar_url` mis à jour
```json
{
  "data": {
    "id": 1,
    "avatar_url": "/uploads/avatars/avatar-1-1709550000000.png",
    ...
  }
}
```

**Erreurs**
- `400` — aucun fichier envoyé ou type de fichier non autorisé
- `403` — tentative de modifier l'avatar d'un autre utilisateur

```bash
curl -X POST http://localhost:3000/api/v1/users/1/avatar \
  -H "Authorization: Bearer <token>" \
  -F "file=@/chemin/vers/photo.png;type=image/png"
```

> L'avatar uploadé est accessible via `GET /uploads/avatars/<filename>`.
> Si aucun avatar n'est uploadé, `avatar_url` retourne `/uploads/avatars/default.svg`.

---

### `DELETE /users/:id`
Supprimer son propre compte.

**Auth requise** : Oui

**Params** : `id` (integer)

**Réponse** `200`
```json
{ "data": { "message": "User deleted", "id": 1 } }
```

**Erreurs**
- `403` — tentative de supprimer le compte d'un autre
- `404` — utilisateur introuvable

```bash
curl -X DELETE http://localhost:3000/api/v1/users/1 \
  -H "Authorization: Bearer <token>"
```

---

## Amis

### `POST /users/:id/friends`
Envoyer une demande d'ami. `:id` doit correspondre au token (je suis l'expéditeur).

**Auth requise** : Oui

**Params** : `id` — ID de l'expéditeur (= soi-même)

**Body**
```json
{ "friendId": 2 }
```

**Réponse** `200`
```json
{
  "data": {
    "id": 1,
    "requester_id": 1,
    "addressee_id": 2,
    "status": "pending",
    "created_at": "2026-03-04 10:00:00"
  }
}
```

**Erreurs**
- `400` — `friendId` manquant ou tentative de s'ajouter soi-même
- `403` — `:id` ne correspond pas au token
- `404` — utilisateur cible introuvable
- `409` — demande déjà en attente ou déjà amis

```bash
curl -X POST http://localhost:3000/api/v1/users/1/friends \
  -H "Authorization: Bearer <token_alice>" \
  -H "Content-Type: application/json" \
  -d '{"friendId": 2}'
```

---

### `PATCH /users/:id/friends/:friendId`
Accepter ou refuser une demande reçue. `:id` = destinataire (soi), `:friendId` = expéditeur.

**Auth requise** : Oui

**Params**
- `id` — ID du destinataire (= soi-même, doit correspondre au token)
- `friendId` — ID de celui qui a envoyé la demande

**Body**
```json
{ "action": "accept" }
```
ou
```json
{ "action": "reject" }
```

**Réponse** `200`
```json
{ "data": { "message": "Friend request accepted" } }
```
ou
```json
{ "data": { "message": "Friend request rejected" } }
```

**Erreurs**
- `400` — `action` invalide (doit être `"accept"` ou `"reject"`)
- `403` — `:id` ne correspond pas au token, ou tentative d'accepter une demande envoyée à quelqu'un d'autre
- `404` — aucune demande en attente entre ces deux utilisateurs

```bash
# Bob (id=2) accepte la demande d'Alice (id=1)
curl -X PATCH http://localhost:3000/api/v1/users/2/friends/1 \
  -H "Authorization: Bearer <token_bob>" \
  -H "Content-Type: application/json" \
  -d '{"action": "accept"}'
```

---

### `GET /users/:id/friends`
Liste des amis acceptés d'un utilisateur, avec leur statut en ligne.

**Auth requise** : Non

**Params** : `id` (integer)

**Réponse** `200`
```json
{
  "data": [
    {
      "friendship_id": 1,
      "id": 2,
      "username": "bob",
      "display_name": "Bob",
      "avatar_url": "/uploads/avatars/default.svg",
      "is_online": 1
    }
  ]
}
```

**Erreurs**
- `404` — utilisateur introuvable

```bash
curl http://localhost:3000/api/v1/users/1/friends
```

---

### `GET /users/:id/friends/requests`
Liste des demandes d'amis en attente reçues par l'utilisateur.

**Auth requise** : Oui — uniquement ses propres demandes

**Params** : `id` (integer)

**Réponse** `200`
```json
{
  "data": [
    {
      "friendship_id": 3,
      "requester_id": 5,
      "username": "charlie",
      "display_name": null,
      "avatar_url": "/uploads/avatars/default.svg",
      "created_at": "2026-03-04 10:00:00"
    }
  ]
}
```

```bash
curl http://localhost:3000/api/v1/users/1/friends/requests \
  -H "Authorization: Bearer <token>"
```

---

### `DELETE /users/:id/friends/:friendId`
Supprimer un ami ou annuler une demande.

**Auth requise** : Oui

**Params**
- `id` — son propre ID (doit correspondre au token)
- `friendId` — ID de l'ami à supprimer

**Réponse** `200`
```json
{ "data": { "message": "Friend removed" } }
```

**Erreurs**
- `403` — `:id` ne correspond pas au token
- `404` — relation introuvable

```bash
curl -X DELETE http://localhost:3000/api/v1/users/1/friends/2 \
  -H "Authorization: Bearer <token>"
```

---

## Statistiques

### `GET /users/:id/stats`
Statistiques d'un utilisateur.

**Auth requise** : Non

**Réponse** `200`
```json
{
  "data": {
    "userId": 1,
    "username": "alice",
    "totalMatches": 10,
    "wins": 7,
    "losses": 3,
    "winrate": 70,
    "tournamentsWon": 2
  }
}
```

```bash
curl http://localhost:3000/api/v1/users/1/stats
```

---

### `GET /users/:id/matches`
Historique des matchs d'un utilisateur.

**Auth requise** : Oui

**Réponse** `200`
```json
{
  "data": [
    {
      "matchId": 5,
      "opponentId": 2,
      "opponentName": "bob",
      "userScore": 11,
      "opponentScore": 7,
      "won": true,
      "finishedAt": "2026-03-04 10:30:00"
    }
  ]
}
```

**Erreurs**
- `401` — non authentifié

```bash
curl http://localhost:3000/api/v1/users/1/matches \
  -H "Authorization: Bearer <token>"
```

---

### `GET /leaderboard`
Classement global des joueurs par nombre de victoires.

**Auth requise** : Non

**Query params**
- `limit` (optionnel, défaut : `20`) — nombre de résultats

**Réponse** `200`
```json
{
  "data": [
    {
      "userId": 1,
      "username": "alice",
      "wins": 7,
      "losses": 3,
      "totalMatches": 10,
      "winrate": 70
    }
  ]
}
```

```bash
curl http://localhost:3000/api/v1/leaderboard
curl http://localhost:3000/api/v1/leaderboard?limit=5
```

---

## Matchs

### `GET /matches`
Liste tous les matchs.

**Auth requise** : Non

```bash
curl http://localhost:3000/api/v1/matches
```

---

### `GET /matches/:id`
Retourner un match avec ses joueurs.

**Auth requise** : Non

**Réponse** `200`
```json
{
  "data": {
    "id": 1,
    "tournamentId": null,
    "round": null,
    "status": "finished",
    "winnerId": 1,
    "startedAt": "2026-03-04 10:00:00",
    "finishedAt": "2026-03-04 10:30:00",
    "createdAt": "2026-03-04 09:55:00",
    "players": [
      { "userId": 1, "score": 11 },
      { "userId": 2, "score": 7 }
    ]
  }
}
```

```bash
curl http://localhost:3000/api/v1/matches/1
```

---

### `POST /matches`
Créer un match.

**Auth requise** : Non

**Body**
```json
{
  "tournamentId": null,
  "round": null,
  "status": "pending"
}
```

```bash
curl -X POST http://localhost:3000/api/v1/matches \
  -H "Content-Type: application/json" \
  -d '{"tournamentId":null,"round":null}'
```

---

### `POST /matches/result`
Enregistrer le résultat complet d'un match en une seule requête.

**Auth requise** : Non

**Body**
```json
{
  "player1Id": 1,
  "player2Id": 2,
  "scorePlayer1": 11,
  "scorePlayer2": 7,
  "winnerId": 1
}
```

**Réponse** `200` — match créé avec joueurs et statut `finished`

```bash
curl -X POST http://localhost:3000/api/v1/matches/result \
  -H "Content-Type: application/json" \
  -d '{"player1Id":1,"player2Id":2,"scorePlayer1":11,"scorePlayer2":7,"winnerId":1}'
```

---

### `POST /matches/:id/start`
Démarrer un match (statut → `in_progress`, `startedAt` = maintenant).

```bash
curl -X POST http://localhost:3000/api/v1/matches/1/start
```

---

### `POST /matches/:id/finish`
Terminer un match avec un gagnant (statut → `finished`, `finishedAt` = maintenant).

**Body**
```json
{ "winnerId": 1 }
```

```bash
curl -X POST http://localhost:3000/api/v1/matches/1/finish \
  -H "Content-Type: application/json" \
  -d '{"winnerId":1}'
```

---

### `POST /matches/:id/players`
Ajouter un joueur à un match.

**Body**
```json
{ "userId": 1, "score": null }
```

```bash
curl -X POST http://localhost:3000/api/v1/matches/1/players \
  -H "Content-Type: application/json" \
  -d '{"userId":1}'
```

---

### `PATCH /matches/:id/score`
Mettre à jour le score d'un joueur dans un match.

**Body**
```json
{ "userId": 1, "score": 11 }
```

```bash
curl -X PATCH http://localhost:3000/api/v1/matches/1/score \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"score":11}'
```

---

### `PATCH /matches/:id/status`
Changer le statut d'un match.

**Body**
```json
{ "status": "in_progress" }
```
Valeurs : `"pending"` | `"in_progress"` | `"finished"`

---

### `GET /matches/status/:status`
Filtrer les matchs par statut.

```bash
curl http://localhost:3000/api/v1/matches/status/finished
```

---

### `DELETE /matches/:id`
Supprimer un match.

```bash
curl -X DELETE http://localhost:3000/api/v1/matches/1
```

---

## Tournois

### `GET /tournaments`
Liste tous les tournois.

```bash
curl http://localhost:3000/api/v1/tournaments
```

---

### `GET /tournaments/:id`
Retourner un tournoi par son ID.

```bash
curl http://localhost:3000/api/v1/tournaments/1
```

---

### `POST /tournaments`
Créer un tournoi.

**Body**
```json
{ "name": "Tournoi du vendredi" }
```

```bash
curl -X POST http://localhost:3000/api/v1/tournaments \
  -H "Content-Type: application/json" \
  -d '{"name":"Tournoi du vendredi"}'
```

---

### `POST /tournaments/result`
Enregistrer le résultat complet d'un tournoi (joueurs + matchs + champion).

**Body**
```json
{
  "name": "Tournoi du vendredi",
  "players": [
    { "name": "alice", "isAi": false },
    { "name": "bob", "isAi": false }
  ],
  "matches": [
    {
      "player1Name": "alice",
      "player2Name": "bob",
      "scorePlayer1": 11,
      "scorePlayer2": 5,
      "winnerName": "alice",
      "round": 1
    }
  ],
  "championName": "alice"
}
```

```bash
curl -X POST http://localhost:3000/api/v1/tournaments/result \
  -H "Content-Type: application/json" \
  -d '{"name":"Tournoi","players":[{"name":"alice","isAi":false}],"matches":[],"championName":"alice"}'
```

---

### `POST /tournaments/:id/players`
Ajouter un joueur (par userId) à un tournoi existant.

**Body**
```json
{ "userId": 1 }
```

```bash
curl -X POST http://localhost:3000/api/v1/tournaments/1/players \
  -H "Content-Type: application/json" \
  -d '{"userId":1}'
```

---

### `GET /tournaments/:id/players`
Liste des joueurs inscrits à un tournoi.

```bash
curl http://localhost:3000/api/v1/tournaments/1/players
```

---

### `GET /tournaments/:tournamentId/matches`
Liste des matchs d'un tournoi.

```bash
curl http://localhost:3000/api/v1/tournaments/1/matches
```

---

### `DELETE /tournaments/:id`
Supprimer un tournoi.

```bash
curl -X DELETE http://localhost:3000/api/v1/tournaments/1
```

---

## Divers

### `GET /ping`
Vérifier que le serveur est actif.

**Réponse** `200`
```json
{ "data": "pong" }
```

```bash
curl http://localhost:3000/api/v1/ping
```

---

## Fichiers statiques

Les avatars uploadés sont servis directement :

```
GET /uploads/avatars/<filename>
GET /uploads/avatars/default.svg   ← avatar par défaut
```

---

## Récapitulatif des routes

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/auth/register` | — | Inscription |
| POST | `/auth/login` | — | Connexion → JWT |
| GET | `/auth/me` | ✓ | Profil connecté |
| POST | `/auth/logout` | ✓ | Déconnexion |
| GET | `/users` | — | Tous les users |
| GET | `/users/:id` | — | Un user |
| PATCH | `/users/:id` | ✓ own | Modifier profil |
| POST | `/users/:id/avatar` | ✓ own | Upload avatar |
| DELETE | `/users/:id` | ✓ own | Supprimer compte |
| POST | `/users/:id/friends` | ✓ own | Envoyer demande |
| PATCH | `/users/:id/friends/:friendId` | ✓ own | Accepter/refuser |
| GET | `/users/:id/friends` | — | Liste amis + online |
| GET | `/users/:id/friends/requests` | ✓ own | Demandes reçues |
| DELETE | `/users/:id/friends/:friendId` | ✓ own | Supprimer ami |
| GET | `/users/:id/stats` | — | Stats du joueur |
| GET | `/users/:id/matches` | ✓ | Historique matchs |
| GET | `/leaderboard` | — | Classement global |
| GET | `/matches` | — | Tous les matchs |
| GET | `/matches/:id` | — | Un match |
| POST | `/matches` | — | Créer match |
| POST | `/matches/result` | — | Résultat complet |
| POST | `/matches/:id/start` | — | Démarrer match |
| POST | `/matches/:id/finish` | — | Terminer match |
| POST | `/matches/:id/players` | — | Ajouter joueur |
| PATCH | `/matches/:id/score` | — | Màj score |
| PATCH | `/matches/:id/status` | — | Màj statut |
| GET | `/matches/status/:status` | — | Filtrer par statut |
| DELETE | `/matches/:id` | — | Supprimer match |
| GET | `/tournaments` | — | Tous les tournois |
| GET | `/tournaments/:id` | — | Un tournoi |
| POST | `/tournaments` | — | Créer tournoi |
| POST | `/tournaments/result` | — | Résultat complet |
| POST | `/tournaments/:id/players` | — | Ajouter joueur |
| GET | `/tournaments/:id/players` | — | Liste joueurs |
| GET | `/tournaments/:tournamentId/matches` | — | Matchs du tournoi |
| DELETE | `/tournaments/:id` | — | Supprimer tournoi |
| GET | `/ping` | — | Health check |

`✓ own` = authentifié ET propriétaire de la ressource
