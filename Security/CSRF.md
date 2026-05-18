# Cross-Site Request Forgery (CSRF)

Cross-Site Request Forgery (CSRF) is a vulnerability where an attacker trick a victim into performing actions on their behalf on a different website where the victim is authenticated.

## 1. What is CSRF?

CSRF (also known as "sea-surf" or Session Riding) exploits the trust that a site has in a user's browser. It forces a logged-in user to execute unwanted actions on a web application in which they are currently authenticated.

### Key Reasons why CSRF is possible:

- **Statelessness of HTTP:** Every request is independent.
- **Automatic Cookie Inclusion:** Browsers automatically include credentials (like session cookies) with every request made to a domain, regardless of where the request originated.
- **User Authentication:** The victim must have an active session with the target site.

---

## 2. Vulnerabilities & Examples

### A. GET-based CSRF

If an application uses GET requests for state-changing operations (like transferring money), it is highly vulnerable.

**Example URL:**
`http://bank.com/fundtransfer?accId=21312&amount=10000`

**Delivery Methods:**

1.  **Via Hyperlink:**
    ```html
    <a href="http://bank.com/fundtransfer?accId=21312&amount=10000">Click for special offer!</a>
    ```
2.  **Via Image Tag (Automatic):**
    The browser tries to load the image and executes the request automatically.
    ```html
    <img src="http://bank.com/fundtransfer?accId=21312&amount=10000" width="0" height="0" />
    ```

### B. POST-based CSRF

Even if you use POST, an attacker can use a hidden form on their malicious site to submit a request to your server.

**Example Malicious Page:**

```html
<form action="http://bank.com/fundtransfer" method="POST" id="csrf-form">
  <input type="hidden" name="accId" value="1231231" />
  <input type="hidden" name="amount" value="100000" />
  <input type="submit" value="Click for Free iPhone!" />
</form>

<script>
  // Optionally auto-submit the form
  // document.getElementById('csrf-form').submit();
</script>
```

---

## 3. How to Prevent (Mitigation)

### A. Anti-CSRF Tokens (Synchronizer Token Pattern)

This is the most common and effective defense. It involves a handshake between the client and server.

**The Flow:**

1.  **Server-side:** The server generates a unique, cryptographically strong, and unpredictable token for the user's session.
2.  **Client-side:** This token is embedded in the website (e.g., as a hidden input in a form or a meta tag).
3.  **Submission:** When the user submits a form, the `csrf-token` is sent along with the request.
4.  **Verification:** The server validates that the token in the request matches the one stored in the session/server-side.

```text
[ Website ] --- formSubmit { csrf-token } ---> [ Server ]
```

### B. SameSite Cookie Attribute

Modern browsers support the `SameSite` attribute on cookies to control if cookies are sent with cross-site requests. You can set this in your server middleware:

**Code Example (Node.js/Express):**

```javascript
app.use((req, res, next) => {
  // Setting SameSite to Strict, Lax, or None
  res.setHeader('Set-Cookie', 'session_id=xyz123; SameSite=Strict; Secure; HttpOnly');
  next();
});
```

**Attribute Values:**

