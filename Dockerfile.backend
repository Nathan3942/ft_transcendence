FROM node:22-alpine AS builder

WORKDIR /app

# better-sqlite3 requires native compilation
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY srcs/server.ts srcs/app.ts* ./srcs/
COPY srcs/config ./srcs/config
COPY srcs/database ./srcs/database
COPY srcs/models ./srcs/models
COPY srcs/plugins ./srcs/plugins
COPY srcs/repository ./srcs/repository
COPY srcs/routes ./srcs/routes
COPY srcs/services ./srcs/services
COPY srcs/utils ./srcs/utils
COPY srcs/ws ./srcs/ws
COPY srcs/game ./srcs/game
COPY srcs/tournament ./srcs/tournament
COPY srcs/frontend/src/game/pong_core.ts ./srcs/frontend/src/game/pong_core.ts

RUN npm run build

# --- Production image ---
FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

RUN mkdir -p data uploads

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
