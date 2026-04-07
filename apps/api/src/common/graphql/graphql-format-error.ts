import { Logger } from '@nestjs/common';
import { GraphQLFormattedError } from 'graphql';

const logger = new Logger('GraphQL');

/**
 * Sanitizes errors in production (no stack / internal details in extensions).
 */
export function formatGraphqlError(
  formattedError: GraphQLFormattedError,
  _error: unknown,
): GraphQLFormattedError {
  if (process.env.NODE_ENV !== 'production') {
    return formattedError;
  }

  const code =
    formattedError.extensions?.code ??
    (formattedError.extensions?.exception as { status?: number } | undefined)?.status;

  if (formattedError.extensions?.stacktrace) {
    logger.warn(formattedError.message);
  }

  return {
    message: formattedError.message,
    path: formattedError.path,
    locations: formattedError.locations,
    extensions: {
      code: typeof code === 'string' || typeof code === 'number' ? String(code) : 'INTERNAL_ERROR',
    },
  };
}
