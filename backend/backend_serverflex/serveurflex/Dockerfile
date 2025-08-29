# frontend multi-stage build
FROM node:20.12.2-alpine AS build

WORKDIR /app

COPY package*.json ./
#RUN npm ci
RUN npm install
COPY . .
#RUN npm run build

#FROM nginx:alpine
# copier le build depuis l'étape "build"
#COPY --from=build /app/build /usr/share/nginx/html
#EXPOSE 80
EXPOSE 5000
CMD ["npm", "run", "dev"]

