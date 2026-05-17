# Comprehensive Security Headers Guide

This lab demonstrates how to implement and understand essential HTTP security headers in an Express.js environment.

---

## 1. X-Powered-By

Identifies the technology (e.g., Express) powering the server.

- **Problem:** Helps attackers perform "fingerprinting" to target version-specific vulnerabilities.
- **Solution:** Disable it entirely.
- **Implementation:** `app.disable('x-powered-by')`

---

## 2. Referrer-Policy

Controls how much "referrer" information (the URL you came from) is sent when you click a link.

| Policy                            | Description                                                                                                                      |
| :-------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| `no-referrer`                     | Send nothing. Most private.                                                                                                      |
| `no-referrer-when-downgrade`      | Send full URL, but **not** when moving from HTTPS to HTTP. (Default in older browsers).                                          |
| `origin`                          | Send only the domain (e.g., `https://example.com/`), not the full path.                                                          |
| `origin-when-cross-origin`        | Full URL for same-origin, but only domain for cross-origin.                                                                      |
| `same-origin`                     | Send referrer only for same-origin requests.                                                                                     |
| `strict-origin`                   | Only send domain, and only when security level stays the same (HTTPS → HTTPS).                                                   |
| `strict-origin-when-cross-origin` | **(Best Practice)** Full URL for same-origin. Only domain for cross-origin (HTTPS → HTTPS). Send nothing if moving HTTPS → HTTP. |
| `unsafe-url`                      | Always send full URL. **Dangerous** (leaks private paths to 3rd parties).                                                        |

---

## 3. X-Content-Type-Options: nosniff

Prevents the browser from "guessing" the content type of a file (MIME sniffing).

- **The Risk:** An attacker uploads a malicious `.js` file disguised as a `.jpg`. If the browser "sniffs" it and executes it as script, you have an XSS attack.
- **The Fix:** `nosniff` forces the browser to strictly follow the `Content-Type` header sent by the server.
- **Note:** While a good Content Security Policy (CSP) helps, `nosniff` is a simple, essential first line of defense.

---

## 4. X-XSS-Protection

A legacy header designed to stop "Reflected XSS" attacks in older browsers (IE, older Chrome).

- **Values:**
  - `0`: Disable the filter.
  - `1`: Enable filter (browser will "sanitize" the page by removing the script).
  - `1; mode=block`: **(Recommended for legacy)** Instead of sanitizing, the browser stops the page from loading entirely if XSS is detected.
  - `1; report=<uri>`: Reports the violation to a specific URL.
- **Status:** Modern browsers use **CSP (Content Security Policy)** instead. However, keeping `1; mode=block` doesn't hurt for older client support.

---

## 5. HSTS (Strict-Transport-Security)

Tells the browser: "Only talk to me over HTTPS for the next X months."

### HTTPS Redirection Middleware:

In production, your app often sits behind a proxy (like Nginx, AWS ELB, or Heroku). These proxies handle the SSL/TLS encryption (SSL Termination) and pass the original protocol to your app via the `x-forwarded-proto` header.

```javascript
const redirectToHttps = (req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(['https://', req.get('Host'), req.url].join(''));
  }
  next();
};
app.use(redirectToHttps);
```

- **How it works:**
  1. **First Request (Insecure):** User types `http://example.com`.
  2. **Server Response:** Redirects (301) to `https://example.com` and includes the `Strict-Transport-Security` header.
  3. **Browser Memory:** The browser remembers this rule for the specified `max-age`.
  4. **Subsequent Requests:** Even if the user types `http://`, the browser performs an **internal redirect (307)** to `https://` before the request even leaves the computer.
- **Benefits:** Prevents "SSL Stripping" attacks.
- **HSTS Preloading:** You can submit your domain to the [HSTS Preload List](https://hstspreload.org/). Once accepted, browsers will hardcode your site as "HTTPS-only," meaning even the _very first_ visit will be secure without needing the initial redirect.
  - **Requirement:** Your header must include the `preload` directive: `max-age=63072000; includeSubDomains; preload`.

---

## 6. Permissions-Policy (Formerly Feature-Policy)

Allows you to control which browser features (camera, microphone, geolocation) can be used.

- **Problem:** If your site is compromised via XSS, an attacker could try to use the user's camera or geolocation.
- **Solution:** Explicitly disable features you don't use.
- **Implementation:** `res.setHeader('Permissions-Policy', 'geolocation=(), camera=()')`

---

## Implementation Summary

```javascript
// Disable fingerprinting
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-XSS-Protection': '1; mode=block',
  });
  next();
});
```

### Serving HTML:

Use `res.sendFile(path.join(__dirname, 'index.html'))` to serve static HTML files.

### API Responses with `res.json()`:

Use `res.json({ data })` for API endpoints.

- **Why an object wrapper?** It's more secure than a top-level array and allows you to easily add metadata (like `count` or `page`) later without breaking the client.
- **Headers:** It automatically sets `Content-Type: application/json`.
-

## Header Management Methods:

### 1. `res.setHeader('Header-Name', 'Value')`

- **When to use:** This is the **Native Node.js** method.
- **Pros:** Fast and works in any Node.js environment.
- **Cons:** You have to call it separately for every header (no object support).

### 2. `res.set({ ... })` (Express Only)

- **When to use:** This is an **Express wrapper**.
- **Pros:** Much cleaner for setting multiple headers at once using an object.
- **Cons:** Only works in Express.

### 3. `app.disable('x-powered-by')`

- **When to use:** This is an **Express-specific** global setting. Use it to prevent Express from ever creating the `X-Powered-By` header in the first place.
- **Why:** It's more efficient than removing the header later because the header is never even generated.
- **Scope:** Set once during server initialization.

#### 3. `res.removeHeader('Header-Name')`

- **When to use:** This is a **low-level Node.js** method. Use it to **strip away** a header that has already been set by a previous middleware, a library, or the environment.
- **Why:** If you can't prevent a header from being created (like with `app.disable`), this is your "reactive" tool to make sure it doesn't reach the client.
- **Scope:** Usually used in a "cleanup" middleware at the end of the middleware chain.

### How to Run:

- **Standard:** `npm start`
- **Development:** `npm run dev` (using nodemon)
