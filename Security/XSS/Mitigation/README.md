# XSS Mitigation Strategies

To build a secure application, you must use **Defense in Depth**. This means applying multiple layers of security so that even if one layer fails (e.g., you forget to encode one variable), other layers (like CSP) protect your users.

---

## 🏗️ The 2-Tier Defense Model

### Tier 1: Primary Defenses (Prevention)

These stop the injection from happening in the first place.

| Strategy                    | When to Use                              | Implementation                                | Pitfall                                                    |
| :-------------------------- | :--------------------------------------- | :-------------------------------------------- | :--------------------------------------------------------- |
| **1. Output Encoding**      | **Always.** For all user data.           | Use `.textContent` or `{{data}}` (React/Vue). | Forgetting to encode inside HTML attributes or JS strings. |
| **2. HTML Sanitization**    | When you **MUST** render rich text.      | Use **DOMPurify**.                            | Using a simple regex or a custom "un-escaper."             |
| **3. Attribute Validation** | For links (`<a>`) and sources (`<img>`). | Check if URL starts with `https://`.          | Allowing `javascript:` or `data:` protocols.               |

### Tier 2: Secondary Defenses (Containment)

These limit the damage if an injection somehow slips through.

| Strategy              | Why it's needed                           | Implementation                        | Pitfall                                             |
| :-------------------- | :---------------------------------------- | :------------------------------------ | :-------------------------------------------------- |
| **1. Strict CSP**     | Blocks unauthorized scripts from running. | `Content-Security-Policy` header.     | Using `'unsafe-inline'` or a broad whitelist (`*`). |
| **2. Secure Cookies** | Prevents session theft via JS.            | `HttpOnly`, `Secure`, `SameSite=Lax`. | Not setting these on sensitive session/auth tokens. |
| **3. Avoid `eval()`** | Eliminates the easiest execution path.    | Use `JSON.parse()` or logic maps.     | Thinking `setTimeout(string)` is safe.              |

---

## 🚦 Mitigation Decision Guide

1.  **Is it simple text?** (e.g., Username, Comment body)
    - **Action**: Use **Output Encoding** (`.textContent`).
2.  **Is it formatted HTML?** (e.g., Blog post editor, Email body)
    - **Action**: Use **Sanitization** (DOMPurify).
3.  **Is it a URL?** (e.g., Profile link, Redirect param)
    - **Action**: **Validate Protocol** (Whitelisting `https`).
4.  **Do you have sensitive cookies?**
    - **Action**: Set **`HttpOnly`** flag.
5.  **Want a safety net?**
    - **Action**: Implement a **Strict CSP**.

---

## 🎯 Context-Aware Encoding (Context is King)

Simple HTML encoding (`<` to `&lt;`) is not enough if the data is placed in different parts of the page.

| Context            | Example Location                          | Risk                        | Safe Action                                                        |
| :----------------- | :---------------------------------------- | :-------------------------- | :----------------------------------------------------------------- |
| **HTML Body**      | `<div>{{input}}</div>`                    | `<script>alert(1)</script>` | HTML Entity Encode (`&lt;`).                                       |
| **HTML Attribute** | `<input value="{{input}}">`               | `" onmouseover="alert(1)"`  | Attribute Encode (Escape quotes).                                  |
| **JavaScript**     | `<script>var val = "{{input}}";</script>` | `"; alert(1); //`           | **Never** put user data here. Use `JSON.parse` or data-attributes. |
| **URL Parameter**  | `<a href="/search?q={{input}}">`          | `&bad_param=1`              | URL Encode (`%20`).                                                |

---

## 🛡️ Beyond Code: Essential Security Headers

XSS defense isn't just about your code; it's about how you configure your server.

1.  **`Content-Security-Policy`**: (See our [Deep Dive](./CSP-header.md)).
2.  **`X-Content-Type-Options: nosniff`**: Prevents the browser from "sniffing" a file's type. This stops an attacker from uploading a `.txt` file containing JS and forcing the browser to run it.
3.  **`X-Frame-Options: DENY`**: Prevents Clickjacking (redundant if using CSP `frame-ancestors`).
4.  **`Set-Cookie: ... SameSite=Lax`**: Limits the reach of an XSS attack by preventing cookies from being sent in cross-site requests.

---

## 🚩 Common Pitfalls (Updated)

- **"I use `replace('<', '&lt;')`"**: This is context-blind. It won't save you if the attacker breaks out of a quoted attribute or a JS string.
- **Sanitizing on Input**: **Never do this.** If you sanitize on input, you might escape characters for HTML, but then if you later use that data in a PDF generator or a CLI tool, the data is corrupted or still dangerous. **Always Encode on Output.**

---

## 🧪 Educational Mitigation Examples

- `01-output-encoding.html`: The difference between `innerHTML` and `textContent`.
- `02-dompurify.html`: How to safely render HTML using a sanitizer.
- `03-csp-headers.html`: Using CSP to block inline scripts and unauthorized exfiltration.
- `04-httponly-cookies.html`: Preventing cookie theft even if an XSS attack occurs.
- `05-attribute-validation.html`: Protecting against link-based (`javascript:`) XSS.

---

## 🚀 Live CSP Demo Server

For a real-world look at how CSP headers work, check the `csp-server/` directory.

### How to Run:

1. `cd Security/XSS/Mitigation/csp-server`
2. `npm install && npm start`
3. Visit `http://localhost:3010`

**Key Takeaway**: This demo shows how a single header can block thousands of potential XSS payloads without changing a single line of your frontend code.

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
