import { ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
// @ts-expect-error apollo-upload-client ships without types
import { createUploadLink } from 'apollo-upload-client';

const graphqlUri =
  import.meta.env.VITE_GRAPHQL_URL ||
  (import.meta.env.DEV ? '/graphql' : 'http://localhost:4000/graphql');

export function createApolloLink(): ApolloLink {
  const uploadLink = createUploadLink({
    uri: graphqlUri,
    credentials: 'include',
  });

  const authLink = setContext((_, { headers }) => {
    const userToken = typeof window !== 'undefined' ? localStorage.getItem('user_token') : null;
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    const token =
      path.startsWith('/admin') && adminToken ? adminToken : userToken || adminToken;

    return {
      headers: {
        ...headers,
        ...(token && { authorization: `Bearer ${token}` }),
      },
    };
  });

  return authLink.concat(uploadLink);
}
