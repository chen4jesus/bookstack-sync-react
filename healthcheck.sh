#!/bin/sh

# This script checks if the backend service is available
# It always returns 0 (success) to ensure the frontend container stays running

echo "Checking backend service status..."

# Try to connect to the backend service, but don't fail if it doesn't exist
if curl -s -f -o /dev/null -w "%{http_code}" http://backend:8080/api/health 2>/dev/null; then
  echo "Backend service is available"
else
  echo "Backend service is not available - frontend will operate in standalone mode"
fi

# Always exit with success to ensure the frontend container stays running
exit 0 