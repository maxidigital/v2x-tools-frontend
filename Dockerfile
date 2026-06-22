# Build the Vite/React app. `public/` (kept static pages: dev-console, stats,
# contact, doc/, images, robots, sitemap, manifest) is copied into dist/ by Vite.
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

FROM caddy:alpine
COPY --from=build /app/dist /usr/share/caddy
COPY Caddyfile /etc/caddy/Caddyfile
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
