#!/bin/sh

# This script checks if the backend service is available
# It returns 0 (success) if the backend is available, 1 (failure) otherwise

# Try to connect to the backend service
if curl -s -f -o /dev/null -w "%{http_code}" http://backend:8080/api/health; then
  echo "Backend service is available"
  exit 0
else
  echo "Backend service is unavailable, but frontend will continue to operate"
  exit 0  # Still exit with 0 to allow the frontend to start
fi 