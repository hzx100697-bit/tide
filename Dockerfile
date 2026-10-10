FROM node:20-alpine AS build

WORKDIR /app

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install --frozen-lockfile

COPY frontend/ ./frontend/
RUN cd frontend && npm run build

FROM node:20-alpine AS runtime

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm install --production --frozen-lockfile

COPY backend/ ./backend/
COPY --from=build /app/frontend/dist/ ./backend/public/

WORKDIR /app/backend

EXPOSE 8080

CMD ["node", "server.js"]