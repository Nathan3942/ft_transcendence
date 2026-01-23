# docs/CONTRACT_API.md
# Transcendence — Contrat API HTTP (REST)

## Objectif
Définir une API stable pour éviter les incohérences front/back.

## Base
- Base path : `/api/v1`
- Style : REST
- JSON en sortie par défaut
- Toutes les réponses suivent le format défini ci-dessous (succès + erreur)

## Conventions JSON
- Nommage des champs : `camelCase`
- Dates : ISO 8601 (`2026-01-22T10:15:30.000Z`)
- IDs : nombres (SQLite) ou strings (si UUID) — à fixer. Par défaut : `number`

## Format réponse succès (standard)
```json
{ "data": {}, "meta": {} }
