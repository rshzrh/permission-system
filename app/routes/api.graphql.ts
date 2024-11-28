import { createYoga } from 'graphql-yoga';
import { schema } from '~/graphql/schema';
import type { LoaderFunction, ActionFunction } from '@remix-run/node';

// Configure CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization'
};

export const loader: LoaderFunction = async ({ request }) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  const yoga = createYoga({
    schema,
    graphqlEndpoint: '/api/graphql',
    landingPage: false // Disable GraphiQL in production
  });

  const response = await yoga.handle(request);

  // Add CORS headers to response
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
};

export const action: ActionFunction = loader;