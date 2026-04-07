import { ApolloClient } from '@apollo/client';
import { createApolloCache } from './apollo-cache';
import { createApolloLink } from './apollo-links';

export function createApolloClient(): ApolloClient {
  return new ApolloClient({
    link: createApolloLink(),
    cache: createApolloCache(),
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'all',
        fetchPolicy: 'cache-first',
        nextFetchPolicy: 'cache-first',
      },
      query: {
        errorPolicy: 'all',
        fetchPolicy: 'cache-first',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
    queryDeduplication: true,
  });
}

export const apolloClient = createApolloClient();
