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
      
      if (config) {
        headers['X-Source-Url'] = config.sourceBaseUrl;
        headers['X-Source-Token'] = config.sourceTokenSecret;
        headers['X-Source-Token-Id'] = config.sourceTokenId;
      }
      
      // Use apiClient instead of axios directly to benefit from the timeout setting
      const response = await apiClient.get(`${SPRING_BOOT_API_URL}/books`, { headers });
      return response.data;
    } catch (error) {
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
      
      if (config) {
        headers['X-Source-Url'] = config.sourceBaseUrl;
        headers['X-Source-Token'] = config.sourceTokenSecret;
        headers['X-Source-Token-Id'] = config.sourceTokenId;
      }
      
      const response = await apiClient.get(`${SPRING_BOOT_API_URL}/books/${id}`, { headers });
      return response.data;
    } catch (error) {
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
      
      if (config) {
        headers['X-Source-Url'] = config.sourceBaseUrl;
        headers['X-Source-Token'] = config.sourceTokenSecret;
        headers['X-Source-Token-Id'] = config.sourceTokenId;
        headers['X-Destination-Url'] = config.destinationBaseUrl;
        headers['X-Destination-Token'] = config.destinationTokenSecret;
        headers['X-Destination-Token-Id'] = config.destinationTokenId;
      }
      
      await apiClient.post(`${SPRING_BOOT_API_URL}/books/${sourceBookId}`, {}, { headers });
    } catch (error) {
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
      
      if (config) {
        headers['X-Source-Url'] = config.sourceBaseUrl;
        headers['X-Source-Token'] = config.sourceTokenSecret;
        headers['X-Source-Token-Id'] = config.sourceTokenId;
        headers['X-Destination-Url'] = config.destinationBaseUrl;
        headers['X-Destination-Token'] = config.destinationTokenSecret;
        headers['X-Destination-Token-Id'] = config.destinationTokenId;
      }
      
      const response = await apiClient.post(`${SPRING_BOOT_API_URL}/books`, sourceBookIds, { headers });
      return response.data;
    } catch (error) {
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
      
      if (config) {
        headers['X-Source-Url'] = config.sourceBaseUrl;
        headers['X-Source-Token'] = config.sourceTokenSecret;
        headers['X-Source-Token-Id'] = config.sourceTokenId;
        
        if (config.destinationBaseUrl && config.destinationTokenId && config.destinationTokenSecret) {
          headers['X-Destination-Url'] = config.destinationBaseUrl;
          headers['X-Destination-Token'] = config.destinationTokenSecret;
          headers['X-Destination-Token-Id'] = config.destinationTokenId;
        }
      }
      
      const response = await apiClient.get(`${SPRING_BOOT_API_URL}/verify`, {}, { headers });
      return response.data;
    } catch (error) {
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
      
      if (config) {
        headers['X-Source-Url'] = config.sourceBaseUrl;
        headers['X-Source-Token'] = config.sourceTokenSecret;
        headers['X-Source-Token-Id'] = config.sourceTokenId;
      }
      
      const response = await apiClient.get(`${DEBUG_API_URL}/books`, { headers });
      return response.data;
    } catch (error) {
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