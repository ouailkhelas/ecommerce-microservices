FROM node:18-alpine

WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances de build pour bcrypt
RUN apk add --no-cache python3 make g++

# Installer les dépendances
RUN npm install --production

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 3007

# Démarrer l'application
CMD ["node", "index.js"]