# GraphQL

## GraphQL: Graph Query Language

### What is GraphQL?

GraphQL is a query language for APIs and a runtime for executing those queries by using your existing data. It allows clients to request exactly the data they need, making data fetching more efficient and flexible than traditional REST APIs.

### Why GraphQL and Its Benefits?

1. **Avoid Over-Fetching**: Request only required fields, preventing unnecessary data transfer.
2. **Avoid Under-Fetching**: Fetch related data in a single request, eliminating multiple API calls.
3. **Better Mobile Performance**: Smaller payloads speed up data transfer on slow networks.
4. **Efficiency & Precision**: No wasted bandwidth; data matches exact needs.
5. **Declarative Data Fetching**: Client describes what is needed, server decides how to fetch.
6. **Structured/Hierarchical Responses**: Response mirrors UI structure naturally.
7. **Strongly Typed**: Every field has a defined type, ensuring data integrity.
8. **Introspection**: API can describe itself, enabling dynamic tooling.
9. **Real-Time Capabilities**: Built-in subscriptions for live updates.
10. **Mostly POST Requests**: All operations use HTTP POST by default (configurable).
11. **Flexible Response Size**: Client controls payload, unlike fixed REST responses.
12. **Single Endpoint**: All data fetching via `/graphql`.

### GraphQL Fundamentals

GraphQL has two main parts:

- **Creator (Server)**: Uses GraphQL server libraries to define schema and resolvers.
- **Consumer (Client)**: Uses fetch or GraphQL client libraries (Apollo, Relay, URQL) to query data.

**Five Pillars of GraphQL**:

1. Single Endpoint
2. Strongly Typed Schema
3. Declarative Queries
4. Hierarchical Data
5. Introspection

### REST vs GraphQL Comparison

| Aspect             | REST                          | GraphQL                       | Real-World Example                                                 |
| ------------------ | ----------------------------- | ----------------------------- | ------------------------------------------------------------------ |
| **Endpoints**      | Multiple (`/users`, `/posts`) | Single (`/graphql`)           | Fetching user with posts requires 2+ REST calls vs 1 GraphQL query |
| **Data Fetching**  | Fixed responses               | Client-controlled flexible    | Mobile app needs only user name, not full profile                  |
| **Over-Fetching**  | Common (extra fields)         | Eliminated                    | User profile page gets unnecessary bio field                       |
| **Under-Fetching** | Common (multiple requests)    | Eliminated                    | Dashboard widgets require separate API calls                       |
| **Response Size**  | Fixed                         | Variable, client-controlled   | Slow networks waste bandwidth on unused data                       |
| **Versioning**     | `/v1`, `/v2` painful          | Schema evolution, no versions | Frontend iterates without backend changes                          |
| **Schema**         | Optional, informal            | Mandatory, strongly typed     | Safer refactors, self-documenting                                  |
| **Real-time**      | Polling/WebSockets manual     | Built-in subscriptions        | Live chat, notifications                                           |
| **Caching**        | HTTP-based                    | Fine-grained (Apollo Cache)   | Complex query caching strategies                                   |
| **Tooling**        | Postman, Swagger              | GraphiQL, Apollo Studio       | Interactive query exploration                                      |
| **Error Handling** | HTTP status codes             | Structured errors + data      | Partial success with detailed errors                               |
| **Performance**    | Multiple round trips          | Single request, batched       | Reduced latency for complex data                                   |

### Why GraphQL?

- **Client-driven**: Clients specify data requirements declaratively
- **Single endpoint**: `/graphql` handles all operations
- **Strongly typed**: Schema ensures type safety
- **Hierarchical**: Matches UI data structures naturally
- **Real-time**: Built-in subscriptions for live updates

**Use Case**: Mobile apps fetching user profiles with posts and comments in one request, avoiding multiple REST calls.

---

## Core Concepts

### Schema Definition Language (SDL)

GraphQL schemas define available data types and operations using SDL.

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
}

type Query {
  users: [User!]!
  user(id: ID!): User
}

