const express = require('express');
const path = require('path');

const app = express();
const PORT = 4000;

// GLOBAL SECURITY MIDDLEWARE EXAMPLE
// To see how this blocks the Parent (Port 3000), uncomment the code below:
/*
app.use((req, res, next) => {
  // res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");
  next(); 
});
*/

// Middleware to serve static files
const staticMiddleware = express.static(path.join(__dirname, 'public'));

// Route for standard framing (allowed)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route with X-Frame-Options: DENY
app.get('/secure-xfo', (req, res) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route with CSP: frame-ancestors 'none'
app.get('/secure-csp', (req, res) => {
  res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route with X-Frame-Options: SAMEORIGIN
app.get('/secure-sameorigin', (req, res) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Child server running at http://localhost:${PORT}`);
});
