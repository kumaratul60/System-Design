# REST API:

## Table of Contents

1. [Introduction to REST APIs](#introduction-to-rest-apis)
2. [Software Architecture Styles](#software-architecture-styles)
3. [HTTP Fundamentals](#http-fundamentals)
4. [REST Principles and Constraints](#rest-principles-and-constraints)
5. [HTTP Methods and Status Codes](#http-methods-and-status-codes)
6. [Resource Design Best Practices](#resource-design-best-practices)
7. [Data Formats and Content Negotiation](#data-formats-and-content-negotiation)
8. [API Versioning](#api-versioning)
9. [Pagination, Filtering, Sorting, and Searching](#pagination-filtering-sorting-and-searching)
10. [Authentication and Authorization](#authentication-and-authorization)
11. [Security Best Practices](#security-best-practices)
12. [Error Handling](#error-handling)
13. [Performance and Scalability](#performance-and-scalability)
14. [HATEOAS and Hypermedia](#hateoas-and-hypermedia)
15. [Idempotency](#idempotency)
16. [Testing REST APIs](#testing-rest-apis)
17. [API Documentation](#api-documentation)
18. [Tools and Frameworks](#tools-and-frameworks)
19. [Production Deployment Considerations](#production-deployment-considerations)
20. [Common Pitfalls and Best Practices](#common-pitfalls-and-best-practices)
21. [Conclusion](#conclusion)

---

## Introduction to REST APIs

**REST (Representational State Transfer)** is an architectural style for building web services. Think of it like a restaurant menu: the menu (API) lists dishes (resources) you can order, and the waiter (HTTP) delivers your request to the kitchen (server).

A REST API allows different applications to communicate over the internet using standard HTTP methods. It's like a universal language for software systems.

Key characteristics:

- **Stateless**: Each request is independent
- **Client-Server**: Separation between user interface and data storage
- **Cacheable**: Responses can be cached for better performance
- **Uniform Interface**: Consistent way to access resources

### Why REST APIs Matter

REST APIs power modern web and mobile applications, enabling microservices, cloud computing, and seamless integration between systems.

### Basic building block

```js
import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Sever created');
});

const PORT = 44986;
app.listen(PORT, () => {
  console.log(`Server is listening ${PORT}`);
});
```

---

## Software Architecture Styles

Before diving into REST, let's understand how applications are structured.

### 1-Tier (Monolithic) Architecture

```
┌─────────────────────────────┐
│        Application          │
│  ┌─────────┐ ┌────────────┐ │
│  │ Frontend│ │ Backend &  │ │
│  │         │ │ Database   │ │
│  └─────────┘ └────────────┘ │
└─────────────────────────────┘
```

Everything in one place: frontend, backend, and database.

**Example**: A simple PHP website with HTML, CSS, and database queries in the same files.

**Pros**: Easy to develop and deploy
**Cons**: Hard to scale, maintain, or update

### 2-Tier Architecture

```
┌─────────────┐     ┌─────────────┐
│   Frontend  │◄────►│   Backend  │
│ (Client)    │     │ (Server)    │
│             │     │ ┌─────────┐ │
│             │     │ │Database │ │
│             │     │ └─────────┘ │
└─────────────┘     └─────────────┘
```

Frontend and backend separated, communicating via HTTP.

**Example**: A React frontend calling a Node.js backend.

**Pros**: Better separation of concerns, independent scaling
**Cons**: Network latency, more infrastructure management

### 3-Tier Architecture (Recommended for REST APIs)

```
┌─────────────┐
│ Presentation│
│   Tier      │
│ (UI/Web App)│
└──────┬──────┘
       │ HTTP
┌──────▼──────┐
│ Application │
│   Tier      │
│ (API/Business│
│  Logic)     │
└──────┬──────┘
       │
┌──────▼──────┐
│   Data      │
│   Tier      │
│ (Database/  │
│  Storage)   │
└─────────────┘
```

Presentation → Application → Data layers.

1. **Presentation Tier**: User interfaces (web/mobile apps)
2. **Application Tier**: Business logic and APIs
3. **Data Tier**: Databases and storage systems

**Pros**: Highly scalable, secure, maintainable
**Cons**: More complex setup

---

## HTTP Fundamentals

HTTP (HyperText Transfer Protocol) is the foundation of REST APIs. It's the "language" computers use to communicate over the web.

### HTTP Request Structure

```
Method URL HTTP/Version
Headers
Body (optional)
```

**Example**:

```
GET /users HTTP/1.1
Host: api.example.com
Authorization: Bearer token123
```

### HTTP Response Structure

```
HTTP/Version Status-Code Reason-Phrase
Headers
Body
```

**Example**:

```
HTTP/1.1 200 OK
Content-Type: application/json

[{"id": 1, "name": "John"}]
```

---

## REST Principles and Constraints

REST isn't just about using HTTP; it follows specific principles to ensure scalability and reliability.

### The 6 Core Constraints

1. **Client-Server Separation**

   - UI and data logic are independent
   - Allows different teams to work on frontend/backend

2. **Statelessness**

   - Server doesn't store client state between requests
   - Each request contains all necessary information
   - Enables horizontal scaling and better fault tolerance

3. **Cacheability**

   - Responses must indicate if they can be cached
   - Improves performance and reduces server load

4. **Uniform Interface**

   - Consistent resource identification (URLs)
   - Consistent operations on resources
   - Makes APIs predictable and easy to use

5. **Layered System**

   - Client doesn't know if it's talking to the actual server or intermediaries (proxies, load balancers)
   - Enables scalability and security layers

6. **Code on Demand (Optional)**
   - Server can send executable code (JavaScript) to extend client functionality

---

## HTTP Methods and Status Codes

### HTTP Methods (CRUD Operations)

| Method  | Purpose                    | Idempotent | Safe | Example             |
| ------- | -------------------------- | ---------- | ---- | ------------------- |
| GET     | Retrieve data              | Yes        | Yes  | `GET /users`        |
| POST    | Create new resource        | No         | No   | `POST /users`       |
| PUT     | Replace entire resource    | Yes        | No   | `PUT /users/123`    |
| PATCH   | Partial update             | No         | No   | `PATCH /users/123`  |
| DELETE  | Remove resource            | Yes        | No   | `DELETE /users/123` |
| HEAD    | Get headers only           | Yes        | Yes  | `HEAD /users`       |
| OPTIONS | Describe available methods | Yes        | Yes  | `OPTIONS /users`    |

**Idempotent**: Multiple identical requests have the same effect as one.
**Safe**: Request doesn't modify server state.

**Notes**:

- **HEAD**: Useful for checking resource existence or metadata without transferring the body (e.g., checking file size before download).
- **OPTIONS**: Used for CORS preflight requests and API discovery, showing supported methods for a resource.

### HTTP Status Codes

#### 2xx Success

- **200 OK**: Request succeeded
- **201 Created**: Resource created successfully
- **204 No Content**: Success but no response body

#### 3xx Redirection

- **301 Moved Permanently**: Resource moved to new URL
- **302 Found**: Temporary redirect
- **304 Not Modified**: Resource not changed (caching)

#### 4xx Client Errors

- **400 Bad Request**: Invalid request syntax
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Request conflicts with current state
- **422 Unprocessable Entity**: Validation failed
- **429 Too Many Requests**: Rate limit exceeded

#### 5xx Server Errors

- **500 Internal Server Error**: Unexpected server error
- **502 Bad Gateway**: Invalid response from upstream server
- **503 Service Unavailable**: Server temporarily down
- **504 Gateway Timeout**: Server didn't respond in time

---

## Resource Design Best Practices

Resources are the "nouns" of your API. Good resource design makes APIs intuitive.

### Naming Conventions

- **Use nouns, not verbs**: `/users` not `/getUsers`
- **Use plural names**: `/users` not `/user`
- **Use lowercase and hyphens**: `/user-profiles` not `/user_profiles`
- **Be consistent**: Don't mix `/users` and `/Customers`

### Resource Examples

```
/users              # Collection of users
/users/123          # Specific user
/users/123/posts    # User's posts (nested resource)
/posts?user_id=123  # Alternative to nesting
```

### Sub-resources and Relationships

- Use nesting for strong relationships: `/users/123/orders`
- Use query parameters for weak relationships: `/orders?user_id=123`

### Actions on Resources

For non-CRUD operations, use:

- Custom methods: `POST /users/123/activate`
- Sub-resources: `PUT /users/123/status` with body `{"active": true}`

---

## Data Formats and Content Negotiation

### Common Data Formats

#### JSON (JavaScript Object Notation) - Most Popular

Lightweight, human-readable, widely supported.

```json
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2023-01-15T10:30:00Z",
  "active": true
}
```

#### XML - Legacy Support

Verbose but structured.

```xml
<user>
  <id>123</id>
  <name>John Doe</name>
  <email>john@example.com</email>
</user>
```

#### Other Formats

- **YAML**: Human-readable configuration
- **CSV**: For tabular data
- **Protocol Buffers**: High performance, but less readable

### Content Negotiation and HTTP Headers

Content negotiation allows clients and servers to agree on data formats. This is crucial for REST APIs that need to support multiple formats or versions.

#### Key HTTP Headers

**Accept Header** (Request):

- Used by clients to specify preferred response format
- Server responds in the best matching format it supports
- Multiple formats can be listed with quality values

```
Accept: application/json, application/xml;q=0.8
Accept: application/vnd.myapi.v1+json  # Version-specific media type
```

**Content-Type Header** (Request/Response):

- Indicates the format of the message body
- Required for requests with bodies (POST, PUT, PATCH)
- Server sets this in responses to indicate actual format

```
Content-Type: application/json  # Standard JSON
Content-Type: application/xml   # XML format
Content-Type: application/x-www-form-urlencoded  # Form data
Content-Type: multipart/form-data  # File uploads
```

#### When to Use Different Content Types

| Content-Type                        | When to Use                                 | Example Use Case                |
| ----------------------------------- | ------------------------------------------- | ------------------------------- |
| `application/json`                  | Most common - sending/receiving JSON data   | Standard API requests/responses |
| `application/xml`                   | Legacy systems or specific XML requirements | Enterprise integrations         |
| `application/x-www-form-urlencoded` | HTML form submissions                       | Traditional web forms           |
| `multipart/form-data`               | File uploads with additional fields         | Image/file uploads              |
| `text/plain`                        | Plain text data                             | Simple string responses         |
| `application/vnd.api+json`          | JSON API specification                      | Structured JSON responses       |
| `application/hal+json`              | HAL (Hypertext Application Language)        | HATEOAS-compliant responses     |

#### Content Negotiation Flow

1. **Client Request**:

   ```
   POST /users
   Accept: application/json
   Content-Type: application/json

   {"name": "John", "email": "john@example.com"}
   ```

2. **Server Response**:

   ```
   201 Created
   Content-Type: application/json

   {"id": 123, "name": "John", "email": "john@example.com"}
   ```

#### Best Practices

- **Always specify Content-Type** for requests with bodies
- **Use Accept** to request specific formats when needed
- **Default to application/json** for modern APIs
- **Document supported content types** in your API documentation
- **Handle unsupported formats gracefully** with appropriate HTTP status codes

---

## API Versioning

Versioning prevents breaking changes for existing clients.

### Versioning Strategies

#### URI Versioning (Most Common)

Include version in URL path.

```
/api/v1/users
/api/v2/users
```

**Pros**: Clear, cacheable
**Cons**: URL pollution

#### Header Versioning

Use custom headers.

```
Accept: application/vnd.myapi.v1+json
```

**Pros**: Clean URLs
**Cons**: Less visible

#### Query Parameter Versioning

```
/users?version=1
```

**Pros**: Flexible
**Cons**: Caching issues

#### Media Type Versioning

```
Accept: application/vnd.myapi.v1+json
```

### Best Practices

- Start with v1
- Deprecate old versions gradually
- Document version differences
- Use semantic versioning (major.minor.patch)

---

## Authentication and Authorization

### Authentication vs Authorization

- **Authentication**: Who are you? (Identity verification)
- **Authorization**: What can you do? (Permissions)

### Common Authentication Methods

#### API Keys

Simple shared secret.

```
X-API-Key: abc123def456
```

**Pros**: Simple
**Cons**: Less secure, hard to revoke per user

#### Basic Authentication

Username:password encoded in base64.

```
Authorization: Basic dXNlcjpwYXNz
```

**Pros**: Built-in HTTP support
**Cons**: Credentials sent with every request

#### JWT (JSON Web Tokens) - Most Popular

Stateless, self-contained tokens.

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Structure**:

- **Header**: Algorithm and token type
- **Payload**: User info and claims
- **Signature**: Verifies token integrity

**Pros**: Stateless, scalable, flexible
**Cons**: Token size, harder to revoke immediately

#### OAuth 2.0

Delegated access framework.

**Flow Types**:

- Authorization Code (Web apps)
- Implicit (Single-page apps)
- Client Credentials (Service-to-service)
- Resource Owner Password (Legacy)

### Authorization Patterns

#### Role-Based Access Control (RBAC)

Users have roles with permissions.

```json
{
  "user_id": 123,
  "roles": ["admin", "editor"],
  "permissions": ["read", "write", "delete"]
}
```

#### Attribute-Based Access Control (ABAC)

Fine-grained permissions based on attributes.

#### API Gateway Pattern

Central authorization point for microservices.

---

## Security Best Practices

API security is critical. Follow the [OWASP API Security Top 10](https://owasp.org/www-project-api-security/) guidelines to protect against common vulnerabilities like injection, authentication failures, and excessive data exposure.

### Transport Security

- **Always use HTTPS**: Encrypt all traffic
- **Certificate pinning**: Prevent MITM attacks
- **HSTS**: Force HTTPS connections

### Input Validation

- Validate all inputs on server side
- Use schema validation (JSON Schema, OpenAPI)
- Sanitize inputs to prevent injection attacks

### Rate Limiting

Protect against abuse and DoS attacks.

**Strategies**:

- Fixed window: 1000 requests per hour
- Sliding window: More granular
- Token bucket: Smooth rate limiting

**Implementation**:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 750
X-RateLimit-Reset: 1640995200
```

### CORS (Cross-Origin Resource Sharing)

Control which domains can access your API.

```javascript
// Server response headers
Access-Control-Allow-Origin: https://trusted-domain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
```

### Security Headers

```
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

### Data Protection

- Encrypt sensitive data at rest
- Use secure random generators for tokens
- Implement proper session management
- Log security events without exposing sensitive data

---

## Error Handling

Consistent, informative error responses.

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email",
      "reason": "Must be valid email address"
    },
    "timestamp": "2023-01-15T10:30:00Z",
    "request_id": "abc-123-def",
    "path": "/users",
    "suggestions": ["Use format: user@example.com"]
  }
}
```

### Error Code Standards

- Use consistent error codes across your API
- Document all possible errors
- Include actionable suggestions

### HTTP Status Code Mapping

- 400: Validation errors
- 401: Authentication required
- 403: Insufficient permissions
- 404: Resource not found
- 409: Conflicts (duplicate, etc.)
- 422: Business logic violations
- 429: Rate limit exceeded

---

## Performance and Scalability

### Caching Strategies

#### HTTP Caching

Use standard HTTP headers.

```
Cache-Control: max-age=300, public
ETag: "abc123"
Last-Modified: Mon, 15 Jan 2023 10:30:00 GMT
```

#### Application-Level Caching

- Redis for session data
- CDN for static assets
- In-memory caches for frequently accessed data

### Compression

Reduce payload size.

```
Accept-Encoding: gzip, deflate
Content-Encoding: gzip
```

### Database Optimization

- Use indexes appropriately
- Implement connection pooling
- Use read replicas for scaling reads
- Consider NoSQL for specific use cases

### Load Balancing

Distribute traffic across multiple servers.

**Algorithms**:

- Round Robin
- Least Connections
- IP Hash (for session affinity)

### Horizontal Scaling

- Stateless design enables easy scaling
- Use container orchestration (Kubernetes)
- Implement auto-scaling based on metrics

### Monitoring and Metrics

- Response times
- Error rates
- Throughput
- Resource utilization

---

## HATEOAS and Hypermedia

**HATEOAS (Hypertext As The Engine Of Application State)** makes APIs self-discoverable.

Instead of hardcoded URLs, include links in responses.

```json
{
  "id": 123,
  "name": "John Doe",
  "status": "active",
  "_links": {
    "self": {
      "href": "/users/123"
    },
    "orders": {
      "href": "/users/123/orders"
    },
    "deactivate": {
      "href": "/users/123/deactivate",
      "method": "POST"
    }
  }
}
```

**Benefits**:

- API evolution without breaking clients
- Self-documenting APIs
- Enables API exploration

**Implementation**:

- Use link relations (rel attribute)
- Follow standards like HAL or JSON API

---

## Idempotency

**Idempotency** means multiple identical requests have the same effect as one.

**Important for**:

- Network retries
- Duplicate submissions
- Distributed systems

### Implementing Idempotency

Use idempotency keys.

```
Idempotency-Key: abc-123-def
```

Server stores key and result, returns cached result for duplicate keys.

**Idempotent Methods**:

- GET, PUT, DELETE (by design)
- POST (requires implementation)

---

## Testing REST APIs

### Testing Pyramid

A balanced testing strategy follows the testing pyramid:

1. **Unit Tests**: Test individual functions and modules
2. **Integration Tests**: Test API endpoints and interactions
3. **Contract Tests**: Ensure API contracts are met between services
4. **End-to-End Tests**: Full user workflows from client to server

### Manual Testing

#### GUI Tools

- **Postman**: Feature-rich API testing and collaboration
- **Insomnia**: Lightweight alternative with similar features

**Example Request in Postman**:

```
GET https://api.example.com/users
Authorization: Bearer token123
Content-Type: application/json
```

#### Command-Line Testing

**curl** for quick testing:

```bash
curl -X GET https://api.example.com/users \
  -H "Authorization: Bearer token123" \
  -H "Content-Type: application/json"
```

### Automated Testing

#### JavaScript/Node.js

```javascript
// Using Jest and Supertest
const request = require('supertest');
const app = require('../app');

describe('GET /users', () => {
  it('should return all users', async () => {
    const response = await request(app).get('/users').expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

#### Python

```python
# Using pytest and requests
import requests
import pytest

def test_get_users():
    response = requests.get('http://localhost:3000/users')
    assert response.status_code == 200
    data = response.json()
    assert data['success'] == True
    assert isinstance(data['data'], list)
```

#### Java

```java
// Using RestAssured
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

@Test
public void testGetUsers() {
    given()
        .when()
            .get("/users")
        .then()
            .statusCode(200)
            .body("success", equalTo(true))
            .body("data", hasSize(greaterThan(0)));
}
```

### Test Categories

#### Positive Tests

- Valid requests return expected responses
- All HTTP status codes work correctly
- Data is properly formatted and validated

#### Negative Tests

- Invalid inputs return appropriate error responses
- Authentication/authorization failures are handled
- Rate limiting and security measures work

#### Edge Cases

- Empty result sets
- Large payloads and pagination
- Special characters in data
- Concurrent requests and race conditions

---

## API Documentation

Good documentation is crucial for API adoption.

### OpenAPI Specification (Swagger)

Standard for describing REST APIs.

```yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
paths:
  /users:
    get:
      summary: Get all users
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
```

### Documentation Best Practices

- Keep docs up-to-date with code
- Include examples for every endpoint
- Document error responses
- Provide getting started guides
- Use interactive documentation (Swagger UI)

### Tools

- **Swagger/OpenAPI**: Specification and tools
- **Redoc**: Beautiful documentation renderer
- **Stoplight**: Design and documentation platform

---

## Tools and Frameworks

### Backend Frameworks

#### Node.js

- **Express.js**: Minimalist, flexible
- **Fastify**: High performance, built-in validation
- **NestJS**: Enterprise-grade, TypeScript-first

#### Python

- **Flask**: Simple and extensible, great for small APIs
- **Django REST Framework**: Feature-rich, built-in admin and serialization
- **FastAPI**: Modern, async-first, automatic OpenAPI docs

#### Java

- **Spring Boot**: Enterprise standard with extensive ecosystem
- **Jersey**: JAX-RS implementation for RESTful services
- **Micronaut**: Modern, cloud-native framework

#### Go

- **Gin**: High performance, middleware support
- **Echo**: Minimalist, inspired by Express.js
- **Fiber**: Fast, Express.js-style framework

### API Gateways

- **Kong**: Open-source, plugin-based
- **Apigee**: Enterprise-grade
- **AWS API Gateway**: Cloud-native

### Development Tools

- **Postman**: API testing and documentation
- **Insomnia**: Alternative to Postman
- **Hoppscotch**: Web-based API testing

---

## Building Your First REST API Server

Let's build a simple REST API server using Node.js and Express.js. This example creates a basic user management API with CRUD operations.

### Prerequisites

- Node.js installed (version 14 or higher)
- npm (comes with Node.js)

### Step 1: Set Up the Project

Create a new directory and initialize the project:

```bash
mkdir simple-api
cd simple-api
npm init -y
```

Install dependencies:

```bash
npm install express body-parser
```

### Step 2: Create package.json (Basic)

```json
{
  "name": "simple-api",
  "version": "1.0.0",
  "description": "A simple REST API example",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js" // For development, consider nodemon
  },
  "dependencies": {
    "express": "^4.18.2",
    "body-parser": "^1.20.2"
  }
}
```

### Step 3: Create server.js with Routes

```javascript
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json()); // Parse JSON bodies
app.use(express.json()); // Alternative to body-parser (Express 4.16+)

// In-memory data store (for demo purposes)
let users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
];

// Helper function to get next ID
let nextId = 3;

// Routes

// GET /users - Get all users
app.get('/users', (req, res) => {
  res.json({
    success: true,
    data: users,
    count: users.length,
  });
});

// GET /users/:id - Get a specific user
app.get('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  res.json({
    success: true,
    data: user,
  });
});

// POST /users - Create a new user
app.post('/users', (req, res) => {
  const { name, email } = req.body;

  // Basic validation
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      error: 'Name and email are required',
    });
  }

  const newUser = {
    id: nextId++,
    name,
    email,
  };

  users.push(newUser);

  res.status(201).json({
    success: true,
    data: newUser,
  });
});

// PUT /users/:id - Update a user completely
app.put('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, email } = req.body;

  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  // Basic validation
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      error: 'Name and email are required',
    });
  }

  users[userIndex] = { id: userId, name, email };

  res.json({
    success: true,
    data: users[userIndex],
  });
});

// PATCH /users/:id - Update a user partially
app.patch('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const updates = req.body;

  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  // Apply partial updates
  users[userIndex] = { ...users[userIndex], ...updates };

  res.json({
    success: true,
    data: users[userIndex],
  });
});

// DELETE /users/:id - Delete a user
app.delete('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }

  const deletedUser = users.splice(userIndex, 1)[0];

  res.json({
    success: true,
    data: deletedUser,
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### Step 4: Run the Server

```bash
npm start
```

The server will start on http://localhost:3000.

### Testing the API

Use curl or Postman to test:

```bash
# Get all users
curl http://localhost:3000/users

# Get specific user
curl http://localhost:3000/users/1

# Create new user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Bob Wilson", "email": "bob@example.com"}'

# Update user
curl -X PUT http://localhost:3000/users/3 \
  -H "Content-Type: application/json" \
  -d '{"name": "Bob Wilson Updated", "email": "bob.updated@example.com"}'

# Delete user
curl -X DELETE http://localhost:3000/users/3

# Health check
curl http://localhost:3000/health
```

### Explanation

This basic server demonstrates:

- **Routes**: Different endpoints for CRUD operations
- **HTTP Methods**: GET, POST, PUT, PATCH, DELETE
- **Status Codes**: 200, 201, 400, 404, 500
- **Middleware**: Body parsing and error handling
- **JSON Responses**: Consistent response format
- **Basic Validation**: Input checking
- **In-memory Storage**: Simple data persistence (replace with database for production)

### Next Steps

- Add a database (MongoDB, PostgreSQL)
- Implement authentication (JWT)
- Add input validation (Joi, express-validator)
- Add logging (Winston)
- Add rate limiting
- Add CORS support

This example provides a solid foundation for building more complex REST APIs.

---

## Common Pitfalls and Best Practices

### Common Mistakes

- Inconsistent resource naming
- Ignoring HTTP semantics
- Poor error handling
- Lack of versioning strategy
- Inadequate security measures
- Ignoring performance optimization

### Best Practices Checklist

- [ ] Use consistent naming conventions
- [ ] Implement proper HTTP status codes
- [ ] Provide comprehensive error responses
- [ ] Version your APIs
- [ ] Implement authentication and authorization
- [ ] Use HTTPS everywhere
- [ ] Implement rate limiting
- [ ] Add comprehensive logging
- [ ] Write automated tests
- [ ] Keep documentation updated
- [ ] Monitor performance metrics
- [ ] Plan for scalability
- [ ] Implement proper caching
- [ ] Use idempotency for critical operations
- [ ] Validate all inputs
- [ ] Handle CORS properly

### Design Principles

- **Keep it Simple**: Start with basic functionality
- **Be Consistent**: Follow patterns throughout
- **Think About Clients**: Design for ease of use
- **Plan for Change**: Make evolution easy
- **Security First**: Never compromise on security

---

## Conclusion

Building great REST APIs requires understanding both the technical details and the principles that make them maintainable and scalable. Start with the basics, implement best practices, and continuously improve based on real-world usage and feedback.

Remember: A good API is like a good waiter - attentive, reliable, and invisible when everything works perfectly.

### Further Reading

- [RESTful Web APIs](https://www.amazon.com/RESTful-Web-APIs-Leonard-Richardson/dp/1449358063) - Comprehensive guide to REST design
- [API Design Patterns](https://www.amazon.com/API-Design-Patterns-JJ-Geewax/dp/161729585X) - Practical patterns for API development
- [Designing APIs with Swagger and OpenAPI](https://www.manning.com/books/designing-apis-with-swagger-and-openapi) - API documentation best practices
- [HTTP/2 specification](https://http2.github.io/) - Official HTTP/2 specs
- [OpenAPI specification](https://swagger.io/specification/) - API description format
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/) - Security best practices
- [REST API Tutorial](https://restapitutorial.com/) - Interactive REST learning
- [JSON:API specification](https://jsonapi.org/) - Standardized JSON API format

---

## Glossary

**API (Application Programming Interface)**: A set of rules and protocols for accessing a software application or service.

**Client-Server Architecture**: A model where clients request services from servers, separating concerns for scalability.

**CRUD (Create, Read, Update, Delete)**: The four basic operations for persistent storage.

**HATEOAS (Hypertext As The Engine Of Application State)**: A constraint that allows clients to navigate the API dynamically through hyperlinks.

**HTTP (HyperText Transfer Protocol)**: The protocol used for transferring data over the web.

**Idempotent**: An operation that produces the same result regardless of how many times it's executed.

**JSON (JavaScript Object Notation)**: A lightweight data interchange format.

**JWT (JSON Web Token)**: A compact, URL-safe means of representing claims between parties.

**Middleware**: Software that acts as a bridge between applications, often handling cross-cutting concerns like authentication or logging.

**REST (Representational State Transfer)**: An architectural style for designing networked applications.

**Stateless**: A system where each request contains all necessary information, with no server-side session storage.

**URI (Uniform Resource Identifier)**: A string of characters that identifies a resource on the internet.
