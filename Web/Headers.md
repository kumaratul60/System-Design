# HTTP Headers and Status Codes

A comprehensive guide to HTTP headers and status codes: from beginner basics to advanced techniques, including how they work, use cases, and real-world examples.

## Table of Contents

- [Introduction to HTTP Headers](#introduction-to-http-headers)
- [Beginner Level: Understanding Headers](#beginner-level-understanding-headers)
- [Intermediate Level: Common Headers and Their Use Cases](#intermediate-level-common-headers-and-their-use-cases)
- [Advanced Level: Optimization, Compression, and Security](#advanced-level-optimization-compression-and-security)
- [Quick Comparison: Request vs. Response Headers](#quick-comparison-request-vs-response-headers)
- [Key Distinctions](#key-distinctions)
- [HTTP Status Codes](#http-status-codes)
- [Summary: Headers and Status Codes Quick Reference](#summary-headers-and-status-codes-quick-reference)

---

## 🗺️ Headers & Status Landscape

```mermaid
mindmap
  root((Headers & Status))
    Request Headers
      Identification (Host, User-Agent)
      Security (Authorization, Cookie)
      Content Negotiation (Accept)
      Conditions (If-None-Match)
    Response Headers
      Payload (Content-Type, Encoding)
      Caching (Cache-Control, ETag)
      Security (HSTS, CSP, CORS)
      State (Set-Cookie)
    Status Codes
      1xx Informational (Switching)
      2xx Success (OK, Created, No Content)
      3xx Redirects (Moved, Not Modified)
      4xx Client Errors (Bad Req, Unauth, Not Found)
      5xx Server Errors (Internal, Gateway)
    Optimization
      Gzip & Brotli
      Conditional Requests
      Range Requests
```

---

## Introduction to HTTP Headers

HTTP headers are metadata sent in HTTP requests and responses between clients (like browsers) and servers. They consist of key-value pairs that provide essential information for routing, security, content negotiation, caching, and performance optimization.

Headers are divided into:

- **Request Headers**: Sent by the client to the server (e.g., what content it accepts).
- **Response Headers**: Sent by the server to the client (e.g., caching instructions).

This guide progresses from beginner concepts to advanced implementations, ensuring a clear understanding of how headers power the web.

### Graphical Representation: HTTP Request-Response Flow

```mermaid
flowchart TD
    Client[Client/Browser] -->|Sends Request with Headers| Server[Server/CDN]
    Server -->|Processes Request| Logic[Business Logic]
    Logic -->|Generates Response with Headers| Client
    Client -->|Renders/Processes Response| End[End]

    subgraph Request Headers
        RH1[Host]
        RH2[User-Agent]
        RH3[Accept]
        RH4[Authorization]
    end

    subgraph Response Headers
        SH1[Content-Type]
        SH2[Cache-Control]
        SH3[Set-Cookie]
        SH4[ETag]
    end

    Client -.-> RH1
    Server -.-> SH1
```

This diagram illustrates the flow of headers in an HTTP transaction.

#### Detailed HTTP Flow Diagram

```mermaid
sequenceDiagram
    participant B as Browser / Client
    participant S as Server / CDN

    Note over B,S: 1️⃣ HTTP Request
    B->>S: GET /api (Host, Origin, Accept, Authorization, Cookie, If-None-Match)
    Note over S: Auth Check
    Note over S: Cache Lookup
    Note over S: Business Logic
    Note over B,S: 2️⃣ HTTP Response
    S-->>B: 200 OK (Content-Type, Content-Encoding, Cache-Control, ETag, Set-Cookie)
```

---

```mermaid
flowchart LR
    B[Browser / Client]

    subgraph Request["1️⃣ HTTP Request"]
        R1[Host]
        R2[Origin]
        R3[Accept]
        R4[Authorization]
        R5[Cookie]
        R6[If-None-Match / If-Modified-Since]
    end

    subgraph Server["CDN / Cache / Server"]
        S1[Auth Check]
        S2[Cache Lookup]
        S3[Business Logic]
    end

    subgraph Response["2️⃣ HTTP Response"]
        P1[Status: 200 / 304 / 401]
        P2[Content-Type]
        P3[Content-Encoding]
        P4[Cache-Control]
        P5[ETag / Last-Modified]
        P6[Set-Cookie]
    end

    B -->|Request| R1
    R1 --> Server
    Server -->|Processing| S1
    S1 --> S2 --> S3
    S3 -->|Response| P1
    P1 --> B

```

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

### Key Response Headers

Response headers provide metadata from the server back to the client, controlling caching, security, content delivery, and more.

#### Content-Type (Response)

- **Purpose**: Specifies the media type of the response body.
- **Example**: `Content-Type: application/json`
- **Use Case**: Ensures client parses data correctly.

#### Content-Length (Response)

- **Purpose**: Size of the response body in bytes.
- **Example**: `Content-Length: 1024`
- **Use Case**: Helps clients know when data transfer is complete.

#### Content-Encoding (Response)

- **Purpose**: Indicates compression applied (matches client's Accept-Encoding).
- **Example**: `Content-Encoding: gzip`
- **Use Case**: Enables decompression for faster transfers.

#### Cache-Control (Response)

- **Purpose**: Defines caching directives for browsers/CDNs.
- **Example**: `Cache-Control: no-cache, no-store`
- **Use Case**: Optimizes performance by controlling what gets cached.

#### ETag (Response)

- **Purpose**: Unique identifier for resource version.
- **Example**: `ETag: "abc123"`
- **Use Case**: Efficient caching with conditional requests.

#### Set-Cookie (Response)

- **Purpose**: Instructs browser to store cookies.
- **Example**: `Set-Cookie: sessionId=xyz; HttpOnly; Secure`
- **Use Case**: Maintains state across requests.

#### Other Important Response Headers

- **Last-Modified**: Timestamp of last resource change (works with If-Modified-Since).
- **Expires**: Absolute cache expiry time (legacy).
- **Server**: Identifies server software (often omitted for security).
- **Date**: Response generation time in UTC.
- **Strict-Transport-Security (HSTS)**: Forces HTTPS.
- **Access-Control-Allow-Origin**: Enables CORS.

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

## 🔒 Advanced "Spectre-Level" Security Headers

In the wake of CPU vulnerabilities like Spectre, browsers introduced headers to isolate your site's process from others.

| Header   | Full Name                    | Purpose                                                                                           |
| :------- | :--------------------------- | :------------------------------------------------------------------------------------------------ |
| **COOP** | Cross-Origin-Opener-Policy   | Prevents a malicious site from opening your site in a popup and accessing your `window` object.   |
| **COEP** | Cross-Origin-Embedder-Policy | Prevents your site from loading any cross-origin resources that don't explicitly opt-in via CORP. |
| **CORP** | Cross-Origin-Resource-Policy | Allows a resource (image/script) to tell the browser: "I can only be loaded by my own origin."    |

---

## 🔥 Senior/Staff Level "Grill" Questions

### Q1: What is the `Vary` header and why is it called the "Cache Killer"?

> **Answer:** The `Vary` header tells a cache (CDN or Browser) which request headers should be used to create a unique cache key.
>
> - **The Problem:** If you set `Vary: User-Agent`, the CDN will create a separate cached version for _every single browser version_ in existence. This effectively kills your "Cache Hit Ratio."
> - **Best Practice:** Only use `Vary` for highly specific dimensions like `Accept-Encoding` or `Accept` (for WebP support).

### Q2: Why is the `Connection: keep-alive` header both a blessing and a curse?

> **Answer:**
>
> - **Blessing:** It allows multiple HTTP requests over a single TCP connection, avoiding the overhead of the 3-way handshake for every file.
> - **Curse:** In a high-traffic system, "holding" thousands of idle TCP connections consumes significant server memory. Furthermore, it makes **L4 Load Balancing** difficult, as one client is "stuck" to one backend server until the connection closes.

### Q3: How does the `Strict-Transport-Security` (HSTS) "Preload" list work?

> **Answer:** Normally, the first time a user visits your site, they might use `http://`, and only _then_ receive the HSTS header to switch to `https://`. This first request is a window for a **Man-in-the-Middle (MitM)** attack.
>
> - **The Solution:** By adding the `preload` directive and submitting your domain to the **HSTS Preload List** (managed by Google), the browser comes "pre-configured" to never use HTTP for your domain, even on the very first visit.
> - **The Risk:** If you lose your SSL certificate or need to roll back to HTTP, your site will be **permanently inaccessible** to users until the browser vendor updates their hardcoded list.

### Q4: Explain the `X-Content-Type-Options: nosniff` header.

> **Answer:** Browsers have a feature called "MIME Sniffing" where they try to "guess" the content type of a file if it's missing or looks wrong.
>
> - **The Attack:** An attacker uploads a malicious script disguised as an image (`avatar.jpg`). If the browser "sniffs" the file and sees it's actually JS, it might execute it.
> - **The Defense:** `nosniff` forces the browser to strictly follow the `Content-Type` header sent by the server. If the server says it's an image, the browser treats it as an image, period.

---

## Request headers express intent and capability, response headers express facts and policy.

## Quick Comparison: Request vs. Response Headers

### Request Headers (Client → Server)

| Header              | Think of it as...     | Purpose                                    |
| :------------------ | :-------------------- | :----------------------------------------- |
| **Host**            | "Where am I going?"   | Routing to the correct domain or CDN.      |
| **Origin**          | "Where did I start?"  | Security and CORS (Domain only).           |
| **Referer**         | "Which page sent me?" | Analytics and Tracking (Full URL).         |
| **User-Agent**      | "Who/What am I?"      | Browser, OS, and Bot detection.            |
| **Authorization**   | "Here is my ID."      | Passing JWTs or API keys.                  |
| **Cookie**          | "Remember me?"        | Sending saved session data back to server. |
| **Accept**          | "What format I want?" | Content negotiation (e.g., JSON).          |
| **Accept-Encoding** | "How compressed?"     | Supported compression algorithms.          |
| **If-None-Match**   | "Has it changed?"     | Conditional requests for caching.          |

### Response Headers (Server → Client)

| Header                        | Think of it as...      | Purpose                                    |
| :---------------------------- | :--------------------- | :----------------------------------------- |
| **Set-Cookie**                | "Store this for me."   | Instructing the browser to save a session. |
| **Content-Type**              | "What format this IS"  | Describing the data in the current body.   |
| **Content-Encoding**          | "How packed?"          | Compression applied to response.           |
| **Cache-Control**             | "Save this for later." | Managing browser caching policies.         |
| **ETag**                      | "File fingerprint."    | Version tracking for optimized caching.    |
| **Last-Modified**             | "When did it change?"  | Timestamp for conditional requests.        |
| **Expires**                   | "Hard expiry time."    | Absolute cache expiration.                 |
| **Strict-Transport-Security** | "Force HTTPS."         | Enforces secure connections.               |

### Mental Model for Quick Recall

- **Request Headers Express Intent**: "Where? Who? What do I want? What can I handle?"
- **Response Headers Express Facts**: "What is this? How big? How packed? Can I cache it? Remember user?"

---

## Key Distinctions

1. **Host vs. Origin:** Host specifies the target domain; Origin indicates the request's origin (for CORS).
2. **Accept vs. Content-Type:** Accept is what the client wants; Content-Type describes what's being sent.
3. **ETag vs. If-Modified-Since:** ETag uses a unique hash; If-Modified-Since uses timestamps.
4. **Cookie vs. Set-Cookie:** Set-Cookie instructs storage; Cookie sends stored data.

---

## HTTP Status Codes

While headers provide metadata, status codes communicate the outcome of the HTTP request. This section covers essential status codes, their meanings, and practical use cases for building robust APIs.

---

HTTP status codes are the "language of the web," allowing servers to communicate the result of a request to the client. Choosing the correct code is essential for API usability, debugging, and search engine optimization.

---

## 100s: Informational

_Request received, continuing process._

### 100 Continue

- **Meaning:** The server has received the request headers and the client should proceed to send the body.
- **Practical Use:** Used in large file uploads where the client sends `Expect: 100-continue`. This allows the server to check headers (like authentication or file size) before the client wastes bandwidth sending a massive payload.

### 101 Switching Protocols

- **Meaning:** The server is switching to the protocol requested by the client.
- **Practical Use:** This is the standard response when upgrading an HTTP connection to a **WebSocket** connection.

---

## 200s: Success

_The action was successfully received, understood, and accepted._

### 200 OK

- **Meaning:** Standard success.
- **Best Practice:** Use for `GET` requests returning data, or `PUT`/`PATCH` requests that return the updated resource.

### 201 Created

- **Meaning:** Request fulfilled and a new resource was created.
- **Best Practice:** Always use for `POST` requests. The response should ideally include a `Location` header pointing to the new resource URL.

### 202 Accepted

- **Meaning:** The request has been accepted for processing, but processing is not yet complete.
- **Use Case:** Ideal for **Asynchronous tasks**. If an API starts a long-running background job (like generating a report), return 202 immediately so the client isn't left hanging.

### 204 No Content

- **Meaning:** Success, but there is no body to return.
- **Use Case:** Most common for `DELETE` operations or `PUT` updates where the client doesn't need to see the object again.

### 206 Partial Content

- **Meaning:** The server is delivering only part of the resource due to a range header sent by the client.
- **Use Case:** Used for resumable downloads or streaming large files (e.g., video playback).

---

## 300s: Redirection & Caching

_Further action needs to be taken to complete the request._

### 301 Moved Permanently

- **Meaning:** The resource is at a new permanent URL.
- **Impact:** Browsers and SEO crawlers will update their links. Use this for migrating from `http` to `https`.

### 302 Found (Temporary Redirect)

- **Meaning:** The resource is temporarily elsewhere.
- **Impact:** Unlike 301, SEO crawlers will not update their links to the new URL. Use this for localized redirects or maintenance pages.

### 304 Not Modified

- **Meaning:** The resource has not changed since the last request.
- **Context:** Used in **Conditional GETs**. The client sends an `If-None-Match` (ETag) or `If-Modified-Since` header. If the server sees the file is the same, it returns 304 with no body, saving massive amounts of bandwidth.

### 307 Temporary Redirect

- **Meaning:** Similar to 302, but the client must use the same HTTP method in the redirected request.
- **Use Case:** Ensures POST requests remain POST after redirect; useful for API redirects.

### 308 Permanent Redirect

- **Meaning:** Similar to 301, but the client must use the same HTTP method in the redirected request.
- **Use Case:** Permanent redirects that preserve method; rare but strict for APIs.

---

## 400s: Client Errors

_The request contains bad syntax or cannot be fulfilled._

### 400 Bad Request

- **Meaning:** The server cannot process the request due to something perceived as a client error (e.g., malformed JSON syntax).

### 401 Unauthorized vs. 403 Forbidden

- **401 Unauthorized:** The user is not authenticated. They need to log in or provide a valid token.
- **403 Forbidden:** The user is authenticated but does not have the necessary permissions (roles) to access this specific resource.

### 404 Not Found

- **Meaning:** The server cannot find the requested resource.

### 409 Conflict

- **Meaning:** The request could not be processed because of a conflict in the current state of the resource.
- **Use Case:** Preventing duplicate signups (email already exists) or handling "Lost Updates" in database versioning.

### 410 Gone

- **Meaning:** The resource is permanently gone and will not be available again.
- **Use Case:** For resources that have been deleted and won't return (stricter than 404).

### 415 Unsupported Media Type

- **Meaning:** The server refuses to accept the request because the payload format is unsupported.
- **Use Case:** Client sends XML but server expects JSON.

### 422 Unprocessable Entity

- **Meaning:** The syntax is correct (valid JSON), but the semantic content is wrong.
- **Use Case:** Standard for **Form Validation errors**. For example, an age field containing a negative number.

### 429 Too Many Requests

- **Meaning:** The user has sent too many requests in a given amount of time ("Rate Limiting").

---

## 500s: Server Errors

_The server failed to fulfill an apparently valid request._

### 500 Internal Server Error

- **Meaning:** A generic "catch-all" error. Usually means the code crashed or an unhandled exception occurred.

### 501 Not Implemented

- **Meaning:** The server does not support the functionality required to fulfill the request.
- **Use Case:** For unimplemented HTTP methods or features.

### 502 Bad Gateway vs. 504 Gateway Timeout

- **502 Bad Gateway:** An intermediary server (like Nginx or a Load Balancer) received an invalid response from the actual application server.
- **504 Gateway Timeout:** The intermediary server waited too long for the application server to respond.

### 503 Service Unavailable

- **Meaning:** The server is currently unable to handle the request.
- **Use Case:** Usually temporary—server is down for maintenance or is overloaded.

### 507 Insufficient Storage

- **Meaning:** The server is unable to store the representation needed to complete the request.
- **Use Case:** Common in WebDAV or when storage quota is exceeded (e.g., disk full on server).

---

## Status Code Decision Logic

| Request Intent  | Expected Result                              | Recommended Status       |
| :-------------- | :------------------------------------------- | :----------------------- |
| Read data       | Data found                                   | 200 OK                   |
| Create resource | Resource created                             | 201 Created              |
| Update/Delete   | Success, no body returned                    | 204 No Content           |
| Any request     | Resource hasn't changed (Cache hit)          | 304 Not Modified         |
| Any request     | Malformed syntax / Bad JSON                  | 400 Bad Request          |
| Any request     | Missing Auth Token                           | 401 Unauthorized         |
| Any request     | Authenticated, but no permission             | 403 Forbidden            |
| Any request     | Resource missing                             | 404 Not Found            |
| Submit Form     | Logic validation failed (e.g. weak password) | 422 Unprocessable Entity |
| Submit Form     | Duplicate entry in DB                        | 409 Conflict             |
| Heavy traffic   | Rate limit hit                               | 429 Too Many Requests    |

---

## Advanced Interview Distinctions

### 401 vs. 403

- **401 (Identity):** "I don't know who you are."
- **403 (Permission):** "I know who you are, but you aren't allowed here."

### 400 vs. 422

- **400 (Format):** The server couldn't even read the request (e.g., a missing closing bracket in JSON).
- **422 (Logic):** The server read the request perfectly, but the data violates business rules (e.g., "End Date" is before "Start Date").

### 502 vs. 504

- **502 (Invalid Response):** The upstream server sent back garbage or disconnected.
- **504 (No Response):** The upstream server took too long and the proxy gave up.

### 200 vs. 204

- **200:** "Action done, here is the result."
- **204:** "Action done, nothing more to say."

---

## Developer Best Practices

1.  **Be Specific:** Never use 400 if 422 is more accurate.
2.  **Avoid 500s:** A 500 error is a failure of the developer to catch an exception. Always try to return a meaningful 4xx error instead.
3.  **Use Headers:** When using 201, include `Location`. When using 429, include `Retry-After`.
4.  **Consistency:** Ensure your entire API follows the same status code patterns to improve the Developer Experience (DX).

---

## Summary: Headers and Status Codes Quick Reference

| Scenario             | Recommended Headers                                                                                             | Recommended Status Code            |
| -------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Routing traffic      | **Host** (target domain)                                                                                        | N/A                                |
| Authentication       | **Authorization** (tokens/JWT)                                                                                  | 401 Unauthorized (missing auth)    |
| Sessions             | **Set-Cookie** (server → client), **Cookie** (client → server)                                                  | N/A                                |
| Content format       | **Content-Type** (request/response body)                                                                        | N/A                                |
| Caching              | **Cache-Control**, **ETag**, **If-None-Match**                                                                  | 304 Not Modified (cache hit)       |
| Compression          | **Accept-Encoding** (request), **Content-Encoding** (response)                                                  | N/A                                |
| Security             | **Access-Control-Allow-Origin** (CORS), **Strict-Transport-Security** (HSTS), **Content-Security-Policy** (CSP) | 403 Forbidden (insufficient perms) |
| Successful GET       | N/A                                                                                                             | 200 OK                             |
| Resource created     | N/A                                                                                                             | 201 Created                        |
| No content to return | N/A                                                                                                             | 204 No Content                     |
| Bad request syntax   | N/A                                                                                                             | 400 Bad Request                    |
| Resource not found   | N/A                                                                                                             | 404 Not Found                      |
| Server error         | N/A                                                                                                             | 500 Internal Server Error          |
| Rate limit exceeded  | N/A                                                                                                             | 429 Too Many Requests              |

---
