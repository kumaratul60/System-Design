# HTTP Headers

A comprehensive guide to HTTP headers: from beginner basics to advanced techniques, including how they work, use cases, and real-world examples.

---

## Introduction to HTTP Headers

HTTP headers are metadata sent in HTTP requests and responses between clients (like browsers) and servers. They consist of key-value pairs that provide essential information for routing, security, content negotiation, caching, and performance optimization.

Headers are divided into:

- **Request Headers**: Sent by the client to the server (e.g., what content it accepts).
- **Response Headers**: Sent by the server to the client (e.g., caching instructions).

This guide progresses from beginner concepts to advanced implementations, ensuring a clear understanding of how headers power the web.

---

## Beginner Level: Understanding Headers

### What Are HTTP Headers?

Headers are like envelopes on a letter: they contain instructions and metadata about the message (the request or response body). Without headers, HTTP wouldn't know how to handle the data.

#### Request vs. Response Headers

- **Request Headers**: Information the client sends to the server.

  - Example: Telling the server what format you want back (`Accept: application/json`).

- **Response Headers**: Information the server sends back.
  - Example: Telling the browser how to cache the response (`Cache-Control: no-cache`).

#### How Headers Work in a Simple HTTP Request

1. **Client Sends Request**: Browser sends a GET request with headers like `Host` and `User-Agent`.
2. **Server Processes**: Server uses headers to decide how to respond.
3. **Server Responds**: Sends back data with response headers like `Content-Type`.

**Simple Example:**

Client Request:

```js
GET /api/users HTTP/1.1
Host: example.com
Accept: application/json
```

Server Response:

```js
HTTP/1.1 200 OK
Content-Type: application/json

{"users": []}
```

---

## Intermediate Level: Common Headers and Their Use Cases

### Identification and Routing

#### Host Header

- **Purpose**: Specifies the domain the request is targeting.
- **Why**: Enables virtual hosting (multiple websites on one server).
- **Use Case**: Routing traffic to the correct site.
- **Example**: `Host: api.example.com`

#### User-Agent Header

- **Purpose**: Identifies the client software (browser, OS, device).
- **Use Case**: Server-tailored responses, like mobile vs. desktop layouts.
- **Example**: `User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36`

### Security and Authentication

#### Authorization Header

- **Purpose**: Sends credentials for authentication.
- **Use Case**: API access with tokens.
- **Example**: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### Cookies: Set-Cookie (Response) and Cookie (Request)

- **Set-Cookie**: Server tells browser to store data.

  - **Use Case**: Session management.
  - **Example**: `Set-Cookie: sessionId=abc123; HttpOnly; Secure`

- **Cookie**: Browser sends stored data back.
  - **Use Case**: Maintaining login state.
  - **Example**: `Cookie: sessionId=abc123; preferences=dark-mode`

### Content Negotiation

#### Content-Type Header

- **Purpose**: Describes the format of the data in the body.
- **Use Case**: Ensuring correct parsing (e.g., JSON vs. XML).
- **Example**: `Content-Type: application/json`

#### Accept Header

- **Purpose**: Client's preferred response formats.
- **Use Case**: Content negotiation for APIs.
- **Example**: `Accept: application/json, text/html;q=0.9`

### Performance: Caching Basics

#### Cache-Control Header

- **Purpose**: Controls caching behavior.
- **Use Case**: Reducing server load by caching static assets.
- **Example**: `Cache-Control: public, max-age=3600` (cache for 1 hour)

#### ETag and If-None-Match

- **ETag**: Server sends a fingerprint of the resource.

  - **Example**: `ETag: "abc123"`

- **If-None-Match**: Client sends ETag to check if resource changed.
  - **Use Case**: Conditional requests to avoid re-downloading unchanged data.
  - **Example**: `If-None-Match: "abc123"` → Server responds 304 Not Modified if unchanged.

---

## Advanced Level: Optimization, Compression, and Security

### HTTP Compression Algorithms

Compression reduces data size for faster transfers, crucial for web performance.

#### Common Algorithms

- **Gzip**: Standard, low CPU cost, supported everywhere.
- **Brotli (br)**: More efficient (15-20% better than Gzip), best for modern browsers over HTTPS.
- **Deflate**: Legacy, rarely used now.

#### How Compression Works

