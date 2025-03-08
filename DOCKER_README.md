# Docker Deployment Guide for React Application

This guide provides instructions for deploying the React application using Docker on any VPS.

## Prerequisites

- Docker installed on your VPS
- Docker Compose installed on your VPS
- Git (optional, for cloning the repository)

## Quick Deployment (One-Line Command)

On Windows:
```powershell
docker-compose up -d --build
```

On Linux/macOS:
```bash
./deploy.sh
```
Or if the script is not executable:
```bash
bash deploy.sh
```

## Manual Deployment Steps

1. **Clone or upload your application to the VPS**

2. **Navigate to the application directory**
   ```bash
   cd your-application-directory
   ```

3. **Build and start the Docker containers**
   ```bash
   docker-compose up -d --build
   ```

4. **Verify the deployment**
   ```bash
   docker-compose ps
   ```

## Configuration

### Port Configuration

- Frontend: The React application runs on port 8123
- Backend: The backend service runs on port 8080

### Backend Service

The backend service is configured in the docker-compose.yml file. You need to:

1. Replace `your-backend-image:latest` with your actual backend Docker image
2. Adjust any environment variables or volumes as needed

## Accessing the Application

After deployment, your application will be available at:
- http://your-server-ip:8123 (Frontend)
- http://your-server-ip:8080 (Backend API)

To configure HTTPS:
1. Obtain SSL certificates
2. Update the Nginx configuration to use SSL
3. Update the ports in docker-compose.yml to include port 443

## Maintenance Commands

- **View logs**:
  ```bash
  docker-compose logs -f
  ```

- **Stop the application**:
  ```bash
  docker-compose down
  ```

- **Restart the application**:
  ```bash
  docker-compose restart
  ```

- **Update the application** (after code changes):
  ```bash
  docker-compose up -d --build
  ```

## Troubleshooting

- **Container not starting**: Check logs with `docker-compose logs`
- **Cannot access the application**: Verify firewall settings and that ports 8123 and 8080 are open
- **API requests failing**: Check the backend service configuration and Nginx proxy settings

## Security Considerations

- Consider using environment variables for sensitive information
- Set up proper firewall rules on your VPS
- Implement SSL/TLS for secure communication
- Regularly update your Docker images 