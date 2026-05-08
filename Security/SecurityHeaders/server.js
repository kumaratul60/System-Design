const express = require('express');
const path = require('path');
const app = express();

// 1. SECURITY: Disable the 'X-Powered-By' header to hide that we are using Express
app.disable('x-powered-by');

const redirectToHttps = (req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    // Redirect to HTTPS
    return res.redirect(['https://', req.get('Host'), req.url].join(''));
  }
  next();
};

app.use(redirectToHttps);

// 2. SECURITY: Example of setting other common security headers manually
app.use((req, res, next) => {
  // res.setHeader is the NATIVE Node.js way to set headers (as seen in screenshot)
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Use res.removeHeader() to manually strip sensitive headers
  // This is useful if a middleware or environment adds a header you want to hide
  // res.removeHeader('X-Powered-By');

  // Alternatively, you can use Express's res.set() to set multiple headers at once:
  /*
  res.set({
    'X-Content-Type-Options': 'nosniff', // Prevents MIME type sniffing
    'X-Frame-Options': 'DENY', // Prevents clickjacking
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains', // Enforces HTTPS
    'Referrer-Policy': 'strict-origin-when-cross-origin', // Controls referrer info
    'X-XSS-Protection': '1; mode=block', // Legacy XSS protection
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  });
  */

  next();
});

const LIST = [{ id: 1, name: 'xyz' }];

// Example: Serving an HTML file
app.get('/', (req, res) => {
  // res.send('yes, listen wave');
  res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * When to use res.json({ data }):
 * 1. For REST APIs: Use it when the client (React, Mobile app) expects raw data, not HTML.
 * 2. Object Wrapper: Wrapping data in an object { LIST } instead of sending [1, 2, 3]
 *    directly is a best practice for security and future extensibility (e.g., adding metadata like 'count').
 * 3. Content-Type: It automatically sets 'Content-Type: application/json'.
 */
app.get('/list', (req, res) => {
  // res.send(LIST);
  res.json({
    data: LIST,
    count: LIST.length,
  });
});

const port = 3100;
app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
