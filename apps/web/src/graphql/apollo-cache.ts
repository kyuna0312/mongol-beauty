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
          productsPaged: {
            keyArgs: ['categoryId', 'search'],
            merge(existing, incoming, { args }) {
              if (!args?.offset) {
                return incoming;
              }
              const existingItems = existing?.items ?? [];
              const incomingItems = incoming?.items ?? [];
              return {
                ...incoming,
                items: [...existingItems, ...incomingItems],
              };
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
