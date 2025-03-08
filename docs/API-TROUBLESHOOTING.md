# API Troubleshooting Guide

## Common Issues and Solutions

### 500 Internal Server Error: "Failed to verify credentials"

This error occurs when the backend cannot verify the credentials you've provided. Here are some steps to troubleshoot:

1. **Check your credentials**:
   - Ensure your source and destination URLs are correct and include the protocol (http:// or https://)
   - Verify that your API tokens and token IDs are correct
   - Make sure there are no extra spaces or special characters in your credentials

2. **Check the backend logs**:
   - Run `docker-compose logs backend` to see detailed error messages from the Spring Boot application
   - Look for specific error messages related to credential verification

3. **Test API connectivity**:
   - Open your browser console (F12) and run the following code to test connectivity:
   ```javascript
   // Get the API instance
   const api = window.springBootApi;
   
   // Test connection
   api.testConnection().then(result => console.log(JSON.stringify(result, null, 2)));
   ```

4. **Verify BookStack API access**:
   - Try accessing your BookStack API directly to ensure it's working
   - For source: `curl -H "Authorization: Token {token_id}:{token_secret}" {source_url}/api/books`
   - For destination: `curl -H "Authorization: Token {token_id}:{token_secret}" {destination_url}/api/books`

5. **Check network connectivity**:
   - Ensure your Docker containers can access the internet
   - Verify that your BookStack instances are accessible from the Docker container

## Debugging HTTP Requests

To see detailed information about HTTP requests:

1. Open your browser's developer tools (F12)
2. Go to the Network tab
3. Filter for "api" to see only API requests
4. Look for requests to `/api/sync/verify` and check:
   - Request headers (should include X-Source-Url, X-Source-Token, X-Source-Token-Id)
   - Response status and body

## Common Error Messages

### "Failed to verify credentials"

This means the backend couldn't connect to your BookStack instance with the provided credentials. Possible causes:

- Incorrect URL (missing protocol, wrong domain, etc.)
- Invalid API token or token ID
- BookStack API is not accessible from the backend container
- Network connectivity issues

### "Connection timeout"

This indicates that the backend couldn't reach your BookStack instance:

- Check if the BookStack URL is accessible from the Docker container
- Ensure there are no firewall rules blocking access
- Verify that your BookStack instance is online

## Testing with curl

You can test the API directly using curl:

```bash
# Test verify endpoint
curl -v -H "X-Source-Url: YOUR_SOURCE_URL" \
   -H "X-Source-Token: YOUR_SOURCE_TOKEN" \
   -H "X-Source-Token-Id: YOUR_SOURCE_TOKEN_ID" \
   http://localhost:8123/api/sync/verify
```

Replace `localhost:8123` with your actual frontend URL and port.

## Backend Configuration

If you're still experiencing issues, check the Spring Boot application properties:

```
# CORS Configuration
spring.web.cors.allowed-origins=*
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=false
spring.web.cors.max-age=3600
```

## Need More Help?

If you're still experiencing issues:

1. Collect the following information:
   - Frontend console logs
   - Backend logs (`docker-compose logs backend`)
   - Network request/response details from browser dev tools
   - Your configuration (with sensitive information redacted)

2. Create a detailed issue report with all the above information 