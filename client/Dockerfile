# ============================================================
# Phase 9.2 — Frontend Dockerfile (Nginx Alpine Static Server)
# Copies all static files and custom nginx.conf into image
# ============================================================
FROM nginx:1.27-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/garden-empire.conf

# Copy all static web assets
COPY . /usr/share/nginx/html/

# Remove non-web files from the image
RUN rm -f /usr/share/nginx/html/Dockerfile \
           /usr/share/nginx/html/.dockerignore \
           /usr/share/nginx/html/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
