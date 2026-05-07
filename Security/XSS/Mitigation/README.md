# XSS Mitigation Strategies

To build a secure application, you must use **Defense in Depth**. This means applying multiple layers of security so that even if one layer fails, others protect your users.

## Mitigation Deep Dive: Strategy vs. Implementation

| Strategy                             | Simple Explanation                                                 | Implementation Example                                                     |
| :----------------------------------- | :----------------------------------------------------------------- | :------------------------------------------------------------------------- |
| **1. Output Encoding**               | Treat all user data as "text," never as "code."                    | Use `.textContent` or `.innerText` instead of `.innerHTML`.                |
| **2. HTML Sanitization**             | If you MUST show HTML, strip out dangerous tags (like `<script>`). | Use a library like **DOMPurify** to clean the HTML string.                 |
| **3. Content Security Policy (CSP)** | Tell the browser exactly which scripts it is allowed to run.       | Set a `Content-Security-Policy` header on your server.                     |
| **4. Secure Cookies**                | Make session tokens invisible to JavaScript.                       | Use the `HttpOnly` and `Secure` flags when setting cookies.                |
| **5. Attribute Validation**          | Ensure links and sources start with safe protocols.                | Check that a URL starts with `http://` or `https://` (no `javascript:`).   |
| **6. Use Modern Frameworks**         | Use tools that protect you by default.                             | React, Vue, and Angular automatically encode data unless forced otherwise. |

---

## Educational Mitigation Examples

These examples demonstrate how to fix the vulnerabilities we explored:

- `01-output-encoding.html`: The difference between `innerHTML` and `textContent`.
- `02-dompurify.html`: How to safely render HTML using a sanitizer.
- `03-csp-headers.html`: Using CSP to block inline scripts and unauthorized exfiltration.
- `04-httponly-cookies.html`: Preventing cookie theft even if an XSS attack occurs.
- `05-attribute-validation.html`: Protecting against link-based (`javascript:`) XSS.

## General Security Checklist

1. **Never trust the user.**
2. **Encode everything** you display.
3. **Use a strict CSP.**
4. **Flag your cookies** as `HttpOnly`.