type Mutation {
  createPost(title: String!, content: String!): Post!
}
```

**Use Case**: E-commerce product catalog with variants and reviews.

### Queries, Mutations, and Subscriptions

GraphQL operations are typically sent via HTTP POST to the single `/graphql` endpoint.

- **Queries**: Read data declaratively
- **Mutations**: Modify data (CRUD operations)
- **Subscriptions**: Real-time data streams

```graphql
# Query
query GetUser($id: ID!) {
  user(id: $id) {
    name
    posts {
      title
    }
  }
}

# Mutation
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    title
  }
}

# Subscription
subscription OnPostCreated {
  postCreated {
    id
    title
    author {
      name
    }
  }
}
```

**Use Case**: Social media feed updates in real-time.

### Resolvers

Resolvers are functions that provide the logic for fetching or updating data for specific schema fields. They create a **one-to-one mapping** with whatever you define in your **schema/types**.
For instance, if you define `countries` in your Query type, you must provide a corresponding resolver function for it.

```javascript
const resolvers = {
  Query: {
    countries: (parent, args, context, info) => {
      return getCountries(); // Fetch data from DB or API
    },
  },
  Mutation: {
    addLanguage: (parent, args, context, info) => {
      return addLanguageToDB(args.id, args.name);
    },
  },
};
```

**Resolver Parameters**:

- **`parent`**: The result of the previous resolver in the execution chain (e.g., if resolving a country's capital, parent is the country object).
- **`args`**: Arguments provided by the client, such as filters or IDs.
  (e.g., `{ id: "1", name: "English" }`).
- **`context`**: Shared object across all resolvers in a request (e.g., authentication info, DB connections).
- **`info`**: Metadata about the query's execution state, including field paths and schema details.
  - **parent**: previous resolver’s return
  - **args**: query arguments
  - **context**: request-scoped shared state
  - **info**: GraphQL internals
  - **return**: data for this field (shape must match schema)

**Use Case**: Resolving user posts from a database.

### Context and Authentication

Shared object across resolvers for auth, DB connections.

```javascript
const context = ({ req }) => ({
  user: req.user, // From JWT middleware
  db: databaseConnection,
});
```

**Use Case**: Injecting authenticated user into all resolvers.

---

## More Depth

### Directives

Modify field behavior: `@deprecated`, `@include`, `@skip`, custom directives.

```graphql
type Query {
  users(active: Boolean): [User!]! @auth(requires: ADMIN)
}

directive @auth(requires: Role!) on FIELD_DEFINITION
```

**Use Case**: Conditional field exposure based on user roles.

### Custom Scalars

Define domain-specific types like `Date`, `Email`, `URL`.

```graphql
scalar Date
scalar Email

type User {
  email: Email!
  createdAt: Date!
}
```

**Use Case**: Type-safe date handling in APIs.

### Interfaces and Unions

Handle polymorphic data.

```graphql
interface Node {
  id: ID!
}

union SearchResult = User | Post

type Query {
  search(term: String!): [SearchResult!]!
}
```

**Use Case**: Search results mixing different entity types.

### Schema Stitching and Federation

Combine multiple schemas into one.

**Federation Example**:

```graphql
# Users subgraph
type User @key(fields: "id") {
  id: ID!
  name: String!
}

# Products subgraph
extend type User @key(fields: "id") {
  id: ID! @external
  purchasedProducts: [Product!]!
}
```

**Use Case**: Microservices architecture with distributed schemas.

### Error Handling

Structured errors with extensions.

```javascript
throw new GraphQLError('Invalid input', {
  extensions: {
    code: 'BAD_USER_INPUT',
    field: 'email',
  },
});
```

**Use Case**: Detailed validation feedback.

### Security Best Practices

- Input validation and sanitization
- Rate limiting and depth limiting
- Authentication via context
- Authorization in resolvers
- Persisted queries for production

**Use Case**: Protecting sensitive data fields.

### Performance Optimization

- **DataLoader**: Batch and cache database queries
- **Caching**: Apollo Cache, CDN integration
- **Persisted Queries**: Reduce query parsing overhead
- **Query Complexity Analysis**: Prevent expensive queries

**Use Case**: Avoiding N+1 query problems in nested data.

### Testing GraphQL APIs

- Unit test resolvers
- Integration test schemas
- Use test clients like Apollo's testing utilities

```javascript
import { graphql } from 'graphql';
import { schema } from './schema';