- **`SameSite=Strict`:** The browser only sends the cookie for requests that originate from the same site where the cookie was set. Most secure but can impact user experience (e.g., following a link from another site won't keep the user logged in).
- **`SameSite=Lax`:** (Default in modern browsers) Cookies are not sent on cross-site subrequests (like images or frames) but _are_ sent when a user navigates _to_ the origin site (e.g., following a top-level link).
- **`SameSite=None`:** Cookies are sent in all contexts, including cross-site requests. **Mandatory:** Must be used with the `Secure` flag (HTTPS).

### C. Custom Request Headers

For AJAX/Fetch requests, you can require a custom HTTP header (e.g., `X-Requested-With`). Since browsers restrict adding custom headers to cross-origin requests unless allowed via CORS, this prevents simple CSRF.

### D. Verifying Origin and Referer Headers

This is a defense-in-depth measure that checks where the request originated from.

1.  **Origin Header:** Indicates the origin (protocol, host, and port) of the request.
2.  **Referer Header:** Contains the address of the previous web page from which a link to the currently requested page was followed.

**Code Example:**

```javascript
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const allowedOrigin = 'https://bank.com';

  // Verify if the request comes from our own domain
  if (origin === allowedOrigin || (referer && referer.startsWith(allowedOrigin))) {
    next();
  } else {
    res.status(403).send('Forbidden: Potential CSRF detected');
  }
});
```

**Caveats:**

- **Privacy settings:** Some browsers or extensions might strip the Referer header for privacy.
- **Spoofing:** While hard to spoof in a browser environment, it's not a standalone solution.
- **Incomplete coverage:** Some requests might not include an Origin header.

### E. CAPTCHA

For highly sensitive actions (like password changes or large financial transfers), requiring a CAPTCHA can effectively stop automated CSRF attacks. Since an attacker cannot predict or solve the CAPTCHA programmatically from their site, the request cannot be completed.

**When to use:**

- High-value transactions.
- Actions that have permanent consequences (e.g., deleting an account).

### F. Content Security Policy (CSP) Headers

While CSP is primarily for XSS, it can help mitigate CSRF in specific ways:

1.  **`frame-ancestors 'none' or 'self'`:** Prevents your site from being framed by malicious sites, stopping UI Redressing (Clickjacking) which is often used in conjunction with CSRF.
2.  **`script-src`:** Restricting where scripts can be loaded from reduces the risk of an attacker injecting a script that performs a CSRF on behalf of the user.

**Example CSP Header:**

```http
Content-Security-Policy: frame-ancestors 'self'; script-src 'self' https://trusted.com;
```

### G. Double Submit Cookie

1.  Send a random value in both a cookie and as a request parameter.
2.  The server verifies they match.
3.  Since an attacker cannot read the cookie from another domain (Same-Origin Policy), they cannot include the correct value in the request parameter.

---

## 4. Advanced Considerations

### A. Login CSRF

Attacker tricks a victim into logging into the **attacker's** account.

- **Goal:** The victim unknowingly uses the attacker's account (e.g., searches for sensitive terms, adds their credit card). The attacker then logs in later and sees the victim's history or data.
- **Prevention:** Use Anti-CSRF tokens even on the login form itself.

### B. XSS Bypasses CSRF Protection

It is critical to remember that **Cross-Site Scripting (XSS) can completely bypass CSRF protections.**

- If an attacker can execute a script on your domain (XSS), that script can:
  1.  Read the Anti-CSRF token from the DOM.
  2.  Make a request with that valid token.
- **Lesson:** You must solve XSS to have reliable CSRF protection.

### C. CSRF in JSON APIs

Modern APIs using `application/json` are generally safer because:

- Browsers only allow `application/x-www-form-urlencoded`, `multipart/form-data`, and `text/plain` for simple cross-site POST requests.
- Sending a real `application/json` request requires a **CORS Preflight (OPTIONS request)**. If the server doesn't explicitly allow the attacker's origin, the browser blocks the POST.
- **Risk:** Some servers are misconfigured to accept JSON content even if the `Content-Type` is set to `text/plain` (which doesn't trigger a preflight). Always strictly validate the `Content-Type` header on the server.

### D. CSRF and Modern Authentication (JWTs)

How you store your authentication tokens (like JWTs) determines your CSRF risk:

1.  **JWT in Cookies:** Vulnerable to CSRF because browsers automatically send cookies. **Mitigation:** Use `SameSite=Strict/Lax` and Anti-CSRF tokens.
2.  **JWT in LocalStorage/SessionStorage:** Generally **NOT** vulnerable to CSRF because the browser does not automatically include these in request headers. The application must manually add an `Authorization: Bearer <token>` header.
    - **Trade-off:** While safer against CSRF, LocalStorage is highly vulnerable to **XSS**. If an attacker can run a script, they can steal the token entirely.

### E. CSRF in Native Mobile Apps

Native mobile applications (iOS/Android) that use custom API clients are typically **not** vulnerable to CSRF because:

- They usually use `Authorization: Bearer <token>` headers instead of cookies.
- They do not have a "browser" that automatically attaches credentials to cross-site requests.
- **Risk:** If the mobile app uses a `WebView` to render parts of the application and relies on cookies within that WebView, it becomes vulnerable just like a standard web app.

---

## 5. The Golden Rule: Use GET only for Reading

> [!IMPORTANT]
> **GET requests must be idempotent and should NEVER perform state-changing operations (Create, Update, or Delete).**

While it is technically possible to perform any CRUD operation using a GET request (by passing parameters in the URL), doing so is a major security risk because:

- **Automatic Execution:** Browsers, email clients, and search engine crawlers can execute GET requests automatically (e.g., pre-fetching links or loading images).
- **No Token Protection:** Anti-CSRF tokens are usually not applied to GET requests by design (as GET should be safe).
- **History & Logs:** GET parameters are stored in browser history, server logs, and Referer headers, exposing sensitive data.

**Correct Usage:**

- **GET:** Use only to **READ** or **FETCH** information (e.g., `view_profile`, `search_items`).
- **POST/PUT/PATCH/DELETE:** Use for any action that **MODIFIES** data (e.g., `update_password`, `transfer_funds`, `delete_account`).

---

## 6. How to Test for CSRF

### A. Manual Verification

1.  **Create a simple HTML page:** Host a local HTML file with a form that points to your target API.
    ```html
    <form action="http://your-app.com/api/update" method="POST">
      <input type="hidden" name="email" value="hacker@evil.com" />
      <input type="submit" value="Test CSRF" />
    </form>
    ```
2.  **Login to your app:** Open your application in a separate tab and log in.
3.  **Trigger the form:** Click the submit button on your test HTML page.
4.  **Check Result:** If the API successfully updates your data, the app is vulnerable.

### B. Automated Testing

- **OWASP ZAP / Burp Suite:** Use these tools to generate CSRF PoC (Proof of Concept) forms automatically for any request.
- **Security Scanners:** Tools like Snyk, GitHub Advanced Security, or specialized DAST scanners can detect missing CSRF tokens in forms.

---

## 8. CSRF vs. XSS vs. Clickjacking

It is common to confuse these three browser-based attacks. Here is a quick comparison:

| Feature              | CSRF                                                              | XSS (Cross-Site Scripting)                                                | Clickjacking (UI Redressing)                                                            |
| :------------------- | :---------------------------------------------------------------- | :------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------- |
| **Mechanism**        | Exploits **session trust** (browser sends cookies automatically). | Exploits **content trust** (attacker injects malicious JS into the page). | Exploits **UI layers** (attacker overlays a transparent iframe over a legitimate site). |
| **Goal**             | Execute a **request** on behalf of the user.                      | Execute **script** in the user's browser.                                 | Trick user into **clicking** a button/link on a target site.                            |
| **User Interaction** | Low (visiting a malicious site or clicking a link).               | Low to Medium.                                                            | High (user must click a specific spot).                                                 |
| **Primary Defense**  | Anti-CSRF Tokens, SameSite Cookies.                               | Content Security Policy (CSP), Output Encoding.                           | `frame-ancestors` (CSP), `X-Frame-Options`.                                             |

---

## 9. Safe Points & Best Practices

1.  **Strictly limit GET to "Read-Only":** Never allow a GET request to update a database or change application state.
2.  **Use Anti-CSRF Tokens:** Implement them for all POST, PUT, PATCH, and DELETE requests.
3.  **Set SameSite=Lax or Strict:** Configure your session cookies with appropriate `SameSite` attributes.
4.  **User Interaction for Sensitive Actions:** For high-value transactions (like changing passwords or transferring large sums), require re-authentication, MFA, or a CAPTCHA.
5.  **Verify Origin/Referer Headers:** While they can be spoofed or omitted, checking `Origin` and `Referer` headers can provide an additional layer of defense.
