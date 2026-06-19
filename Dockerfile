FROM node:20-alpine AS build
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npx tailwindcss -i styles.css -o styles.css --minify

FROM caddy:alpine
COPY --from=build /app /usr/share/caddy
COPY Caddyfile /etc/caddy/Caddyfile
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
