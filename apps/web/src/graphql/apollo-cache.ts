import { InMemoryCache, InMemoryCacheConfig } from '@apollo/client';

/**
 * Normalized cache policies for shop catalog (pagination, stable entity keys).
 */
export function createApolloCache(): InMemoryCache {
  const config: InMemoryCacheConfig = {
    typePolicies: {
      Query: {
        fields: {
          products: {
            keyArgs: ['categoryId'],
            merge(existing = [], incoming, { args }) {
              if (!args?.offset) {
                return incoming;
              }
              return [...existing, ...incoming];
            },
          },
        },
      },
      Product: {
        keyFields: ['id'],
      },
      Category: {
        keyFields: ['id'],
      },
    },
    resultCaching: true,
  };

  return new InMemoryCache(config);
}
