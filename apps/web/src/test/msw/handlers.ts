import { http, HttpResponse } from 'msw';

/** Example handler — extend for integration tests (e.g. match `query GetMe`). */
export const graphqlHandlers = [
  http.post('*/graphql', async ({ request }) => {
    const body = (await request.json().catch(() => null)) as { query?: string } | null;
    if (body?.query?.includes('__typename')) {
      return HttpResponse.json({ data: { __typename: 'Query' } });
    }
    return HttpResponse.json({ data: null });
  }),
];
