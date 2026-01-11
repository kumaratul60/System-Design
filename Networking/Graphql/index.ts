// Core Apollo Server class (schema + execution engine)
import { ApolloServer } from '@apollo/server';

// Helper that boots an HTTP server (no Express setup needed here)
import { startStandaloneServer } from '@apollo/server/standalone';
/**
 * @apollo/server → GraphQL engine only
 * @apollo/server/standalone → opinionated HTTP bootstrap
 */

/**
 * GraphQL schema
 * Defines what data can be queried
 */
const typeDefs = `#graphql
  type Book {
    title: String
    author: String
  }

  type Query {
    books: [Book]
  }
`;

/**
 * Mock data source
 */
const books = [
  { title: 'The Awakening', author: 'Kate Chopin' },
  { title: 'City of Glass', author: 'Paul Auster' },
];

/**
 * Resolvers
 * Map schema fields → actual data/functions
 */
const resolvers = {
  Query: {
    books: () => books,
  },
};

/**
 * Create Apollo Server instance
 * (pure GraphQL, no HTTP yet)
 */
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

/**
 * Start HTTP server
 * - creates Node HTTP server
 * - mounts Apollo as middleware
 * - listens on port 4000
 */
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀 Server ready at: ${url}`);

// ---------------------------------------------------------------------

/**
 * Server package checks:
 *
 * npm ls @apollo/server          // npm users
 * yarn why @apollo/server        // yarn users
 *
 * # direct (works even with "exports")
 * cat node_modules/@apollo/server/package.json | grep version
 *
 * # sanity: GraphQL engine present
 * npm ls graphql
 */
