# Timeout Configuration

This document explains the timeout configuration for the BookStack Sync application.

## Overview

The application has been configured with a 5-minute (300 seconds) timeout for API requests. This is necessary for operations that may take a long time to complete, such as syncing large books with many pages and images.

## Frontend Configuration

The frontend API client has been configured with a 5-minute timeout:

```typescript
// Timeout in milliseconds (5 minutes)
const API_TIMEOUT = 300000;

// Create axios instance with default config
const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Don't send cookies with requests
  withCredentials: false,
  // Set timeout to 5 minutes
  timeout: API_TIMEOUT
});
```

All API methods now use this configured client instead of direct axios calls.

## Nginx Configuration

The Nginx proxy has been configured with matching timeouts:

```nginx
# Increase client body size for larger uploads (default is 1m)
client_max_body_size 50m;

# Increase timeouts to 5 minutes (300 seconds)
proxy_connect_timeout 300s;
proxy_send_timeout 300s;
proxy_read_timeout 300s;
```

## Backend Configuration

The Spring Boot backend has been configured with matching timeouts through environment variables:

```yaml
environment:
  # Add timeout configuration (5 minutes = 300000ms)
  - SPRING_MVC_ASYNC_REQUEST_TIMEOUT=300000
  - SERVER_TOMCAT_CONNECTION-TIMEOUT=300000
  - SPRING_SERVLET_MULTIPART_MAX-FILE-SIZE=50MB
  - SPRING_SERVLET_MULTIPART_MAX-REQUEST-SIZE=50MB
```

## Adjusting Timeouts

If you need to adjust the timeouts, you should update all three components:

1. **Frontend**: Update the `API_TIMEOUT` constant in `src/services/springBootApi.ts`
2. **Nginx**: Update the timeout values in `nginx.conf`
3. **Backend**: Update the environment variables in `docker-compose.yml`

## Troubleshooting Timeout Issues

If you're experiencing timeout issues:

1. **Check the browser console** for timeout errors
2. **Check the Nginx logs** for timeout errors: `docker-compose logs frontend`
3. **Check the backend logs** for timeout errors: `docker-compose logs backend`

Common timeout errors:

- Frontend: "timeout of 300000ms exceeded"
- Nginx: "upstream timed out"
- Backend: "Request processing timed out"

## Performance Considerations

While increasing timeouts allows for longer operations, it's also important to optimize the application to reduce the need for long-running requests:

1. **Implement pagination** for large data sets
2. **Use background processing** for long-running tasks
3. **Implement progress indicators** for better user experience

## Security Considerations

Long timeouts can potentially make your application more vulnerable to denial-of-service attacks. Consider implementing:

1. **Rate limiting** to prevent abuse
2. **Request validation** to reject obviously invalid requests early
3. **Resource limits** to prevent a single request from consuming too many resources 