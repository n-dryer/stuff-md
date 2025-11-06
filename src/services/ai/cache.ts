/**
 * Request Cache
 *
 * Singleton class for managing AI request caching and deduplication.
 * Handles both result caching and active request tracking.
 */

import { AICategorizationResult } from '../../types';
import { CACHE_MAX_SIZE } from './constants';

class RequestCache {
  private cache = new Map<string, AICategorizationResult>();
  private activeRequests = new Map<
    string,
    Promise<AICategorizationResult | null>
  >();

  /**
   * Gets a cached result if available
   */
  get(key: string): AICategorizationResult | undefined {
    return this.cache.get(key);
  }

  /**
   * Sets a cached result, evicting oldest entry if at max size
   */
  set(key: string, value: AICategorizationResult): void {
    if (this.cache.size >= CACHE_MAX_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  /**
   * Gets an active request promise if one exists
   */
  getActiveRequest(
    key: string
  ): Promise<AICategorizationResult | null> | undefined {
    return this.activeRequests.get(key);
  }

  /**
   * Sets an active request promise
   */
  setActiveRequest(
    key: string,
    promise: Promise<AICategorizationResult | null>
  ): void {
    this.activeRequests.set(key, promise);
  }

  /**
   * Removes an active request
   */
  deleteActiveRequest(key: string): void {
    this.activeRequests.delete(key);
  }
}

// Export singleton instance
export const requestCache = new RequestCache();
