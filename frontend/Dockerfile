FROM node:18-alpine AS build
WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm config set loglevel error && \
    npm install --legacy-peer-deps --no-fund --no-audit

# Copiar código fuente y construir
COPY . ./
RUN npm run build

# Imagen final con Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]