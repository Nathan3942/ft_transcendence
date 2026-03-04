# docs/CONTRACT_DB.md
# Transcendence — Contrat DB (SQLite)

## Objectif
Définir le modèle minimal, contraintes, invariants.

## Conventions
- Tables en `snake_case` ou `camelCase` : à fixer. Recommandé SQLite : `snake_case`
- Champs timestamps : `created_at`, `updated_at` (ISO string ou integer unix). Recommandé : integer unix ms ou ISO — à fixer.

## Tables minimales

### users
- id (PK)
- provider (ex: "42")
- provider_id (id côté provider)
- username
- avatar_url
- created_at

Contraintes :
- UNIQUE(provider, provider_id)
- username unique (optionnel, si vous allow rename)

### sessions (si sessions server-side)
- id (sessionId random)
- user_id (FK users.id)
- expires_at
- created_at

Contraintes :
- INDEX(user_id)
- expires cleanup (manual/cron au besoin)

### tournaments (si module tournois)
- id
- name
- start_at
- created_at

Contraintes :
- name unique (optionnel)

## Invariants métier
- Un user est unique par (provider, provider_id)
- Une session appartient à 1 user
- Les endpoints protégés nécessitent une session valide
- (si tournois) un tournoi a un nom non vide + date valide

## Migrations / Init
- À définir : outil migrations (ex: SQL raw + script, ou lib)
- Règle : init idempotent (peut être relancé sans casser)
- Le repo doit contenir :
  - `migrations/` (SQL)
  - ou un script `db/init.ts` qui crée les tables si absentes

## Seed (optionnel)
- seed minimal pour dev (1 user fake, 1 tournoi)
- ne jamais seed en prod par défaut
