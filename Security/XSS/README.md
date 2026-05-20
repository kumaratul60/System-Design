# Cross-Site Scripting (XSS)

Cross-Site Scripting (XSS) is a critical security vulnerability where an attacker injects malicious scripts into a trusted website. When a victim visits the site, the browser executes the script, thinking it came from a legitimate source.

## 🔴 Why This Matters (The Business Impact)

XSS is consistently in the **OWASP Top 10** because its impact can be devastating:

- **Identity Theft:** Stealing session cookies to hijack user accounts.
- **Financial Loss:** Redirecting users to phishing sites or initiating unauthorized transactions.
- **Data Breaches:** Scraping sensitive information displayed on the page (PII, API keys).
- **Reputational Damage:** Defacing the website or spreading misinformation under your brand's name.

---

## 🗺️ Learning Roadmap

This documentation is split into two main sections: **Vulnerability** (how it works) and **Mitigation** (how to stop it).

### 1. [Vulnerability Suite](./Vulnerability/README.md)

_Understand the enemy to build better defenses._

- **Core Concepts**: Learn the difference between Stored, Reflected, and DOM-based XSS.
- **Modern Delivery**: Read the [Modern XSS Delivery Guide](./Vulnerability/Modern_XSS_Delivery.md) to see how attacks bypass simple filters.
- **Hands-on Labs**: 12 interactive demos covering everything from **Session Hijacking** to **Eval Injection**.

### 2. [Mitigation Suite](./Mitigation/README.md)

_Build a "Defense in Depth" fortress._

- **Strategic Defenses**: Learn when to use **Encoding** vs. **Sanitization**.
- **CSP Deep Dive**: Master the [CSP Deep Dive Guide](./Mitigation/CSP-header.md) for the ultimate browser-level protection.
- **Live Demo**: Run the [CSP Express Server](./Mitigation/csp-server/server.js) to see real-time resource blocking.
- **Practical Fixes**: 5 interactive examples showing how to apply modern security primitives.

---

## 🚀 The Golden Rules of XSS Defense

| Rule                      | Action                                                | Why?                                                       |
| :------------------------ | :---------------------------------------------------- | :--------------------------------------------------------- |
| **1. Never Trust Input**  | Treat all user-provided data as malicious by default. | Entry points are everywhere (URLs, DB, Headers).           |
| **2. Encode on Output**   | Use `.textContent`, not `.innerHTML`.                 | Prevents the browser from parsing data as executable code. |
| **3. Sanitize Rich Text** | Use **DOMPurify** for HTML rendering.                 | Safely strips dangerous tags while preserving layout.      |
| **4. Use a Strict CSP**   | Set a strong `Content-Security-Policy`.               | Acts as a "fail-safe" if your code has an injection bug.   |
| **5. Protect Sessions**   | Use `HttpOnly` and `Secure` cookie flags.             | Makes session tokens inaccessible to JavaScript.           |

---

## 🔥 Senior/Staff Level "Grill" Questions

### Q1: What is "Trusted Types" and why is it the "Final Boss" of DOM XSS defense?

> **Answer:** Even with sanitization, a developer can still accidentally use a dangerous sink like `element.innerHTML = data`.
>
> - **The Solution:** **Trusted Types** is a browser primitive that _disables_ dangerous sinks. If you try to pass a raw string to `innerHTML`, the browser throws an error.
> - **Mechanism:** You must create a **Policy** that produces a "TrustedHTML" object. Only these objects can be passed to sinks. This moves security from "Remembering to sanitize" to "Enforced by the browser."

### Q2: Nonce-based CSP vs. Hash-based CSP: Which one do you choose for a large-scale SPA?

> **Answer:**
>
> - **Hash-based:** Great for static sites (SSG). You hash the script content and put it in the header.
> - **Nonce-based:** Best for dynamic apps (SSR/CSR). You generate a cryptographically strong random number (nonce) on every request, add it to the CSP header, and to the `<script nonce="...">` tag.
> - **Staff Tip:** For SPAs, use **`strict-dynamic`** with a nonce. This allows a "trusted" root script to dynamically load other scripts without needing a giant whitelist of domains.

### Q3: Explain "Mutation XSS" (mXSS) and why standard regex filters fail.

> **Answer:** mXSS occurs when an attacker provides "Malformed HTML" that looks safe to a filter (like `<div><noscript><p title="</noscript><img src=x onerror=alert(1)>">`) but is "mutated" by the browser's parser into executable code when assigned to `innerHTML`.
>
> - **The Defense:** Never use regex for HTML security. Only use **DOM-aware sanitizers** like **DOMPurify** which understand how the browser's parser behaves.

### Q4: If you use `HttpOnly` cookies, is your site "Safe" from XSS?

> **Answer:** No. `HttpOnly` only stops the attacker from _stealing_ the session token. They can still perform **Session Riding**: while the victim is on your site, the malicious script can use `fetch()` to perform actions on the victim's behalf (e.g., delete an account, change an email) because the browser automatically attaches those `HttpOnly` cookies to the requests.
>
> - **The Takeaway:** `HttpOnly` limits the _damage_ of XSS, but it doesn't _prevent_ the attack.

---

## 🏗️ Project Structure

```text
Security/XSS/
├── README.md               <-- You are here
├── Vulnerability/          <-- "The Attack Surface"
│   ├── README.md           <-- Detailed impact & payloads
│   ├── Modern_XSS_Delivery.md
│   └── [01-11]-examples.html
└── Mitigation/             <-- "The Defensive Layers"
    ├── README.md           <-- Strategy vs Implementation
    ├── CSP-header.md       <-- Master class on CSP
    ├── [01-05]-examples.html
    └── csp-server/         <-- Live Node.js Demo
```
