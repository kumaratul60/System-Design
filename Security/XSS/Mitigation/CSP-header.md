# Content Security Policy (CSP) - Deep Dive

Content Security Policy (CSP) is a powerful, modern security layer that helps detect and mitigate certain types of attacks, including Cross-Site Scripting (XSS) and data injection attacks.

## 1. The Core Philosophy: "Zero Trust"

By default, a browser trusts all content it receives from a server. If a page says `load script from evil.com`, the browser does it. **CSP changes this.** It tells the browser: _"Do not trust anything unless I explicitly whitelist it."_

---

## 2. CSP Directives (The "What")

A policy is made up of directives, each covering a specific type of resource.

| Directive     | Covers                       | Recommended Start    | Dangerous / Avoid                  |
| :------------ | :--------------------------- | :------------------- | :--------------------------------- |
| `default-src` | Fallback for all others.     | `'none'` or `'self'` | `*` (Allows everything)            |
| `script-src`  | JS files and execution.      | `'self'`             | `'unsafe-inline'`, `'unsafe-eval'` |
| `style-src`   | CSS files and inline styles. | `'self'`             | `'unsafe-inline'`                  |
| `img-src`     | Image sources.               | `'self'` or `data:`  | `*`                                |
| `connect-src` | Fetch, XHR, WebSockets.      | `'self'`             | `*`                                |
| `frame-src`   | Iframes (Who can be inside). | `'none'`             | `*`                                |
| `font-src`    | Font files (Google Fonts).   | `'self'`             | `*`                                |

---

## 3. Source Expressions (The "Where")

These are keywords or patterns used to define allowed sources.

- **`'self'`**: Allows resources from the same origin (same domain, protocol, and port).
- **`'none'`**: Blocks everything for that directive.
- **`https:`**: Allows loading from any secure (HTTPS) source.
- **`example.com`**: Allows loading from a specific domain.
- **`*.example.com`**: Allows loading from any subdomain of example.com.
- **`'unsafe-inline'`**: **AVOID.** Allows inline scripts/styles (e.g., `<script>alert(1)</script>`). Using this makes your CSP much weaker.
- **`'unsafe-eval'`**: **AVOID.** Allows the use of `eval()` and similar dangerous functions.

---

## 4. Advanced Protection: Nonces & Hashes

If you MUST use an inline script, do not use `'unsafe-inline'`. Instead, use a **Nonce** or a **Hash**.

### CSP Security Levels Comparison

| Level                | Policy Example                       | Result                                                                     |
| :------------------- | :----------------------------------- | :------------------------------------------------------------------------- |
| **Maximum Security** | `script-src 'self';`                 | **Zero** inline scripts allowed. All code must be in external `.js` files. |
| **High Security**    | `script-src 'self' 'nonce-xyz';`     | Only **trusted** inline scripts with the matching secret nonce can run.    |
| **No Security**      | `script-src 'self' 'unsafe-inline';` | **Any** script can run. The website is vulnerable to XSS.                  |

> **The Lesson**: This is why we use **Nonces**. They allow us to keep the high security of `'self'` while still letting our own specific inline scripts work!

### A. Nonce (Number used ONCE)

1. **Server generates a random string**:
   ```javascript
   const nonce = crypto.randomBytes(16).toString('base64');
   ```
2. **Server adds it to the CSP Header**:
   ```http
   Content-Security-Policy: script-src 'self' 'nonce-EDNnf03...'
   ```
3. **Server injects it into the Script Tag**:
   ```html
   <script nonce="EDNnf03...">
     console.log('This script is allowed because the nonces match!');
   </script>
   ```
4. **Browser protection**: The browser only runs the script if the nonce in the tag exactly matches the one in the header. **Attackers cannot guess this code for their injected scripts.**

### B. Hash

1. You calculate the SHA-256 hash of your script's content.
2. Add it to the CSP: `script-src 'sha256-xyz...'`.
3. The browser will only run the script if its content matches that exact hash.

---

## 5. Deployment Strategies

### Phase 1: Report-Only Mode

Before enforcing a policy (which might break your site), use the `Report-Only` header. This allows you to "test" your policy in production without breaking any features.

```http
Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-violation-endpoint
```

#### Monitoring Violations: `report-uri` vs `report-to`

| Directive        | Status             | Usage                                                                                         |
| :--------------- | :----------------- | :-------------------------------------------------------------------------------------------- |
| **`report-uri`** | **Older (Legacy)** | Sends a POST request with a JSON body to a specific URL. Widely supported but being replaced. |
| **`report-to`**  | **Newer (Modern)** | Uses the "Reporting API" to send reports. It is more flexible and allows grouping reports.    |

**Example of Modern Reporting (`report-to`):**

1. Set the `Reporting-Endpoints` header:
   ```http
   Reporting-Endpoints: main-endpoint="https://example.com/csp-reports"
   ```
2. Reference it in your CSP:
   ```http
   Content-Security-Policy: default-src 'self'; report-to main-endpoint
   ```

_Note: For maximum compatibility, many developers include BOTH directives in their header._

### Phase 2: Enforce Mode

Once you are sure no legitimate resources are being blocked, switch to the standard header:

```http
Content-Security-Policy: default-src 'self'; img-src 'self' https://trusted-images.com;
```

---

## 6. Real-World Implementation Example (Express.js)

```javascript
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; " + // Block everything by default
      "script-src 'self'; " + // Only local JS
      "img-src 'self' https://cdn.com; " + // Local images + specific CDN
      "style-src 'self'; " + // Only local CSS
      "connect-src 'self'; " + // Only local API calls
      "form-action 'self';", // Only allow forms to submit to self
  );
  next();
});
```

---

## 7. Summary Checklist for a Strong CSP

1. [ ] **Start Strict**: Use `default-src 'none'` and then add only what you need.
2. [ ] **Kill Inline Scripts**: Remove all `<script>...</script>` from your HTML. Move them to `.js` files.
3. [ ] **Validate Protocols**: If you allow an external domain, ensure you specify `https://`.
4. [ ] **Use HttpOnly Cookies**: CSP protects the page, but `HttpOnly` cookies protect the session tokens even if CSP fails.
