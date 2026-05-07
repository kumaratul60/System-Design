# Content Security Policy (CSP) - Deep Dive

Content Security Policy (CSP) is a powerful, modern security layer that helps detect and mitigate certain types of attacks, including Cross-Site Scripting (XSS) and data injection attacks.

## 1. The Core Philosophy: "Zero Trust"

By default, a browser trusts all content it receives from a server. If a page says `load script from evil.com`, the browser does it. **CSP changes this.** It tells the browser: _"Do not trust anything unless I explicitly whitelist it."_

---

## 2. CSP Directives (The "What")

| Directive         | Covers                       | Recommended Start              | Dangerous / Avoid                      |
| :---------------- | :--------------------------- | :----------------------------- | :------------------------------------- |
| `default-src`     | Fallback for all others.     | `'none'`                       | `*` (Allows everything)                |
| `script-src`      | JS files and execution.      | `'self'` or `'strict-dynamic'` | `'unsafe-inline'`, `'unsafe-eval'`     |
| `style-src`       | CSS files and inline styles. | `'self'`                       | `'unsafe-inline'`                      |
| `img-src`         | Image sources.               | `'self'` or `https:`           | `*`                                    |
| `connect-src`     | Fetch, XHR, WebSockets.      | `'self'`                       | `*`                                    |
| `frame-ancestors` | Who can iframe your site?    | `'none'` or `'self'`           | `*` (Allows Clickjacking)              |
| `base-uri`        | Restricts `<base>` tag.      | `'none'` or `'self'`           | `*` (Allows redirecting relative URLs) |

## Source Expressions (The "Where")

These are keywords or patterns used to define allowed sources.

- **`'self'`**: Allows resources from the same origin (same domain, protocol, and port).
- **`'none'`**: Blocks everything for that directive.
- **`https:`**: Allows loading from any secure (HTTPS) source.
- **`example.com`**: Allows loading from a specific domain.
- **`*.example.com`**: Allows loading from any subdomain of example.com.
- **`'unsafe-inline'`**: **AVOID.** Allows inline scripts/styles (e.g., `<script>alert(1)</script>`). Using this makes your CSP much weaker.
- **`'unsafe-eval'`**: **AVOID.** Allows the use of `eval()` and similar dangerous functions.

### CSP Security Levels Comparison

| Level                | Policy Example                       | Result                                                                     |
| :------------------- | :----------------------------------- | :------------------------------------------------------------------------- |
| **Maximum Security** | `script-src 'self';`                 | **Zero** inline scripts allowed. All code must be in external `.js` files. |
| **High Security**    | `script-src 'self' 'nonce-xyz';`     | Only **trusted** inline scripts with the matching secret nonce can run.    |
| **No Security**      | `script-src 'self' 'unsafe-inline';` | **Any** script can run. The website is vulnerable to XSS.                  |

👉 **The Lesson**: This is why we use **Nonces**. They allow us to keep the high security of `'self'` while still letting our own specific inline scripts work!

---

## 3. Advanced Protection: Nonces & Hashes

If you MUST use an inline script, do not use `'unsafe-inline'`. Instead, use a **Nonce** or a **Hash**.

### A. Nonce (Number used ONCE)

1. **Server generates a random string** (e.g., `EDNnf03...`):
   ```javascript
   const nonce = crypto.randomBytes(16).toString('base64');
   ```
2. **Server adds it to the CSP Header**: `script-src 'self' 'nonce-EDNnf03...'`.
3. ```http
   Content-Security-Policy: script-src 'self' 'nonce-EDNnf03...'
   ```
4. **Server injects it into the Script Tag**:
   ```html
   <script nonce="EDNnf03...">
     console.log('This script is allowed because the nonces match!');
   </script>
   ```
5. **Browser protection**: The browser only runs the script if the nonce matches. Attackers cannot guess this secret.

### B. Hash

