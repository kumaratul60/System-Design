# Security Headers Lab

- x-powered-by
- referrer-Policy: when to use strict-origin-when-cross-origin
  explain all that in details consise and with clear expaline if posible dummy is also fine
  - Referrer-Policy: no-referrer
    Referrer-Policy: no-referrer-when-downgrade
    Referrer-Policy: origin
    Referrer-Policy: origin-when-cross-origin
    Referrer-Policy: same-origin
    Referrer-Policy: strict-origin
    Referrer-Policy: strict-origin-when-cross-origin
    Referrer-Policy: unsafe-url
- X-Content-Type-Options
  - nosniff: i dont want any type of snifing like html /js code injection, don't do over engieeniring/
- x-xxs-protection
  - X-XSS-Protection: 0
    X-XSS-Protection: 1
    X-XSS-Protection: 1; mode=block // Block pages from loading when they detect reflected XSS attacks:
    X-XSS-Protection: 1; report=<reporting-uri>

    X-Content-Type-Options this cap be avoid if proper csp policy set, but good to have

- HSTS header (Strict transaport security header)

## Implemented Headers:

- `x-powered-by`: Disabled via `app.disable('x-powered-by')` to prevent technology fingerprinting.
- `X-Content-Type-Options`: Set to `nosniff` to prevent MIME type sniffing.
- `X-Frame-Options`: Set to `DENY` to prevent clickjacking.
- `Strict-Transport-Security` (HSTS): Enforces HTTPS.

### Serving HTML:

Use `res.sendFile(path.join(__dirname, 'index.html'))` to serve static HTML files.

### API Responses with `res.json()`:

Use `res.json({ data })` for API endpoints.

- **Why an object wrapper?** It's more secure than a top-level array and allows you to easily add metadata (like `count` or `page`) later without breaking the client.
- **Headers:** It automatically sets `Content-Type: application/json`.

### Header Management Methods:

#### 1. `res.set({ 'Header-Name': 'Value' })`

- **When to use:** Use this when you want to **add** or **overwrite** a header in the response.
- **Example:** Setting security headers like `X-Frame-Options` or `Content-Security-Policy`.
- **Scope:** Usually used inside middleware or specific routes.

#### 2. `app.disable('x-powered-by')`

- **When to use:** This is an **Express-specific** global setting. Use it to prevent Express from ever creating the `X-Powered-By` header in the first place.
- **Why:** It's more efficient than removing the header later because the header is never even generated.
- **Scope:** Set once during server initialization.

#### 3. `res.removeHeader('Header-Name')`

- **When to use:** This is a **low-level Node.js** method. Use it to **strip away** a header that has already been set by a previous middleware, a library, or the environment.
- **Why:** If you can't prevent a header from being created (like with `app.disable`), this is your "reactive" tool to make sure it doesn't reach the client.
- **Scope:** Usually used in a "cleanup" middleware at the end of the middleware chain.

### How to Run:

- **Standard:** `npm start` (Runs `node server.js`)
- **Development:** `npm run dev` (Runs `nodemon server.js` for auto-restarts on save)
