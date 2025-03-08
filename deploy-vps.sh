#!/bin/bash

# Exit on error
set -e

echo "🚀 Deploying BookStack Sync application to VPS..."

# Check if Docker is installed
if ! [ -x "$(command -v docker)" ]; then
  echo "❌ Error: Docker is not installed. Please install Docker first."
  exit 1
fi

# Check if Docker Compose is installed
if ! [ -x "$(command -v docker-compose)" ]; then
  echo "❌ Error: Docker Compose is not installed. Please install Docker Compose first."
  exit 1
fi

# Check if .env file exists, create it if it doesn't
if [ ! -f .env ]; then
  echo "Creating default .env file..."
  cat > .env << EOL
# Frontend configuration
FRONTEND_PORT=8123

# Backend configuration
BACKEND_PORT=8080
SPRING_PROFILES=prod
EOL
  echo "✅ Created .env file with default values."
fi

# Get the server's public IP address
SERVER_IP=$(curl -s ifconfig.me)
echo "📡 Detected server IP: $SERVER_IP"

# Build and start the containers
echo "🔨 Building and starting containers..."
docker-compose down
docker-compose up -d --build

# Check if deployment was successful
if [ $? -eq 0 ]; then
  echo "✅ Deployment successful! Your application is now running."
  echo "📊 You can access your application at:"
  echo "   - Frontend: http://$SERVER_IP:$(grep FRONTEND_PORT .env | cut -d '=' -f2)"
  echo "   - Backend API: http://$SERVER_IP:$(grep BACKEND_PORT .env | cut -d '=' -f2)/api"
  echo "📝 To view logs: docker-compose logs -f"
  echo "🛑 To stop the application: docker-compose down"
else
  echo "❌ Deployment failed. Please check the logs for more information."
  exit 1
fi

# Check if ports are open in the firewall
echo "🔍 Checking if ports are open in the firewall..."
FRONTEND_PORT=$(grep FRONTEND_PORT .env | cut -d '=' -f2)
BACKEND_PORT=$(grep BACKEND_PORT .env | cut -d '=' -f2)

# Check if ufw is installed
if [ -x "$(command -v ufw)" ]; then
  # Check if ports are open
  if ! ufw status | grep -q "$FRONTEND_PORT"; then
    echo "⚠️ Warning: Port $FRONTEND_PORT is not open in the firewall."
    echo "   Run the following command to open it:"
    echo "   sudo ufw allow $FRONTEND_PORT/tcp"
  fi
  
  if ! ufw status | grep -q "$BACKEND_PORT"; then
    echo "⚠️ Warning: Port $BACKEND_PORT is not open in the firewall."
    echo "   Run the following command to open it:"
    echo "   sudo ufw allow $BACKEND_PORT/tcp"
  fi
else
  echo "ℹ️ UFW firewall not detected. Please ensure your firewall has ports $FRONTEND_PORT and $BACKEND_PORT open."
fi

echo "🎉 Deployment process completed!" 