test('user query', async () => {
  const query = '{ user(id: "1") { name } }';
  const result = await graphql(schema, query);
  expect(result.data.user.name).toBe('John');
});
```

**Use Case**: Ensuring schema changes don't break clients.

---

## Real-World Use Cases & Examples

### E-commerce Platform

```graphql
query ProductDetails($id: ID!) {
  product(id: $id) {
    name
    price
    reviews {
      rating
      comment
      author {
        name
      }
    }
    relatedProducts {
      name
      price
    }
  }
}
```

**Benefit**: Single request for product page with all related data.

### Social Media Feed

```graphql
query UserFeed($userId: ID!, $limit: Int) {
  user(id: $userId) {
    feed(limit: $limit) {
      ... on Post {
        id
        content
        likes
      }
      ... on Advertisement {
        id
        title
        imageUrl
      }
    }
  }
}
```

**Benefit**: Polymorphic feed with posts and ads.

### CMS with Content Relations

```graphql
query ArticleWithComments($slug: String!) {
  article(slug: $slug) {
    title
    content
    author {
      name
      bio
    }
    comments {
      text
      author {
        name
      }
    }
  }
}
```

**Benefit**: Hierarchical content fetching.

### Real-World APIs

- **GitHub API**: Repository queries with issues, PRs, contributors
- **Shopify Admin API**: Product management with variants and inventory
- **Stripe API**: Payment processing with webhooks (subscription-like)

---

## GraphQL Refactoring & Migration

### Migrating from REST to GraphQL

1. **Analyze REST Endpoints**: Identify resources and relationships
2. **Design Schema**: Create types for entities, define queries/mutations
3. **Implement Resolvers**: Map REST calls to resolvers
4. **Handle Authentication**: Migrate auth middleware
5. **Update Clients**: Replace fetch calls with GraphQL queries
6. **Optimize**: Add DataLoader, caching

**Example Migration**:

```javascript
// REST
fetch('/api/users/1/posts')
  .then((res) => res.json())
  .then((posts) => console.log(posts));

// GraphQL
const query = `
  query {
    user(id: "1") {
      posts {
        title
      }
    }
  }
`;
```

### Schema Optimization Techniques

- **Denormalization**: Flatten deeply nested structures
- **Pagination**: Use `Connection` pattern for large datasets
- **Avoid Over-fetching**: Make fields optional
- **Schema Evolution**: Use `@deprecated` for gradual changes
- **Federation**: Split monolithic schemas into services

**Use Case**: Refactoring a bloated REST API into a lean GraphQL schema.

### Common Anti-patterns to Avoid

- Deep nesting without pagination
- Ignoring N+1 problems
- Exposing sensitive data without guards
- Hardcoding business logic in resolvers

---

## Tools & Ecosystem

### Server Libraries

- **Apollo Server**: Feature-rich, supports federation
- **GraphQL Yoga**: Lightweight, built on Express
- **Graphene**: Python library

### Client Libraries

- **Apollo Client**: Full-featured with caching
- **Relay**: Facebook's optimized client
- **URQL**: Lightweight and extensible

### Development Tools

- **GraphiQL/Playground**: Interactive query testing
- **Apollo Studio**: Schema management and monitoring
- **GraphQL Code Generator**: Generate types from schema

### Testing & Monitoring

- **Apollo Engine**: Performance monitoring
- **GraphQL Inspector**: Schema diffing
- **Jest + Testing Library**: Unit/integration tests

---

## Conclusion

GraphQL excels in scenarios requiring flexible, efficient data fetching across complex relationships. It shines in mobile apps, microservices, and rapidly evolving frontend. While not a silver bullet (avoid for simple CRUD or heavy caching needs), its type safety and client control make it powerful for modern APIs.

**Key Takeaway**: GraphQL shifts from endpoint-centric (REST) to data-centric architecture, enabling better alignment between frontend needs and backend capabilities.
