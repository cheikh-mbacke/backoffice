# Multi-stage build pour optimiser la taille de l'image
FROM node:20-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package et lock
COPY package.json package-lock.json ./

# Vérifier que les fichiers sont bien copiés
RUN ls -la

# Installer TOUTES les dépendances (dev + prod) pour le build
RUN npm ci || (echo "npm ci failed, trying npm install..." && npm install)

# Copier le code source
COPY . .

# Build l'application pour la production
RUN npm run build

# Stage de production avec Nginx
FROM nginx:alpine AS production

# Copier les fichiers buildés
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/nginx.conf

# Exposer le port 80
EXPOSE 80

# Commande par défaut
CMD ["nginx", "-g", "daemon off;"]
