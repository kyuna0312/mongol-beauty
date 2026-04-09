import { setupServer } from 'msw/node';
import { graphqlHandlers } from './handlers';

export const mswServer = setupServer(...graphqlHandlers);
