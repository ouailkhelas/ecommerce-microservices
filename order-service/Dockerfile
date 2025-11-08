# image de base officielle Node
FROM node:18

# définir le dossier de travail dans le container
WORKDIR /app

# copier package.json & package-lock.json
COPY package*.json ./

# installer les dépendances
RUN npm install

# copier le reste du code
COPY . .

# exposer le port 3001
EXPOSE 3001

# commande pour démarrer le service
CMD ["node", "index.js"]
