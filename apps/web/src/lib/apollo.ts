import { ApolloClient, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
// @ts-ignore - apollo-upload-client doesn't have types
import { createUploadLink } from 'apollo-upload-client';

// Use apollo-upload-client for file uploads
const uploadLink = createUploadLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql',
  credentials: 'include',
});

const authLink = setContext((_, { headers }) => {
  // Get user token (prefer user token over admin token for regular users)
  const userToken = typeof window !== 'undefined' ? localStorage.getItem('user_token') : null;
  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  const token = userToken || adminToken;
  
  return {
    headers: {
      ...headers,
      ...(token && { authorization: `Bearer ${token}` }),
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(uploadLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          products: {
            // Merge paginated results
            keyArgs: ['categoryId'],
            merge(existing = [], incoming, { args }) {
              // If no offset, replace existing
              if (!args?.offset) {
                return incoming;
              }
              // Otherwise merge
              return [...existing, ...incoming];
            },
          },
        },
      },
      Product: {
        // Cache products by ID
        keyFields: ['id'],
      },
      Category: {
        // Cache categories by ID
        keyFields: ['id'],
      },
    },
    // Optimize cache size
    resultCaching: true,
    // Note: addTypename is now automatic in Apollo Client v3.14+
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network', // Stale-while-revalidate
      nextFetchPolicy: 'cache-first', // Use cache for subsequent queries
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first', // Prefer cache
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
  // Enable query deduplication
  queryDeduplication: true,
});
