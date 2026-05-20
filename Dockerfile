FROM caddy:alpine
COPY . /usr/share/caddy
CMD ["sh", "-c", "caddy file-server --root /usr/share/caddy --listen 0.0.0.0:${PORT:-8080}"]
