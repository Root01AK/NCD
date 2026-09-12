#!/bin/sh
set -e

echo "=== Starting NCD Django Application ==="

# Run Django database migrations
echo "Applying database migrations..."
python manage.py migrate --noinput || true


# Collect static files for Django Unfold Admin
echo "Collecting static files..."
python manage.py collectstatic --noinput || true

# Execute the main CMD (Gunicorn)
echo "Launching Gunicorn application server..."
exec "$@"
