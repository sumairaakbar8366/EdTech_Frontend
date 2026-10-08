import { ApiError } from '@/services/api/http';

/** A user-facing message for any thrown error (API messages are already user-facing). */
export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  return error instanceof ApiError ? error.message : fallback;
}
