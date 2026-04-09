import { describe, expect, it } from 'vitest';

describe('MSW GraphQL stub', () => {
  it('intercepts POST /graphql and returns JSON', async () => {
    const res = await fetch('https://example.test/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ __typename }' }),
    });
    expect(res.ok).toBe(true);
    const json = (await res.json()) as { data?: { __typename?: string } };
    expect(json.data?.__typename).toBe('Query');
  });
});
