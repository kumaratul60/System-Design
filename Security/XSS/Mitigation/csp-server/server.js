const express = require('express');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const app = express();
const PORT = 3010;
// 1. Middleware to generate nonce and set CSP Headers (MUST be first)
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce;
  // 'unsafe-inline'

  /**
   * CSP SECURITY LEVELS:
   *
   * 1. MAXIMUM SECURITY (No Nonce + 'self')
   *    "script-src 'self';"
   *    -> Zero inline scripts allowed. Everything must be in .js files.
   *
   * 2. HIGH SECURITY (Nonce + 'self') - CURRENT SETUP
   *    "script-src 'self' 'nonce-${nonce}';"
   *    -> Only "trusted" inline scripts with the matching secret nonce can run.
   *
   * 3. NO SECURITY ('unsafe-inline')
   *    "script-src 'self' 'unsafe-inline';"
   *    -> Any script, including from an attacker, can run. Website is VULNERABLE.
   *
   * This is why we use Nonces: they allow us to keep the security of 'self'
   * while still letting our own specific inline scripts work!
   */
  res.setHeader(
    'Content-Security-Policy',
    `default-src 'self'; ` + `script-src 'self' 'nonce-${nonce}' http://unsecure.com; ` + `img-src 'self';`,
  );
  next();
});

// 2. Explicitly serve index.html with nonce injection (MUST be before express.static)
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');

  fs.readFile(indexPath, 'utf8', (err, html) => {
    if (err) {
      return res.status(500).send('Error reading index.html');
    }

    // Inject the nonce into the HTML
    const result = html.replace(/{{nonce}}/g, res.locals.nonce);
    res.send(result);
  });
});

// 3. Serve other static files (js, css, etc.)
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`CSP Demo Server running at http://localhost:${PORT}`);
  console.log(`Fixed: Root route now handles nonce injection correctly.`);
});
