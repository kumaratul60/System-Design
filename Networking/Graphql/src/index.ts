// Core Apollo Server class (schema + execution engine)
import { ApolloServer, BaseContext } from '@apollo/server';

// Helper that boots an HTTP server (no Express setup needed here)
import { startStandaloneServer } from '@apollo/server/standalone';
import { resolvers } from './resolvers.js';
import { typeDefs } from './types.js';
/**
 * @apollo/server → GraphQL engine only
 * @apollo/server/standalone → opinionated HTTP bootstrap
 */

/**
 * Create Apollo Server instance
 * (pure GraphQL, no HTTP yet)
 */
// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
// });

const server = new ApolloServer<BaseContext>({
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
// graphql red copy as fetch put in console : {req}.then(res=>res.json()).then(data=>console.log(data))
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
