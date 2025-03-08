# CORS Troubleshooting Guide

This guide provides solutions for CORS (Cross-Origin Resource Sharing) issues that may occur when deploying the BookStack Sync application.

## Understanding the 403 "Invalid CORS request" Error

A 403 "Invalid CORS request" error occurs when the browser attempts to make a cross-origin request that is rejected by the server due to CORS policy restrictions. This typically happens when:

1. The server doesn't include the necessary CORS headers in its responses
2. The request includes credentials (cookies, HTTP authentication) but the server doesn't explicitly allow them
3. The request method or headers aren't allowed by the server's CORS policy

## Solutions

### 1. Spring Boot Backend Configuration

Add a proper CORS configuration to your Spring Boot application:

#### Option 1: Java Configuration Class

```java
package com.yourpackage.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Authorization")
                .maxAge(3600);
    }

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow all origins
        config.addAllowedOrigin("*");
        
        // Allow all headers
        config.addAllowedHeader("*");
        
        // Allow all methods
        config.addAllowedMethod("*");
        
        // Allow credentials (cookies, authorization headers, etc.)
        config.setAllowCredentials(false);
        
        // Set max age for preflight requests
        config.setMaxAge(3600L);
        
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

#### Option 2: Application Properties

Add these properties to your `application.properties` or `application.yml` file:

```properties
# CORS Configuration
spring.web.cors.allowed-origins=*
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=false
spring.web.cors.max-age=3600
```

### 2. Nginx Configuration

Update your Nginx configuration to handle CORS properly:

```nginx
# Proxy API requests to the backend service
location /api/ {
    # CORS headers
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,Accept,Origin' always;
    add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;
    
    # Handle preflight requests
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,Accept,Origin' always;
        add_header 'Access-Control-Max-Age' 1728000 always;
        add_header 'Content-Type' 'text/plain; charset=utf-8' always;
        add_header 'Content-Length' 0 always;
        return 204;
    }
    
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
    proxy_set_header Origin "";  # Remove Origin header to prevent CORS issues
    proxy_cache_bypass $http_upgrade;
}
```

### 3. Frontend Configuration

Update your frontend API service to handle CORS properly:

```typescript
// Create axios instance with default config
const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Don't send cookies with requests
  withCredentials: false
});
```

## Debugging CORS Issues

1. **Check browser console**: Look for detailed CORS error messages
2. **Inspect network requests**: Use browser developer tools to see the request/response headers
3. **Check backend logs**: Look for any CORS-related errors or warnings
4. **Test with curl**: Use curl to make requests directly to the backend to isolate browser CORS issues

```bash
curl -X OPTIONS -H "Origin: http://localhost:8123" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type" http://localhost:8080/api/sync/verify -v
```

## Common CORS Issues and Solutions

1. **Missing CORS headers**: Ensure the server includes the necessary CORS headers in its responses
2. **Credentials issues**: If using credentials, ensure `Access-Control-Allow-Credentials` is set to `true` and `Access-Control-Allow-Origin` is not `*`
3. **Method not allowed**: Ensure the server allows the HTTP methods your application uses
4. **Headers not allowed**: Ensure the server allows all headers your application sends
5. **Network issues**: Ensure the backend service is accessible from the frontend container

## Additional Resources

- [MDN Web Docs: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Spring Boot CORS Documentation](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#mvc-cors)
- [Nginx CORS Documentation](https://nginx.org/en/docs/http/ngx_http_headers_module.html) 