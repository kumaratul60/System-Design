# XSS Mitigation Strategies

To build a secure application, you must use **Defense in Depth**. This means applying multiple layers of security so that even if one layer fails, others protect your users.

## Mitigation Deep Dive: Strategy vs. Implementation

For a comprehensive guide on the most powerful defense-in-depth tool, check out the [CSP Deep Dive Guide](./CSP-header.md).

| Strategy | Simple Explanation | Implementation Example |
| :--- | :--- | :--- |
| **1. Output Encoding** | Treat all user data as "text," never as "code." | Use `.textContent` or `.innerText` instead of `.innerHTML`. |
| **2. HTML Sanitization** | If you MUST show HTML, strip out dangerous tags (like `<script>`). | Use a library like **DOMPurify** to clean the HTML string. |
| **3. Content Security Policy (CSP)** | Tell the browser exactly which scripts it is allowed to run. | Set a `Content-Security-Policy` header on your server. |
| **4. Secure Cookies** | Make session tokens invisible to JavaScript. | Use the `HttpOnly` and `Secure` flags when setting cookies. |
| **5. Attribute Validation** | Ensure links and sources start with safe protocols. | Check that a URL starts with `http://` or `https://` (no `javascript:`). |
| **6. Use Modern Frameworks** | Use tools that protect you by default. | React, Vue, and Angular automatically encode data unless forced otherwise. |
| **7. Avoid Dynamic Execution** | **NEVER** use `eval()` or pass strings to `setTimeout`. | Use `JSON.parse()` for data or safe math libraries for calculations. |

---

## Why Avoid `eval()`?
`eval()` is one of the most dangerous functions in JavaScript. It takes any string passed to it and executes it as live code.
*   **Direct Execution:** It doesn't treat input as data; it treats it as a command.
*   **Full Context Access:** A script running via `eval()` has full access to the page's cookies, LocalStorage, and DOM.
*   **High Risk:** It is virtually impossible to make `eval()` secure if even a tiny piece of user-provided input is included in the string.

> **Rule of Thumb:** If you think you need `eval()`, there is almost always a safer way to do it (like using an object lookup or `JSON.parse()`).

---

## Educational Mitigation Examples

These examples demonstrate how to fix the vulnerabilities we explored:

- `01-output-encoding.html`: The difference between `innerHTML` and `textContent`.
- `02-dompurify.html`: How to safely render HTML using a sanitizer.
- `03-csp-headers.html`: Using CSP to block inline scripts and unauthorized exfiltration.
- `04-httponly-cookies.html`: Preventing cookie theft even if an XSS attack occurs.
- `05-attribute-validation.html`: Protecting against link-based (`javascript:`) XSS.

## Live CSP Demo Server (Nodemon + Express)

For a real-world look at how CSP headers work, I have set up a Node.js server in the `csp-server/` directory.

### How to Run:
1. Navigate to the folder: `cd Security/XSS/Mitigation/csp-server`
2. Install dependencies: `npm install`
3. Start the server: `npm start`
4. Open your browser at: `http://localhost:3010`

### What this demonstrates:
- **Allowed Resources**: Only scripts from `'self'` (the same server) will load.
- **Blocked Resources**: External scripts (like Google Analytics) will be blocked unless you explicitly add them to the CSP header in `server.js`.
- **Inline Scripts**: These are blocked by default for security, even if they are inside your HTML.
- **Nodemon Integration**: When you change the CSP header in `server.js`, Nodemon will restart the server so you can see the results immediately.

## General Security Checklist
1. **Never trust the user.**
2. **Encode everything** you display.
3. **Use a strict CSP.**
4. **Flag your cookies** as `HttpOnly`.
5. **Avoid `eval()`** and dynamic code execution at all costs.
