import axios, { AxiosError } from 'axios';
import { Book } from './bookstackApi';
import { BookStackConfigDTO } from '../components/ConfigForm';

// Use relative URLs instead of hardcoded localhost URLs
// This will make API requests go to the same host that serves the frontend
const SPRING_BOOT_API_URL = '/api/sync';

// Debug API URL
const DEBUG_API_URL = '/api/debug';

// Session storage key for configuration
const CONFIG_SESSION_STORAGE_KEY = 'bookstack_sync_config_session';

// Timeout in milliseconds (5 minutes)
const API_TIMEOUT = 300000;

interface ApiErrorResponse {
  message?: string;
  error?: string;
  status?: string;
}

// Define a type for headers to avoid TypeScript errors
interface ApiHeaders {
  'X-Source-Url'?: string;
  'X-Source-Token'?: string;
  'X-Source-Token-Id'?: string;
  'X-Destination-Url'?: string;
  'X-Destination-Token'?: string;
  'X-Destination-Token-Id'?: string;
  [key: string]: string | undefined;
}

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

class SpringBootApi {
  /**
   * Get the current configuration from session storage
   */
  async getConfig(): Promise<BookStackConfigDTO | null> {
    try {
      const configJson = sessionStorage.getItem(CONFIG_SESSION_STORAGE_KEY);
      return configJson ? JSON.parse(configJson) : null;
    } catch (error) {
      console.error('Error getting config from session storage:', error);
      return null;
    }
  }

