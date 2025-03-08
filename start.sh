#!/bin/sh

# This script checks if the backend service is available
# but starts the frontend regardless of the backend's status

echo "Starting frontend application..."

# Try to check if backend is available, but don't fail if it's not
/usr/local/bin/healthcheck.sh || true

# Start Nginx in the foreground
echo "Starting Nginx server..."
nginx -g "daemon off;" 