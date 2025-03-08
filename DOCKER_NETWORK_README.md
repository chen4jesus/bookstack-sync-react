# Connecting Frontend and Backend Docker Containers

This guide provides instructions for connecting your React frontend and Spring Boot backend Docker containers to work together without CORS errors.

## Overview

The solution involves three main components:

1. **Nginx Configuration**: Configure Nginx in the frontend container to proxy API requests to the backend
2. **Docker Compose Network**: Create a shared network between the containers
3. **CORS Configuration**: Enable CORS in the Spring Boot backend

## Implementation Steps

### 1. Update the Nginx Configuration

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
    proxy_cache_bypass $http_upgrade;
    
    # Handle timeouts
    proxy_connect_timeout 10s;
    proxy_send_timeout 10s;
    proxy_read_timeout 10s;
}
```

### 2. Update the Docker Compose Configuration

The `docker-compose.yml` file has been updated to create a network between the containers:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: react-app
    ports:
      - "8123:80"
    restart: always
    networks:
      - app-network
    depends_on:
      - backend

  backend:
    image: bookstack-sync-spring_bookstack-sync
    container_name: bookstack-sync
    ports:
      - "8080:8080"
    restart: always
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

### 3. Enable CORS in the Spring Boot Backend

Add a CORS configuration class to your Spring Boot application:

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow all origins, headers, and methods
        config.addAllowedOrigin("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        
        // Allow credentials
        config.setAllowCredentials(true);
        
        // Apply this configuration to all paths
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}
```

Alternatively, you can add the following properties to your `application.properties` or `application.yml` file:

```properties
# application.properties
spring.web.cors.allowed-origins=*
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
```

```yaml
# application.yml
spring:
  web:
    cors:
      allowed-origins: "*"
      allowed-methods: GET,POST,PUT,DELETE,OPTIONS
      allowed-headers: "*"
      allow-credentials: true
```

## Deployment

1. **Stop the existing containers**:
   ```bash
   docker-compose down
   ```

2. **Rebuild and start the containers**:
   ```bash
   docker-compose up -d --build
   ```

3. **Verify the deployment**:
   ```bash
   docker-compose ps
   ```

## Troubleshooting

- **Container not starting**: Check logs with `docker-compose logs`
- **Network issues**: Verify that both containers are on the same network with `docker network inspect app-network`
- **CORS errors still occurring**: Check that the CORS configuration is properly applied in the Spring Boot application

## Security Considerations

- In a production environment, you should:
  - Replace `*` with specific origins in the CORS configuration
  - Use HTTPS for secure communication
  - Implement proper authentication and authorization
  - Set up proper firewall rules on your VPS 