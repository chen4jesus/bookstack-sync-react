#!/bin/bash

# Exit on error
set -e

echo "🔧 Fixing CORS issues in BookStack Sync application..."

# Stop and remove existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Rebuild and start the containers
echo "🔨 Rebuilding and starting containers with new configuration..."
docker-compose up -d --build

# Check if deployment was successful
if [ $? -eq 0 ]; then
  echo "✅ Deployment successful! Your application is now running with CORS fixes."
  echo "📊 You can access your application at:"
  echo "   - Frontend: http://localhost:$(grep FRONTEND_PORT .env | cut -d '=' -f2 || echo '8123')"
  echo "   - Backend API: http://localhost:$(grep BACKEND_PORT .env | cut -d '=' -f2 || echo '8080')/api"
  echo ""
  echo "🔍 Testing CORS configuration..."
  
  # Test CORS configuration with curl
  FRONTEND_PORT=$(grep FRONTEND_PORT .env | cut -d '=' -f2 || echo '8123')
  BACKEND_PORT=$(grep BACKEND_PORT .env | cut -d '=' -f2 || echo '8080')
  
  echo "Testing preflight request to backend..."
  curl -s -o /dev/null -w "%{http_code}" -X OPTIONS \
    -H "Origin: http://localhost:$FRONTEND_PORT" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    http://localhost:$BACKEND_PORT/api/sync/verify
  
  echo ""
  echo "📝 To view logs: docker-compose logs -f"
  echo "🛑 To stop the application: docker-compose down"
else
  echo "❌ Deployment failed. Please check the logs for more information."
  exit 1
fi

echo ""
echo "🔍 If you're still experiencing CORS issues, please check the CORS-TROUBLESHOOTING.md file for more information." 