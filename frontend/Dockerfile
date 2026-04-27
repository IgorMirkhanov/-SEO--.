FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
COPY frontend/package.json ./frontend/package.json
RUN npm install
COPY . .
RUN npm run build -w frontend

FROM nginx:1.27-alpine
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
