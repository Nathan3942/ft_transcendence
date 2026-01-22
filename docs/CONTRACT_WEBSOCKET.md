
---

```md
# docs/CONTRACT_WS.md
# Transcendence — Contrat WebSocket

## Objectif
Un protocole WS minimal, stable et typable.

## URL
- `ws://<host>/api/v1/ws` (dev)
- `wss://<host>/api/v1/ws` (prod)

## Auth WS
- Le WS utilise le cookie de session (même auth que HTTP).
- Si non authentifié :
  - soit fermeture immédiate
  - soit message `auth.required` puis close (à décider)
Recommandé : close avec code + message.

## Format message (OBLIGATOIRE)
Toujours JSON :
```json
{ "type": "event.name", "data": {} }