  /**
   * Save configuration to session storage
   */
  async saveConfig(config: BookStackConfigDTO): Promise<void> {
    try {
      // Save to session storage (persists during browser session but clears on tab close)
      sessionStorage.setItem(CONFIG_SESSION_STORAGE_KEY, JSON.stringify(config));
      
      // No need to send to backend anymore as we'll pass credentials with each request
      return Promise.resolve();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * List all books from the source BookStack instance
   */
  async listBooks(): Promise<Book[]> {
    try {
      const config = await this.getConfig();
      const headers: ApiHeaders = {};
      
      if (!config) {
        console.error('No configuration found when trying to list books');
        throw new Error('Configuration is missing');
      }
      
      // Ensure all required source credentials are present
      if (!config.sourceBaseUrl || !config.sourceTokenSecret || !config.sourceTokenId) {
        console.error('Source credentials are incomplete for listing books');
        throw new Error('Source credentials are incomplete');
      }
      
      // Add source credentials to headers
      headers['X-Source-Url'] = config.sourceBaseUrl;
      headers['X-Source-Token'] = config.sourceTokenSecret;
      headers['X-Source-Token-Id'] = config.sourceTokenId;
      
      console.log('Listing books with headers:', Object.keys(headers));
      
      // Use apiClient instead of axios directly to benefit from the timeout setting
      const response = await apiClient.get(`${SPRING_BOOT_API_URL}/books`, { 
        headers,
        timeout: API_TIMEOUT
      });
      
      console.log('Books list response:', response.status, response.data?.length || 0, 'books');
      return response.data;
    } catch (error) {
      console.error('Error listing books:', error);
      this.handleError(error);
    }
  }

  /**
   * Get a book by ID from the source BookStack instance
   */
  async getBook(id: number): Promise<Book> {
    try {
      const config = await this.getConfig();
      const headers: ApiHeaders = {};
      
      if (!config) {
        console.error(`No configuration found when trying to get book ${id}`);
        throw new Error('Configuration is missing');
      }
      
      // Ensure all required source credentials are present
      if (!config.sourceBaseUrl || !config.sourceTokenSecret || !config.sourceTokenId) {
        console.error(`Source credentials are incomplete for getting book ${id}`);
        throw new Error('Source credentials are incomplete');
      }
      
      // Add source credentials to headers
      headers['X-Source-Url'] = config.sourceBaseUrl;
      headers['X-Source-Token'] = config.sourceTokenSecret;
      headers['X-Source-Token-Id'] = config.sourceTokenId;
      
      console.log(`Getting book ${id} with headers:`, Object.keys(headers));
      
      const response = await apiClient.get(`${SPRING_BOOT_API_URL}/books/${id}`, { 
        headers,
        timeout: API_TIMEOUT
      });
      
      console.log(`Book ${id} response:`, response.status);
      return response.data;
    } catch (error) {
      console.error(`Error getting book ${id}:`, error);
      this.handleError(error);
    }
  }

  /**
   * Sync a book from source to destination
   */
  async syncBook(sourceBookId: number): Promise<void> {
    try {
      const config = await this.getConfig();
      const headers: ApiHeaders = {};
      
      if (!config) {
        console.error('No configuration found when trying to sync book');
        throw new Error('Configuration is missing');
      }
      
      // Ensure all required credentials are present
      if (!config.sourceBaseUrl || !config.sourceTokenSecret || !config.sourceTokenId ||
          !config.destinationBaseUrl || !config.destinationTokenSecret || !config.destinationTokenId) {
        console.error('Credentials are incomplete for book sync');
        throw new Error('Source or destination credentials are incomplete');
      }
      
      // Add source credentials to headers
      headers['X-Source-Url'] = config.sourceBaseUrl;
      headers['X-Source-Token'] = config.sourceTokenSecret;
      headers['X-Source-Token-Id'] = config.sourceTokenId;
      
      // Add destination credentials
      headers['X-Destination-Url'] = config.destinationBaseUrl;
      headers['X-Destination-Token'] = config.destinationTokenSecret;
      headers['X-Destination-Token-Id'] = config.destinationTokenId;
      
      console.log(`Syncing book ${sourceBookId} with headers:`, Object.keys(headers));
      
      // Send an empty object as the request body
      const response = await apiClient.post(`${SPRING_BOOT_API_URL}/books/${sourceBookId}`, null, { 
        headers,
        timeout: API_TIMEOUT
      });
      
      console.log(`Book ${sourceBookId} sync response:`, response.status);
      return response.data;
    } catch (error) {
      console.error(`Error syncing book ${sourceBookId}:`, error);
      this.handleError(error);
    }
  }

  /**
   * Sync multiple books from source to destination
   */
  async syncBooks(sourceBookIds: number[]): Promise<{[key: number]: boolean}> {
    try {
      const config = await this.getConfig();
      const headers: ApiHeaders = {};
      
      if (!config) {
        console.error('No configuration found when trying to sync multiple books');
        throw new Error('Configuration is missing');
      }
      
      // Ensure all required credentials are present
      if (!config.sourceBaseUrl || !config.sourceTokenSecret || !config.sourceTokenId ||
          !config.destinationBaseUrl || !config.destinationTokenSecret || !config.destinationTokenId) {
        console.error('Credentials are incomplete for books sync');
        throw new Error('Source or destination credentials are incomplete');
      }
      
      // Add source credentials to headers
      headers['X-Source-Url'] = config.sourceBaseUrl;
      headers['X-Source-Token'] = config.sourceTokenSecret;
      headers['X-Source-Token-Id'] = config.sourceTokenId;
      
      // Add destination credentials
      headers['X-Destination-Url'] = config.destinationBaseUrl;
      headers['X-Destination-Token'] = config.destinationTokenSecret;
      headers['X-Destination-Token-Id'] = config.destinationTokenId;
      
      console.log(`Syncing ${sourceBookIds.length} books with headers:`, Object.keys(headers));
      
      const response = await apiClient.post(`${SPRING_BOOT_API_URL}/books`, sourceBookIds, { 
        headers,
        timeout: API_TIMEOUT
      });
      
      console.log(`Books sync response:`, response.status, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error syncing multiple books:`, error);
      this.handleError(error);
    }
  }

  /**
   * Verify credentials for source and destination
   */
  async verifyCredentials(): Promise<{ sourceCredentialsValid: boolean; destinationCredentialsValid?: boolean }> {
    try {
      const config = await this.getConfig();
      const headers: ApiHeaders = {};
      
      if (!config) {
        console.error('No configuration found when trying to verify credentials');
        throw new Error('Configuration is missing');
      }
      
      // Ensure all required source credentials are present
      if (!config.sourceBaseUrl || !config.sourceTokenSecret || !config.sourceTokenId) {
        console.error('Source credentials are incomplete', { 
          hasUrl: !!config.sourceBaseUrl, 
          hasToken: !!config.sourceTokenSecret, 
          hasTokenId: !!config.sourceTokenId 
        });
        throw new Error('Source credentials are incomplete');
      }
      
      // Add source credentials to headers
      headers['X-Source-Url'] = config.sourceBaseUrl;
      headers['X-Source-Token'] = config.sourceTokenSecret;
      headers['X-Source-Token-Id'] = config.sourceTokenId;
      
      // Add destination credentials if they exist
      if (config.destinationBaseUrl && config.destinationTokenId && config.destinationTokenSecret) {
        headers['X-Destination-Url'] = config.destinationBaseUrl;
        headers['X-Destination-Token'] = config.destinationTokenSecret;
        headers['X-Destination-Token-Id'] = config.destinationTokenId;
      }
      
      console.log('Verifying credentials with headers:', Object.keys(headers));
      
      const response = await apiClient.get(`${SPRING_BOOT_API_URL}/verify`, { 
        headers,
        // Explicitly set timeout for this critical operation
        timeout: API_TIMEOUT
      });
      
      console.log('Credential verification response:', response.status, response.data);
      return response.data;
    } catch (error) {
      console.error('Error verifying credentials:', error);
      this.handleError(error);
    }
  }

  /**
   * Get raw books data for debugging
   */
  async getRawBooks(): Promise<string> {
    try {
      const config = await this.getConfig();
      const headers: ApiHeaders = {};
      
      if (!config) {
        console.error('No configuration found when trying to get raw books data');
        throw new Error('Configuration is missing');
      }
      
      // Ensure all required source credentials are present
      if (!config.sourceBaseUrl || !config.sourceTokenSecret || !config.sourceTokenId) {
        console.error('Source credentials are incomplete for getting raw books data');
        throw new Error('Source credentials are incomplete');
      }
      
      // Add source credentials to headers
      headers['X-Source-Url'] = config.sourceBaseUrl;
      headers['X-Source-Token'] = config.sourceTokenSecret;
      headers['X-Source-Token-Id'] = config.sourceTokenId;
      
      console.log('Getting raw books data with headers:', Object.keys(headers));
      
      const response = await apiClient.get(`${DEBUG_API_URL}/books`, { 
        headers,
        timeout: API_TIMEOUT,
        responseType: 'text' // Ensure we get the raw response as text
      });
      
      console.log('Raw books data response:', response.status);
      return response.data;
    } catch (error) {
      console.error('Error getting raw books data:', error);
      this.handleError(error);
    }
  }

  /**
   * Test API connection and diagnose issues
   */
  async testConnection(): Promise<{ status: string; details: any }> {
    try {
      const config = await this.getConfig();
      
      if (!config) {
        return {
          status: 'error',
          details: 'No configuration found. Please configure the application first.'
        };
      }
      
      // Check if we have source credentials
      const hasSourceCredentials = !!(
        config.sourceBaseUrl && 
        config.sourceTokenSecret && 
        config.sourceTokenId
      );
      
      // Check if we have destination credentials
      const hasDestinationCredentials = !!(
        config.destinationBaseUrl && 
        config.destinationTokenSecret && 
        config.destinationTokenId
      );
      
      // Create test headers
      const headers: ApiHeaders = {};
      
      if (hasSourceCredentials) {
        headers['X-Source-Url'] = config.sourceBaseUrl;
        headers['X-Source-Token'] = config.sourceTokenSecret;
        headers['X-Source-Token-Id'] = config.sourceTokenId;
      }
      
      // Test basic connectivity to the backend
      try {
        // Simple ping to the backend with a short timeout
        const pingResponse = await apiClient.get(`${SPRING_BOOT_API_URL}/ping`, { 
          headers,
          timeout: 5000 // Short timeout for ping
        });
        
        return {
          status: 'success',
          details: {
            backendConnected: true,
            pingResponse: pingResponse.data,
            hasSourceCredentials,
            hasDestinationCredentials,
            configuredSourceUrl: config.sourceBaseUrl,
            configuredDestinationUrl: config.destinationBaseUrl
          }
        };
      } catch (error) {
        // If we can't connect to the backend, return detailed error
        if (axios.isAxiosError(error)) {
          return {
            status: 'error',
            details: {
              backendConnected: false,
              errorMessage: error.message,
              errorCode: error.code,
              errorResponse: error.response?.data,
              errorStatus: error.response?.status,
              hasSourceCredentials,
              hasDestinationCredentials,
              configuredSourceUrl: config.sourceBaseUrl,
              configuredDestinationUrl: config.destinationBaseUrl
            }
          };
        }
        
        return {
          status: 'error',
          details: {
            backendConnected: false,
            errorMessage: String(error),
            hasSourceCredentials,
            hasDestinationCredentials
          }
        };
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      return {
        status: 'error',
        details: {
          errorMessage: String(error)
        }
      };
    }
  }

  /**
   * List all books from the destination BookStack instance
   */
  async listDestinationBooks(): Promise<Book[]> {
    try {
      const config = await this.getConfig();
      const headers: ApiHeaders = {};
      
      if (!config) {
        console.error('No configuration found when trying to list destination books');
        throw new Error('Configuration is missing');
      }
      
      // Ensure all required destination credentials are present
      if (!config.destinationBaseUrl || !config.destinationTokenSecret || !config.destinationTokenId) {
        console.error('Destination credentials are incomplete for listing books');
        throw new Error('Destination credentials are incomplete');
      }
      
      // Add destination credentials to headers
      headers['X-Destination-Url'] = config.destinationBaseUrl;
      headers['X-Destination-Token'] = config.destinationTokenSecret;
      headers['X-Destination-Token-Id'] = config.destinationTokenId;
      
      console.log('Listing destination books with headers:', Object.keys(headers));
      
      // Use apiClient instead of axios directly to benefit from the timeout setting
      const response = await apiClient.get(`${SPRING_BOOT_API_URL}/destination/books`, { 
        headers,
        timeout: API_TIMEOUT
      });
      
      console.log('Destination books list response:', response.status, response.data?.length || 0, 'books');
      return response.data;
    } catch (error) {
      console.error('Error listing destination books:', error);
      this.handleError(error);
    }
  }

  /**
   * Delete a book from the destination BookStack instance
   */
  async deleteDestinationBook(bookId: number): Promise<void> {
    try {
      const config = await this.getConfig();
      const headers: ApiHeaders = {};
      
      if (!config) {
        console.error(`No configuration found when trying to delete destination book ${bookId}`);
        throw new Error('Configuration is missing');
      }
      
      // Ensure all required destination credentials are present
      if (!config.destinationBaseUrl || !config.destinationTokenSecret || !config.destinationTokenId) {
        console.error(`Destination credentials are incomplete for deleting book ${bookId}`);
        throw new Error('Destination credentials are incomplete');
      }
      
      // Add destination credentials to headers
      headers['X-Destination-Url'] = config.destinationBaseUrl;
      headers['X-Destination-Token'] = config.destinationTokenSecret;
      headers['X-Destination-Token-Id'] = config.destinationTokenId;
      
      console.log(`Deleting destination book ${bookId} with headers:`, Object.keys(headers));
      
      const response = await apiClient.delete(`${SPRING_BOOT_API_URL}/destination/books/${bookId}`, { 
        headers,
        timeout: API_TIMEOUT
      });
      
      console.log(`Destination book ${bookId} delete response:`, response.status);
      return response.data;
    } catch (error) {
      console.error(`Error deleting destination book ${bookId}:`, error);
      this.handleError(error);
    }
  }

  /**
   * Delete multiple books from the destination BookStack instance one by one
   * This method doesn't use the bulk delete endpoint, but instead calls deleteDestinationBook
   * for each book ID sequentially, similar to how syncBook works
   */
  async deleteDestinationBooksOneByOne(bookIds: number[]): Promise<{[key: number]: boolean}> {
    try {
      console.log(`Deleting ${bookIds.length} destination books one by one`);
      
      const results: {[key: number]: boolean} = {};
      
      // Process each book sequentially
      for (const bookId of bookIds) {
        try {
          // Delete the individual book
          await this.deleteDestinationBook(bookId);
          results[bookId] = true;
        } catch (error) {
          console.error(`Error deleting destination book ${bookId}:`, error);
          results[bookId] = false;
        }
      }
      
      console.log(`Finished deleting books one by one. Results:`, results);
      return results;
    } catch (error) {
      console.error(`Error in deleteDestinationBooksOneByOne:`, error);
      this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response) {
        console.error('API Error Response:', {
          status: axiosError.response.status,
          data: axiosError.response.data,
          headers: axiosError.response.headers,
          config: {
            url: axiosError.config?.url,
            method: axiosError.config?.method,
          }
        });

        const errorMessage = axiosError.response.data?.message || 
                           axiosError.response.data?.error || 
                           axiosError.response.data?.status ||
                           axiosError.message;
        throw new Error(`API Error: ${axiosError.response.status} - ${errorMessage}`);
      } else if (axiosError.request) {
        throw new Error('No response received from server');
      } else {
        throw new Error(`Request Error: ${axiosError.message}`);
      }
    }
    throw error;
  }
}

export default SpringBootApi; 