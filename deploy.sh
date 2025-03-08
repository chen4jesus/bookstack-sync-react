#!/bin/bash

# Exit on error
set -e

echo "🚀 Deploying React application..."

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

# Build and start the containers
echo "🔨 Building and starting containers..."
docker-compose up -d --build

# Check if deployment was successful
if [ $? -eq 0 ]; then
  echo "✅ Deployment successful! Your application is now running."
  echo "📊 You can access your application at: http://localhost:8123"
  echo "📝 To view logs: docker-compose logs -f"
  echo "🛑 To stop the application: docker-compose down"
else
  echo "❌ Deployment failed. Please check the logs for more information."
  exit 1
fi 