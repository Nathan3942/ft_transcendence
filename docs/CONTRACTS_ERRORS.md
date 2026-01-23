
# docs/CONTRACT_ERRORS.md
# Transcendence — Contrat Erreurs

## Objectif
Avoir un format d’erreur unique et stable pour le frontend, Postman, logs.

## Format JSON d’erreur (OBLIGATOIRE)
```json
{
  "error": "ValidationError",
  "message": "Input invalide",
  "code": 400,
  "details": []
}

