const express = require('express');
const path = require('path');
const app = express();

// 1. SECURITY: Disable the 'X-Powered-By' header to hide that we are using Express
// app.disable('x-powered-by');

// 2. SECURITY: Example of setting other common security headers manually
app.use((req, res, next) => {
  // Use res.set() to add security headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Powered-By': 'Me',
  });

  // Use res.removeHeader() to manually strip sensitive headers
  // This is useful if a middleware or environment adds a header you want to hide
  // res.removeHeader('X-Powered-By');

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
