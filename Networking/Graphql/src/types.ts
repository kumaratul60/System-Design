/**
 * GraphQL schema
 * Defines what data can be queried
 */
export const typeDefs = `#graphql

  type Author{
    id: ID!
    name: String!
    books: [Book]
  }

  type Book {
    id: ID!
    title: String!
    publishedYear: Int
    author: Author
  }

  type Query {
    authors: [Author]
    books: [Book]
  }

  type Mutation{
    addBook(title:String!, authorId:ID!, publishedYear:Int):Book!
  }
`;