1. **Client Announces Support**: `Accept-Encoding: gzip, br`
2. **Server Compresses**: Chooses algorithm, compresses body.
3. **Server Responds**: `Content-Encoding: br` + compressed data.
4. **Client Decompresses**: Automatically inflates and renders.

**Example Workflow:**

Request:

```
GET /styles.css HTTP/1.1
Accept-Encoding: gzip, deflate, br
```

Response:

```
HTTP/1.1 200 OK
Content-Encoding: br
Content-Type: text/css

[compressed CSS data]
```

**Implementation Tip**: Use server middleware (e.g., Express `compression()`) or CDN edge compression to offload CPU.

### Advanced Caching Strategies

- **Conditional Requests**: Use `If-Modified-Since` with timestamps for coarse checks.
- **Cache Busting**: Append version to URLs to force updates.
- **CDN Integration**: Headers like `X-Cache` indicate hit/miss.

### Security Headers

- **CORS Headers**: `Access-Control-Allow-Origin` for cross-origin requests.
- **Security Policies**: `Strict-Transport-Security` enforces HTTPS.
- **Custom Headers**: For API versioning (e.g., `X-API-Version: v2`).

### Developer Examples

#### Express.js with Compression

```javascript
const express = require('express');
const compression = require('compression');
const app = express();

app.use(compression({ level: 6 })); // Enable Brotli if available

app.get('/api/data', (req, res) => {
  res.set({
    'Cache-Control': 'public, max-age=300',
    ETag: '"unique-fingerprint"',
  });
  res.json({ data: 'example' });
});
```

#### Fetch API with Headers

```javascript
fetch('/api/protected', {
  headers: {
    Authorization: 'Bearer token',
    'Accept-Encoding': 'gzip, br', // Though usually automatic
    'If-None-Match': '"etag-value"',
  },
}).then((response) => {
  if (response.status === 304) {
    // Use cached version
  }
});
```

---

## Quick Reference Table

| Header            | Think of it as...      | Direction        | Purpose                                    |
| :---------------- | :--------------------- | :--------------- | :----------------------------------------- |
| **Host**          | "Where am I going?"    | Client to Server | Routing to the correct domain or CDN.      |
| **Origin**        | "Where did I start?"   | Client to Server | Security and CORS (Domain only).           |
| **Referer**       | "Which page sent me?"  | Client to Server | Analytics and Tracking (Full URL).         |
| **User-Agent**    | "Who/What am I?"       | Client to Server | Browser, OS, and Bot detection.            |
| **Authorization** | "Here is my ID."       | Client to Server | Passing JWTs or API keys.                  |
| **Cookie**        | "Remember me?"         | Client to Server | Sending saved session data back to server. |
| **Set-Cookie**    | "Store this for me."   | Server to Client | Instructing the browser to save a session. |
| **Accept**        | "What format I want"   | Client to Server | Content negotiation (e.g., JSON).          |
| **Content-Type**  | "What format this IS"  | Both Ways        | Describing the data in the current body.   |
| **Cache-Control** | "Save this for later." | Server to Client | Managing browser caching policies.         |
| **ETag**          | "File fingerprint."    | Server to Client | Version tracking for optimized caching.    |

---

## Key Distinctions

1. **Host vs. Origin:** Host specifies the target domain; Origin indicates the request's origin (for CORS).
2. **Accept vs. Content-Type:** Accept is what the client wants; Content-Type describes what's being sent.
3. **ETag vs. If-Modified-Since:** ETag uses a unique hash; If-Modified-Since uses timestamps.
4. **Cookie vs. Set-Cookie:** Set-Cookie instructs storage; Cookie sends stored data.

## Summary

- Routing? Use **Host**.
- Authentication? Use **Authorization**.
- Sessions? Use **Set-Cookie** and **Cookie**.
- Content format? Set **Content-Type**.
- Caching? Implement **Cache-Control**, **ETag**, **If-None-Match**.
- Compression? Enable **Accept-Encoding** and **Content-Encoding**.

- Need to route to a server? Use **Host**.
- Need to block a malicious site? Check **Origin**.
- Need to send a Token? Use **Authorization**.
- Need to handle JSON? Set **Content-Type**.
- Need better caching? Use **ETag** and **If-None-Match**.
- Need session persistence? Use **Set-Cookie** and **Cookie**.
