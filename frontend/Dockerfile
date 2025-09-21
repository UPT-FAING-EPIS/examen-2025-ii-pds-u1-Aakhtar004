FROM node:18-alpine AS build
WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm cache clean --force && \
    npm config set loglevel error && \
    npm config set legacy-peer-deps true && \
    npm install --no-fund --no-audit && \
    npm install ajv@^8.0.0 ajv-keywords@^5.0.0 && \
    npm dedupe && \
    npm cache clean --force

# Copiar código fuente y construir
COPY . ./
RUN CI=false NODE_OPTIONS=--max_old_space_size=4096 npm run build

# Imagen final con Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]