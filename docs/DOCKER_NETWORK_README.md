# Connecting Frontend and Backend Docker Containers for VPS Deployment

This guide provides instructions for connecting your React frontend and Spring Boot backend Docker containers to work together without CORS errors on any VPS with an IP address.

## Overview

The solution involves four main components:

1. **Frontend API Configuration**: Use relative URLs instead of hardcoded localhost URLs
2. **Nginx Configuration**: Configure Nginx in the frontend container to proxy API requests to the backend
3. **Docker Compose Network**: Create a shared network between the containers
4. **Environment Variables**: Use environment variables for flexible deployment

## Implementation Steps

### 1. Update the Frontend API Configuration

The API URLs in `src/services/springBootApi.ts` have been updated to use relative paths:

```typescript
// Use relative URLs instead of hardcoded localhost URLs
// This will make API requests go to the same host that serves the frontend
const SPRING_BOOT_API_URL = '/api/sync';

// Debug API URL
const DEBUG_API_URL = '/api/debug';
```

This change makes the frontend application work on any server without hardcoded URLs.

### 2. Update the Nginx Configuration

The `nginx.conf` file has been updated to proxy API requests to the backend service:

```nginx
# Proxy API requests to the backend service
location /api/ {
    # Proxy to the backend service
    proxy_pass http://bookstack-sync:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Port $server_port;
    proxy_cache_bypass $http_upgrade;
    
    # Handle timeouts
    proxy_connect_timeout 10s;
    proxy_send_timeout 10s;
    proxy_read_timeout 10s;
    
    # Add CORS headers for browsers that request directly to the backend
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    
    # Handle preflight requests
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Max-Age' 1728000 always;
        add_header 'Content-Type' 'text/plain; charset=utf-8' always;
        add_header 'Content-Length' 0 always;
        return 204;
    }
}
```

### 3. Update the Docker Compose Configuration

The `docker-compose.yml` file has been updated to use environment variables for flexible deployment:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: react-app
    ports:
      - "${FRONTEND_PORT:-8123}:80"
    restart: always
    networks:
      - app-network
    depends_on:
      - backend
    environment:
      - NODE_ENV=production

  backend:
    image: bookstack-sync-spring_bookstack-sync
    container_name: bookstack-sync
    ports:
      - "${BACKEND_PORT:-8080}:8080"
    restart: always
    networks:
      - app-network
    environment:
      - SPRING_PROFILES_ACTIVE=${SPRING_PROFILES:-prod}

networks:
  app-network:
    driver: bridge
```

### 4. Environment Variables

A `.env` file has been created to store environment variables:

```
# Frontend configuration
FRONTEND_PORT=8123

# Backend configuration
BACKEND_PORT=8080
SPRING_PROFILES=prod
```

You can customize these variables for different deployment environments.

## Deployment on a VPS

1. **Prepare your VPS**:
   - Install Docker and Docker Compose
   - Open the necessary ports in your firewall (8123 for frontend, 8080 for backend)

2. **Upload your application files to the VPS**:
   ```bash
   scp -r ./* user@your-vps-ip:/path/to/application
   ```

3. **SSH into your VPS**:
   ```bash
   ssh user@your-vps-ip
   ```

4. **Navigate to your application directory**:
   ```bash
   cd /path/to/application
   ```

5. **Customize the .env file if needed**:
   ```bash
   nano .env
   ```

6. **Deploy the application**:
   ```bash
   docker-compose up -d --build
   ```

7. **Verify the deployment**:
   ```bash
   docker-compose ps
   ```

8. **Access your application**:
   - Frontend: http://your-vps-ip:8123
   - Backend API: http://your-vps-ip:8080/api

## Using a Domain Name

If you have a domain name, you can configure it to point to your VPS:

1. **Update your DNS records** to point to your VPS IP address

2. **Configure Nginx** to use your domain name:
   ```nginx
   server_name yourdomain.com www.yourdomain.com;
   ```

3. **Set up SSL** with Let's Encrypt for secure HTTPS connections

## Troubleshooting

- **Container not starting**: Check logs with `docker-compose logs`
- **Network issues**: Verify that both containers are on the same network with `docker network inspect app-network`
- **CORS errors still occurring**: Check that the CORS configuration is properly applied in the Spring Boot application
- **Cannot access the application**: Verify that your VPS firewall allows traffic on the configured ports

## Security Considerations

- In a production environment, you should:
  - Replace `*` with specific origins in the CORS configuration
  - Use HTTPS for secure communication
  - Implement proper authentication and authorization
  - Set up proper firewall rules on your VPS
  - Use environment variables for sensitive information
  - Regularly update your Docker images 