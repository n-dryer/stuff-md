export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly retryAfter?: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export const authorizedFetch = async (
  accessToken: string,
  url: string,
  options: globalThis.RequestInit = {},
  retryable: boolean = true,
  signal?: AbortSignal
): Promise<Response> => {
  const fetchFn = async (): Promise<Response> => {
    if (signal?.aborted) {
      throw new Error('Request was aborted');
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        signal,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(
          'Network error: Failed to connect to Google Drive API. Please check your internet connection.'
        );
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request was aborted');
      }
      throw error;
    }

    if (response.status === 401) {
      throw new AuthError(
        'The Google Drive API access token is invalid or expired.'
      );
    }

    if (response.status === 429) {
      const retryAfterHeader = response.headers.get('Retry-After');
      const retryAfter = retryAfterHeader
        ? parseInt(retryAfterHeader, 10)
        : undefined;
      const error = new RateLimitError(
        'Google Drive API rate limit exceeded. Please try again later.',
        retryAfter
      );
      Object.assign(error, { status: 429 });
      throw error;
    }

    if (
      response.status >= 400 &&
      response.status < 500 &&
      response.status !== 429
    ) {
      // For 403 Forbidden, provide more specific error message
      if (response.status === 403) {
        let errorMessage = 'Google Drive API access forbidden (403). ';
        try {
          const clonedResponse = response.clone();
          let errorBody: {
            error?: {
              message?: string;
              errors?: Array<{ message?: string; reason?: string }>;
            };
          };
          try {
            errorBody = (await clonedResponse.json()) as typeof errorBody;
          } catch (jsonError) {
            throw new Error('Failed to parse error response');
          }
          if (errorBody.error?.message) {
            errorMessage += errorBody.error.message;
          } else if (errorBody.error?.errors?.[0]?.message) {
            errorMessage += errorBody.error.errors[0].message;
          } else if (errorBody.error?.errors?.[0]?.reason) {
            errorMessage += `Reason: ${errorBody.error.errors[0].reason}. `;
            errorMessage +=
              'This usually means: (1) Drive API is not enabled in your Google Cloud project, (2) OAuth consent screen is not properly configured, or (3) the requested scope was not granted.';
          }
        } catch {
          errorMessage +=
            'Please check that Google Drive API is enabled in your Google Cloud project and that the OAuth consent screen is properly configured.';
        }
        const error = new Error(errorMessage);
        Object.assign(error, { status: 403 });
        throw error;
      }
      const error = new Error(
        `Google Drive API client error: ${response.status} ${response.statusText}`
      );
      Object.assign(error, { status: response.status });
      throw error;
    }

    if (response.status >= 500) {
      const error = new Error(
        `Google Drive API server error: ${response.status} ${response.statusText}`
      );
      Object.assign(error, { status: response.status });
      throw error;
    }

    return response;
  };

  if (retryable) {
    try {
      const { retryWithBackoff } = await import('../../utils/retry');

      const wrappedFetchFn = async (): Promise<Response> => {
        if (signal?.aborted) {
          throw new Error('Request was aborted');
        }
        return await fetchFn();
      };

      return await retryWithBackoff(wrappedFetchFn, {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 30000,
        backoffMultiplier: 2,
        retryableStatuses: [429, 500, 502, 503, 504],
      });
    } catch (error) {
      if (
        signal?.aborted ||
        (error instanceof Error && error.message.includes('abort'))
      ) {
        throw new Error('Request was aborted');
      }
      if (error instanceof AuthError || error instanceof RateLimitError) {
        throw error;
      }
      throw error;
    }
  }

  return await fetchFn();
};
