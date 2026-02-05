# ft_transcendence

This project uses Docker to provide a reproducible and isolated environment for both development and production, in compliance with the project requirements.

Two Docker modes are available:

- DEV: hot reload using Vite

- PROD: static build served by Nginx


Requirements
  - Docker
  - Docker Compose

Open ports:
  - 5173 (development)
  - 80 (production)


# Development Mode (DEV)

Purpose
  - Hot reload (Vite)
  - No static build (dist)
  - Docker-based development environment

Start
  docker compose -f docker-compose.dev.yml up

Access

Local machine:
  http://localhost:5173

Local network (LAN):
  http://<LAN_IP>:5173

Stop
  docker compose -f docker-compose.dev.yml down

Full cleanup (including volumes)
  docker compose -f docker-compose.dev.yml down -v



# Production Mode (PROD)

Purpose
  - Build the frontend (npm run build)
  - Serve static files with Nginx
  - Ready for backend, API, and WebSockets integration

Start
  docker compose up --build

Access

Default:
  http://localhost

Stop
  docker compose down
