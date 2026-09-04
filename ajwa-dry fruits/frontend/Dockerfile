# ==============================================================================
# Ajwa AI Commerce - Frontend React Multi-Stage Dockerfile
# Stage 1: Compile React SPA; Stage 2: Serve via Nginx Alpine
# ==============================================================================

FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps --silent

COPY . .

ENV CI=false
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
