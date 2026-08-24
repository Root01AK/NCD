# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Build React Frontend
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Install deps first (layer cache)
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copy source & build
COPY frontend/ ./
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: PHP + Nginx production image
# ─────────────────────────────────────────────────────────────────────────────
# Pin to Alpine 3.19 for reproducible package availability
FROM php:8.2-fpm-alpine3.19

# Environment variables for Composer & PHP
ENV COMPOSER_ALLOW_SUPERUSER=1
ENV COMPOSER_MEMORY_LIMIT=-1

# Install system packages and PHP extensions
# Note: 'icudata' does NOT exist in Alpine - use icu-data-full instead
RUN apk add --no-cache \
        nginx \
        supervisor \
        bash \
        curl \
        libpng-dev \
        libjpeg-turbo-dev \
        freetype-dev \
        libzip-dev \
        oniguruma-dev \
        icu-dev \
        icu-libs \
        icu-data-full \
        mariadb-client \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pdo_mysql gd zip mbstring intl bcmath \
    && rm -rf /tmp/pear

# Install Composer 2
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# ── Application source (includes pre-bundled vendor/ dependencies) ───────────
COPY . .

# ── Built React assets from Stage 1 ─────────────────────────────────────────
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# ── Optimize Composer Autoloader ─────────────────────────────────────────────
RUN composer dump-autoload --optimize --no-scripts || composer install --no-dev --optimize-autoloader --no-interaction --no-progress --ignore-platform-reqs --no-scripts --no-audit

# ── Nginx & Supervisor configuration ─────────────────────────────────────────
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# ── Runtime permissions ───────────────────────────────────────────────────────
RUN mkdir -p runtime web/assets \
    && chmod -R 777 runtime web/assets \
    && chown -R www-data:www-data /var/www/html

# ── Health check for Docker, Coolify, Traefik & Caddy ───────────────────────
HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Expose HTTP
EXPOSE 80

# Start supervisord (manages both php-fpm + nginx)
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
