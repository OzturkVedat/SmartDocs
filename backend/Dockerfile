FROM node:20-slim

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY backend/ ./backend

WORKDIR /app/backend
EXPOSE 5000
CMD ["node", "server.js"]
