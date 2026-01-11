/**
 * GraphQL schema
 * Defines what data can be queried
 */
export const typeDefs = `#graphql

  type Author{
    id: ID!
    name: String!
  }

  type Book {
    id: ID!
    title: String!
    publishedYear: Int
  }

  type Query {
    authors: [Author]
    books: [Book]

  }
`;
