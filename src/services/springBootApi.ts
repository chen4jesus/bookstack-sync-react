import axios, { AxiosError } from 'axios';
import { Book } from './bookstackApi';

// Base URL for the Spring Boot backend
const SPRING_BOOT_API_URL = 'http://localhost:8080/api/sync';

// Debug API URL
const DEBUG_API_URL = 'http://localhost:8080/api/debug';

interface ApiErrorResponse {
  message?: string;
  error?: string;
  status?: string;
}

class SpringBootApi {
  /**
   * List all books from the source BookStack instance
   */
  async listBooks(): Promise<Book[]> {
    try {
      const response = await axios.get(`${SPRING_BOOT_API_URL}/books`);
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
      const response = await axios.get(`${SPRING_BOOT_API_URL}/books/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Synchronize a book from the source to the destination BookStack instance
   */
  async syncBook(sourceBookId: number): Promise<void> {
    try {
      const response = await axios.post(`${SPRING_BOOT_API_URL}/books/${sourceBookId}`);
      if (response.status !== 200) {
        throw new Error(`Failed to sync book: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Synchronize multiple books from the source to the destination BookStack instance
   */
  async syncBooks(sourceBookIds: number[]): Promise<{[key: number]: boolean}> {
    const results: {[key: number]: boolean} = {};
    
    for (const id of sourceBookIds) {
      try {
        await this.syncBook(id);
        results[id] = true;
      } catch (error) {
        console.error(`Error syncing book ${id}:`, error);
        results[id] = false;
      }
    }
    
    return results;
  }

  /**
   * Verify API credentials for both source and destination BookStack instances
   */
  async verifyCredentials(): Promise<{ sourceCredentialsValid: boolean }> {
    try {
      const response = await axios.get(`${SPRING_BOOT_API_URL}/verify`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get raw API response for debugging
   */
  async getRawBooks(): Promise<string> {
    try {
      const response = await axios.get(`${DEBUG_API_URL}/raw-books`);
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