import { ApolloLink, HttpLink } from '@apollo/client';
// @ts-expect-error apollo-upload-client ships without types
import { createUploadLink } from 'apollo-upload-client';

const graphqlUri = import.meta.env.VITE_GRAPHQL_URL || '/graphql';

/** Standard JSON GraphQL — reliable variables for queries like GetProduct. */
const httpLink = new HttpLink({
  uri: graphqlUri,
  credentials: 'include',
});

/** Multipart only for mutations that send files (see CheckoutPage). */
const uploadLink = createUploadLink({
  uri: graphqlUri,
  credentials: 'include',
});

const splitLink = ApolloLink.split(
  (operation) => operation.operationName === 'UploadPaymentReceipt',
  uploadLink,
  httpLink,
);

export function createApolloLink(): ApolloLink {
  return splitLink;
}
