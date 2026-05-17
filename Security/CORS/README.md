# CORS (Cross-Origin Resource Sharing)

CORS is a security feature implemented by browsers that restricts web pages from making requests to a different domain than the one that served the web page.

## The Problem: Same-Origin Policy (SOP)

By default, browsers follow the **Same-Origin Policy**, which prevents a script on `https://domain-a.com` from accessing data on `https://domain-b.com`. This is crucial to prevent malicious sites from stealing your session cookies or sensitive data from other sites you are logged into.

## How CORS Works

CORS allows servers to "opt-in" to sharing resources with specific origins.

### 1. Simple Requests

For certain "simple" requests (e.g., GET/POST with standard headers), the browser sends the request and checks the response for the `Access-Control-Allow-Origin` header.

### 2. Preflight Requests (OPTIONS)

For "non-simple" requests (e.g., using `PUT`, `DELETE`, or custom headers like `Authorization`), the browser first sends an **OPTIONS** request (the "preflight") to ask the server for permission.

**Preflight Headers:**

- `Origin`: The origin making the request.
- `Access-Control-Request-Method`: The method the client wants to use.
- `Access-Control-Request-Headers`: The custom headers the client wants to use.

**Server Response Headers:**

- `Access-Control-Allow-Origin`: `*` or specific domain.
- `Access-Control-Allow-Methods`: List of allowed methods.
- `Access-Control-Allow-Headers`: List of allowed headers.
- `Access-Control-Max-Age`: How long (in seconds) the preflight response can be cached.

---

## Express.js Example

Using the popular `cors` middleware:

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// 1. Allow ALL origins (Not recommended for production)
// app.use(cors());

// 2. Allow specific origins (Best Practice)
const corsOptions = {
  origin: 'https://trusted-app.com',
  methods: ['GET', 'POST', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.get('/api/data', (req, res) => {
  res.json({ message: 'This data is cross-origin accessible!' });
});

app.listen(3000);
```

---

## Common Pitfalls

- **Wildcard `*` with Credentials:** You cannot use `Access-Control-Allow-Origin: *` if `Access-Control-Allow-Credentials` is `true`. You must specify a specific origin.
- **Missing OPTIONS handling:** If you implement CORS manually without a library, ensure your server handles `OPTIONS` requests and returns a `200 OK` with the correct headers.
- **Case Sensitivity:** Header names are case-insensitive, but values (like origin) are often case-sensitive.
