import type pino from 'pino';
import { MAX_RETRIES, RETRY_DELAY_MS } from '../config.js';

interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  logger?: pino.Logger;
}

export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = MAX_RETRIES, delayMs = RETRY_DELAY_MS, logger } = options;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const backoffDelay = delayMs * Math.pow(2, attempt - 1);
        logger?.debug(
          { attempt, maxRetries, backoffDelay, error: lastError.message },
          'Retry attempt'
        );
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
  }

  logger?.error({ maxRetries, error: lastError?.message }, 'All retry attempts failed');
  throw lastError || new Error('All retries failed');
}
