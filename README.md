# BookStack Sync React UI

A React application that provides a user interface for the BookStack Sync Spring Boot application.

## Features

- Simple UI for synchronizing books between two BookStack instances
- Integration with the BookStack Sync Spring Boot backend
- List and select books from the source BookStack instance
- Trigger synchronization of books to the destination BookStack instance

## Prerequisites

- Node.js 16 or higher
- npm 7 or higher
- BookStack Sync Spring Boot application running on http://localhost:8080

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to http://localhost:5173

## Integration with Spring Boot Backend

This React application is designed to work with the BookStack Sync Spring Boot backend. The Spring Boot application handles all API calls to the BookStack instances, while this React application provides a user interface for interacting with the Spring Boot backend.

### API Endpoints

The React application communicates with the Spring Boot backend using the following endpoints:

- `GET /api/sync/books` - List all books from the source BookStack instance
- `GET /api/sync/books/{id}` - Get a book by ID from the source BookStack instance
- `POST /api/sync/books/{id}` - Synchronize a book from the source to the destination BookStack instance
- `GET /api/sync/verify` - Verify API credentials for both source and destination BookStack instances

### Configuration

The Spring Boot backend is configured with the following credentials:

- Source: `https://books.faithconnect.us`
- Destination: `http://172.17.71.2`

If you need to change these credentials, you'll need to update the `application.properties` file in the Spring Boot application.

## Building for Production

To build the application for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

- `src/App.tsx` - Main application component
- `src/services/springBootApi.ts` - Service for communicating with the Spring Boot backend
- `src/services/bookstackApi.ts` - Types and interfaces for BookStack API

## License

This project is licensed under the MIT License - see the LICENSE file for details.
