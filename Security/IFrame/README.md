# IFrame Security & Usage Guide

This project is a comprehensive educational resource for understanding IFrame mechanics, cross-window communication, and advanced security protections against web vulnerabilities.

---

## 📑 Table of Contents

1. [Core Concepts](#1-core-concepts)
2. [Vulnerabilities](#2-vulnerabilities)
3. [Modern Mitigations (Implementation)](#3-modern-mitigations)
4. [Deep Dive: postMessage Communication](#4-deep-dive-windowpostmessage)
5. [Deep Dive: Sandbox Security & Risks](#5-deep-dive-sandbox-security--risks)
6. [Deep Dive: Secure Cookie Attributes](#6-deep-dive-secure-cookie-attributes)
7. [Legacy Techniques: Frame Busting](#7-legacy-techniques-frame-busting)
8. [Usage Guidelines](#8-usage-guidelines)
9. [Security Checklist](#9-security-checklist)
10. [Testing the Demo](#testing-the-demo)

---

## 🚀 Getting Started

### 1. Structure

- **ParentServer (Port 3000)**: The main site that embeds the iframe.
- **ChildServer (Port 4000)**: The application being embedded.

### 2. Running the Demo

```bash
npm install
npm run start:parent   # Terminal 1
npm run start:child    # Terminal 2
```

Access the dashboard at [http://localhost:3000](http://localhost:3000).

---

## 1. Core Concepts

An `<iframe>` (Inline Frame) allows you to embed another HTML document inside your current page.

- **The Sandbox Model**: Browsers enforce the **Same-Origin Policy (SOP)**. By default, a Parent cannot access the Child's DOM (and vice-versa) unless they share the exact same domain, protocol, and port.
- **The Bridge**: For cross-origin communication, we use the `window.postMessage` API.

---

## 2. Vulnerabilities

### A. Clickjacking (UI Redressing)

An attacker overlays a transparent iframe of your site over a decoy page. Users think they are clicking a "Win a Prize" button but are actually clicking a hidden "Delete Account" button on your site.

### B. Data Theft via JS (Cross-Frame Scripting)

If the Parent and Child are on the same domain, or if SOP is bypassed, a malicious script can use `contentWindow.document` to steal PII, session tokens, or private page content.

### C. Session Hijacking

If a site doesn't use `SameSite` cookie attributes, an attacker can embed your site in an iframe to perform authenticated actions on behalf of a user who is already logged into your service.

---

## 3. Modern Mitigations

### A. Content-Security-Policy (CSP): `frame-ancestors`

The modern standard. It allows you to list exactly which domains are allowed to embed your site.

- **Express.js (Middleware):**
  ```javascript
  app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://trusted.com");
    next();
  });
  ```
- **Nginx:** `add_header Content-Security-Policy "frame-ancestors 'self'";`
- **Apache:** `Header always set Content-Security-Policy "frame-ancestors 'self'"`

### B. X-Frame-Options (XFO)

A legacy but widely used header for simple framing control.

> [!NOTE]
> **Precedence**: If both `X-Frame-Options` and `CSP: frame-ancestors` are present, **CSP takes precedence** in modern browsers. XFO is only used by older browsers that don't support CSP.

- **Implementation:**
  - `res.setHeader('X-Frame-Options', 'DENY');` (Block all)
  - `res.setHeader('X-Frame-Options', 'SAMEORIGIN');` (Internal only)

### C. The `sandbox` Attribute

Added by the **Parent** to restrict the child's capabilities.

```html
<iframe src="https://child.com" sandbox="allow-scripts allow-forms" title="Safe Frame"></iframe>
```

---

## 4. Deep Dive: `window.postMessage`

The only safe way to communicate between windows of different origins.

### Sending (The Sender)

```javascript
const frame = document.getElementById('childFrame');
frame.contentWindow.postMessage('Data', 'http://localhost:4000');
```

> [!IMPORTANT]
> Never use `*` as the target origin. Always specify the exact expected domain.

### Receiving (The Listener)

```javascript
window.addEventListener('message', (event) => {
  if (event.origin !== 'http://localhost:3000') return; // 🛑 Critical Origin Check
  console.log('Safe data:', event.data);
});
```

---

## 5. Deep Dive: Sandbox Security & Risks

The `sandbox` attribute is powerful, but certain flag combinations create a **"Danger Zone"**.

### The Escape Vulnerability

If you combine `allow-scripts` and `allow-same-origin` on an iframe that points to your **own domain**, the iframe can:

1. Access the parent's DOM.
2. Remove its own sandbox attribute.
3. Completely take over the parent page.

**Best Practice:** Never use these two flags together if the `src` is on your same domain.

---

## 6. Deep Dive: Secure Cookie Attributes

Your cookies determine how a browser handles sessions within an iframe.

```javascript
res.cookie('sessionID', '12345', {
  httpOnly: true, // 🛑 Blocks JS access (Prevents XSS theft)
  secure: true, // 🔒 Only sent over HTTPS
  sameSite: 'strict', // 🚪 Never sent in a cross-site iframe
});
```

| sameSite Value | IFrame Behavior                               |
| :------------- | :-------------------------------------------- |
| **Strict**     | Cookie is **never** sent in an iframe.        |
| **Lax**        | Sent only on top-level navigation (Standard). |
| **None**       | Sent in all frames (Requires `Secure: true`). |

---

## 7. Legacy Techniques: Frame Busting

Before headers existed, developers used "Frame Busting" scripts:

```javascript
if (top != self) {
  top.location = self.location;
}
```

**Why it's Legacy:** It can be blocked by the `sandbox` attribute (missing `allow-top-navigation`) and is less reliable than browser-level headers (CSP/XFO).

---

## 8. Usage Guidelines

### ✅ Safe to Use

- **Third-party widgets**: YouTube, Maps, Chatbots.
- **Isolating Content**: Rendering untrusted HTML in a sandboxed frame.
- **Secure Payments**: Embedding fields from Stripe/PayPal.

### ❌ Avoid Use

- **Sensitive Actions**: Any page with "Delete," "Submit," or "Pay" buttons.
- **Site Navigation**: Primary menus should never be in iframes (Accessibility/SEO risk).

---

## Senior/Staff Level "Grill" Questions

### Q1: Why is `X-Frame-Options` being deprecated in favor of CSP `frame-ancestors`?

> **Answer:** `X-Frame-Options` is a coarse, page-level header with only two real options (DENY or SAMEORIGIN).
>
> - **The CSP Advantage:** `frame-ancestors` is much more granular. It allows you to specify a **Whitelist** of trusted domains (e.g., `frame-ancestors 'self' https://partner.com`).
> - **Precedence:** Modern browsers prioritize CSP. If both are present, the browser ignores `X-Frame-Options`.

### Q2: Explain the "Double-Framing" attack and how to prevent it.

> **Answer:** An attacker embeds a "decoy" iframe, which then embeds your target iframe. Sometimes simple frame-busting scripts only check the immediate parent (`window.parent`), which the attacker controls.
>
> - **The Fix:** Use `window.top` to check the absolute highest window in the hierarchy. However, the true defense is **CSP `frame-ancestors 'self'`**, which the browser enforces regardless of the nesting depth.

### Q3: How do you secure `window.postMessage` in a production environment?

> **Answer:** `postMessage` is a common source of XSS and data leaks.
>
> 1. **Target Origin:** Never use `*`. Always specify the exact domain of the receiver.
> 2. **Sender Origin:** The listener **MUST** verify `event.origin` against a whitelist before processing the data.
> 3. **Data Schema:** Treat `event.data` as **Untrusted User Input**. Sanitize it using a library like **Zod** or **DOMPurify** before using it in the DOM or an `eval`-like sink.

### Q4: What is the "Sandbox Escape" and how does it happen?

> **Answer:** This occurs when the `sandbox` attribute is misconfigured.
>
> - **The Vulnerability:** Combining `allow-scripts` and `allow-same-origin` on an iframe from the **same origin** as the parent.
> - **The Result:** The script in the iframe can reach out, access the parent's `document`, and programmatically remove its own `sandbox` attribute or steal the parent's cookies.

---

## 9. Security Checklist

### 🛡️ For the Child (Being Embedded)

- [ ] Set `Content-Security-Policy: frame-ancestors 'self'`.
- [ ] Use `X-Frame-Options: SAMEORIGIN` for legacy support.
- [ ] Set cookies to `SameSite=Strict` or `Lax`.
- [ ] Verify `event.origin` in all `window.addEventListener('message')` calls.

### 🛡️ For the Parent (Doing the Embedding)

- [ ] Always add a descriptive `title` attribute.
- [ ] Apply the `sandbox` attribute with minimal necessary flags.
- [ ] Use strict `targetOrigin` in `postMessage`.
- [ ] Verify `event.origin` when receiving messages.

---

## 10. Testing the Demo

The Child server (Port 4000) provides several endpoints to test these protections:

- `http://localhost:4000/`: Allowed (No headers).
- `http://localhost:4000/secure-xfo`: Blocked via `X-Frame-Options: DENY`.
- `http://localhost:4000/secure-csp`: Blocked via `Content-Security-Policy: frame-ancestors 'none'`.
- `http://localhost:4000/secure-sameorigin`: Blocked if the origin doesn't match via `X-Frame-Options: SAMEORIGIN`.