1. Calculate the SHA-256 hash of your script's content.
2. Add it to the CSP: `script-src 'sha256-xyz...'`.
3. The browser will only run the script if its content matches that exact hash.

---

## 🛡️ Safe Use: The "Strict CSP" Approach

Modern security experts recommend a **Strict CSP** using `strict-dynamic`. This is more robust than simple whitelisting.

**Example Policy:**

```http
Content-Security-Policy:
  object-src 'none';
  script-src 'nonce-rAnd0m123' 'strict-dynamic' https: 'unsafe-inline';
  base-uri 'none';
```

- **`strict-dynamic`**: Tells the browser that a script trusted via a nonce can "vouch" for and load other scripts it needs (like a CDN loading its own dependencies).
- **`https: 'unsafe-inline'`**: These are ignored by modern browsers when `strict-dynamic` is present, but provide backward compatibility for older browsers.

---

## 4. Deployment & Monitoring

### Phase 1: Report-Only Mode

Before enforcing a policy, use the `Report-Only` header to test without breaking features.

```http
Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-violation-endpoint
```

### Monitoring Violations: `report-uri` vs `report-to`

| Directive        | Status             | Usage                                                          |
| :--------------- | :----------------- | :------------------------------------------------------------- |
| **`report-uri`** | **Older (Legacy)** | Sends a POST request with a JSON body to a specific URL.       |
| **`report-to`**  | **Newer (Modern)** | Uses the "Reporting API" to send reports. It is more flexible. |

**Example of Modern Reporting (`report-to`):**

1. Set the `Reporting-Endpoints` header:
   ```http
   Reporting-Endpoints: main-endpoint="https://example.com/csp-reports"
   ```
2. Reference it in your CSP:
   ```http
   Content-Security-Policy: default-src 'self'; report-to main-endpoint
   ```

---

## 🚩 Common CSP Pitfalls

1.  **Whitelist Fatigue**: Whitelisting broad domains like `*.google.com` is dangerous because an attacker could use a JSONP endpoint or an open redirect on that domain to bypass your CSP.
2.  **Missing `object-src 'none'`**: If you don't block Flash/Plugins, attackers can use them to bypass your script protections.
3.  **Missing `base-uri`**: Without this, an attacker can inject a `<base>` tag to redirect all relative script loads to their own server.
4.  **Using `'unsafe-inline'` with a Nonce**: In some older browsers, adding a nonce doesn't automatically disable `'unsafe-inline'`, leaving you vulnerable.
5.  **Clickjacking**: Forgetting `frame-ancestors 'none'` allows attackers to wrap your site in an invisible iframe and trick users into clicking buttons.

---

## 🔍 Debugging CSP

Implementing CSP can be tricky and might break your site. Here is how to fix it:

1. **Start with `Report-Only`**:
   ```http
   Content-Security-Policy-Report-Only: default-src 'self'; ...
   ```
   This logs errors to the console but **doesn't block** anything.
2. **Check the Console**: The browser will explicitly tell you why a resource was blocked.
   > _Refused to load the script '...' because it violates the following Content Security Policy directive: "script-src 'self'"_
3. **Use Google's CSP Evaluator**: [csp-evaluator.withgoogle.com](https://csp-evaluator.withgoogle.com/)
   Paste your policy there to see if it has common bypasses or weaknesses.
4. **Browser DevTools**: Use the **Network** tab to see which headers are being sent and the **Security** tab to review the active policy.

---

## 6. Real-World Implementation (Express.js)

```javascript
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.nonce = nonce; // Pass to template engine
  res.setHeader(
    'Content-Security-Policy',
    `default-src 'none'; ` +
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'; ` +
      `style-src 'self' 'unsafe-inline'; ` + // Inline styles are often needed
      `img-src 'self' data:; ` +
      `connect-src 'self'; ` +
      `base-uri 'none'; ` +
      `form-action 'self'; ` +
      `frame-ancestors 'none';`,
  );
  next();
});
```
