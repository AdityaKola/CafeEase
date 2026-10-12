import axios from 'axios';

const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 502, 503, 504]);

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export const isRetryableApiError = (error) => {
  const status = error.response?.status;
  return !error.response || RETRYABLE_STATUS_CODES.has(status);
};

export const postWithWakeRetry = async (url, data, config = {}, onRetry) => {
  const attempts = 4;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await axios.post(url, data, { timeout: 45000, ...config });
    } catch (error) {
      if (!isRetryableApiError(error) || attempt === attempts) {
        throw error;
      }

      onRetry?.(attempt);
      await wait(attempt * 1500);
    }
  }
};

