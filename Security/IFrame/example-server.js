const express = require('express');
const app = express();
const PORT = 5000;

/**
 * SECURITY MIDDLEWARE EXAMPLE
 * This matches your screenshot implementation.
 *
 * frame-ancestors 'self' : Only allow this site to frame itself.
 * next() : Moves to the next middleware or route handler.
 */
app.use((req, res, next) => {
  // Option 1: Legacy X-Frame-Options
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Option 2: Modern Content-Security-Policy
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");

  // Option 3: Secure Cookies (As shown in your screenshot)
  // Note: For this to work in Express, you'd usually use 'cookie-parser' middleware
  // but we can set it manually via setHeader too:
  res.setHeader('Set-Cookie', 'sessionID=12345; HttpOnly; Secure; SameSite=Strict');

  console.log(`[Security] Applied headers and cookies to ${req.url}`);
  next();
});

// Serve static files from a 'public' folder
// Ensure you have a 'public' folder with an index.html or example1.html
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('<h1>Security Headers Active!</h1><p>Check the Network tab in DevTools to see XFO and CSP headers.</p>');
});

app.listen(PORT, () => {
  console.log(`Example server running at http://localhost:${PORT}`);
});
