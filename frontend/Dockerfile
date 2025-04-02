# frontend/Dockerfile

FROM node:20-alpine

WORKDIR /app

# Copie les fichiers de dépendances en premier
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du reste du code (src/, vite.config.ts, etc.)
COPY . .

# Port utilisé par Vite en dev
EXPOSE 5173

# Démarrage en mode dev avec accès réseau externe
CMD ["npm", "run", "dev", "--", "--host"]
