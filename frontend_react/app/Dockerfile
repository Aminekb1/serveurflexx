# Étape de build
FROM node:20.12.2-alpine AS build

WORKDIR /app

# Copier les fichiers package.json + package-lock.json
COPY package*.json ./

# Installer les dépendances
#RUN npm ci --legacy-peer-deps
RUN npm install 

# Copier le reste du code
COPY . .

# Lancer le build (React)
RUN npm run build

# Étape finale : servir avec Nginx
FROM nginx:alpine

# Copier le build produit
COPY --from=build /app/dist /usr/share/nginx/html

#COPY nginx.conf /etc/nginx/conf.d/default.conf 
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]




