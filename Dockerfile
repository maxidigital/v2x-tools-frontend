FROM node:20-alpine AS build
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npx tailwindcss -i styles.css -o styles.css --minify

FROM caddy:alpine
COPY --from=build /app /usr/share/caddy
CMD ["sh", "-c", "caddy file-server --root /usr/share/caddy --listen 0.0.0.0:${PORT:-8080}"]
