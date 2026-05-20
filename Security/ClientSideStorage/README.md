# Client-Side Storage Security

In modern web applications, storing data on the client side is essential for performance, offline capabilities, and user experience. However, it introduces significant security risks if not handled correctly.

---

## 🚀 Storage Mechanisms Overview

| Feature         | LocalStorage              | SessionStorage       | Cookies                         | IndexedDB                  |
| :-------------- | :------------------------ | :------------------- | :------------------------------ | :------------------------- |
| **Capacity**    | ~5MB - 10MB               | ~5MB                 | < 4KB                           | Significant (GBs)          |
| **Persistence** | Permanent (until cleared) | Tab/Session duration | Configurable (Expiry/Max-Age)   | Permanent                  |
| **Access**      | JavaScript Only           | JavaScript Only      | JS & Server (can be JS-blocked) | JavaScript Only            |
| **Usage**       | UI State, Preferences     | Temporary form data  | Auth Tokens, Session IDs        | Large data, Offline assets |

---

## 📋 Default Quota Cheat Sheet (Chrome/Chromium)

| Storage Type       | Limit Type  | Default Size               | Behavior                                                 |
| :----------------- | :---------- | :------------------------- | :------------------------------------------------------- |
| **LocalStorage**   | **Fixed**   | **~5MB - 10MB**            | Synchronous. Fails with `QuotaExceededError`.            |
| **SessionStorage** | **Fixed**   | **~5MB**                   | Per tab. Lost when tab closes.                           |
| **Cookies**        | **Fixed**   | **4KB per cookie**         | Total ~20KB - 80KB per domain.                           |
| **IndexedDB**      | **Dynamic** | **50MB - 100MB (Initial)** | Can scale up to GBs (80/60 rule) after user interaction. |
| **Cache API**      | **Dynamic** | **~100MB (Initial)**       | Part of the same pool as IndexedDB.                      |

_\*Note: 10GB (10,737,418,240 bytes) is a common default reported by modern Chrome, but the actual limit scales via the 80/60 rule._

---

## 🛡️ Security Mechanisms & Best Practices

> **🔥 Pro-Tip (Interview Gold):** While you might see snippets like `document.cookie = "...; HttpOnly"`, the **HttpOnly** flag **CANNOT** be set via client-side JavaScript. It is a server-side instruction. If you try to set it via `document.cookie`, the browser will ignore the flag for security reasons. It must be sent via the `Set-Cookie` HTTP header from the server.

## 🛡️ Security Mechanisms & Best Practices

Following the **Namaste Frontend System Design** framework, client storage security is divided into five critical pillars:

### 1. Storing Sensitive Data

- **Server-First:** Always prefer storing truly sensitive data (PII, financial info) on the server. The client should only hold a reference (e.g., a token).
- **Encryption:** If you MUST store sensitive data (like a cached email), use the **Web Crypto API (AES-GCM)** to encrypt it before saving.
- **Token Expiry:** Ensure any stored tokens have a short TTL (Time To Live) to minimize the window of opportunity for an attacker.

### 2. Authentication

- **JWT/OAuth:** Store tokens securely. Avoid LocalStorage for high-risk tokens.
- **HttpOnly Cookies:** The gold standard for session tokens. `HttpOnly` prevents JavaScript from accessing the cookie, mitigating **XSS** theft.
- **MFA (Multi-Factor Auth):** Use MFA to add a layer of protection that client-side storage can't provide.

### 3. Data Integrity

- **Checksums (HMAC):** When storing critical configuration or data, store a **checksum (HMAC)** alongside it. Verify the checksum on read to ensure the data hasn't been tampered with by a malicious script or user.

### 4. Storage Limit

- **Quota Management:** Use `navigator.storage.estimate()` to proactively manage space and avoid `QuotaExceededError`.
- **Persistence:** Request `navigator.storage.persist()` for critical app data to prevent the browser from automatically clearing data under disk pressure (LRU eviction).

### 5. Session Management

- **Isolation:** Use `SessionStorage` for data that must not leak across tabs or windows.
- **Cleanup:** Explicitly clear session data on logout (`localStorage.clear()` or `sessionStorage.clear()`) to prevent session fixation.
- **State Sync:** For `LocalStorage`, use the `storage` event listener to sync session state changes across multiple open tabs securely.

---

## ⚠️ Common Pitfalls

1.  **[XSS (Cross-Site Scripting)](../XSS/README.md):** If an attacker injects a script, they can call `localStorage.getItem()` and steal everything.
2.  **CSRF (Cross-Site Request Forgery):** If using cookies without `SameSite=Strict/Lax`, attackers can perform actions on behalf of the user.
3.  **No Expiry in LocalStorage:** Data stays forever, increasing the risk of "Leaked Data" if the device is shared or stolen.
4.  **Storing Secrets:** Never store API Keys, Secrets, or Plain-text Passwords in any client storage.

---

## 💡 Clear Examples

### Bad Practice (LocalStorage for Tokens)

```javascript
// Vulnerable to XSS
localStorage.setItem('authToken', 'highly-sensitive-jwt-token');
```

### Good Practice (Secure Cookies)

```javascript
// Set via Server Response Header
Set-Cookie: session_id=abc123; HttpOnly; Secure; SameSite=Strict;
```

### Better Practice (Encrypted Storage)

```javascript
// Using Web Crypto API (Simplified Concept)
const encryptedData = await encrypt(sensitiveInfo, userKey);
localStorage.setItem('user_pref_enc', encryptedData);
```

---

## ⏳ Advanced Patterns: Expiry & Key Management

### 1. Implementing LocalStorage TTL (Expiry)

LocalStorage does not have a built-in "expires" feature. You must implement a wrapper to manage data lifecycle.

#### Method A: Timestamp Wrapper (Persistent)

Best for data that needs to expire even if the user closes the browser.

```javascript
function setWithExpiry(key, value, ttlInMs) {
  const item = { value, expiry: Date.now() + ttlInMs };
  localStorage.setItem(key, JSON.stringify(item));
}

function getWithExpiry(key) {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;
  const item = JSON.parse(itemStr);
  if (Date.now() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return item.value;
}
```

#### Method B: `setTimeout` Cleanup (Immediate, Non-Persistent)

Best for clearing data automatically during a long-running session. _Note: Timers are lost on refresh._

```javascript
function setWithTimeout(key, value, ttlInMs) {
  localStorage.setItem(key, value);
  setTimeout(() => {
    localStorage.removeItem(key);
  }, ttlInMs);
}
```

### 2. The "Encryption Key" Trap

**NEVER store the encryption key or password in LocalStorage alongside the encrypted data.**

- **Safe Alternatives:** Use User-provided passphrases (memory only), Session-only memory, or an `HttpOnly` Cookie relay.

---

### 🌐 How Chrome/Chromium Calculates Quotas (The 80/60 Rule)

1.  **Global Limit:** Up to **80%** of total disk space shared across all sites.
2.  **Origin Limit:** Up to **60%** of the Global Limit per site.
3.  **Persistence:** Use `navigator.storage.persist()` to prevent LRU (Least Recently Used) eviction.

### 📊 Storage Quota Management (StorageManager API)

```javascript
async function checkStorageQuota() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const { usage, quota } = await navigator.storage.estimate();
    console.log(`Usage: ${(usage / 1024 / 1024).toFixed(2)}MB / ${(quota / 1024 / 1024).toFixed(2)}MB`);
  }
}
```

---

## 💻 Implementation Reference (Real-World Code)

### 1. Data Integrity with HMAC

```javascript
async function generateHMAC(message, secret) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);
  const signature = await crypto.subtle.sign('HMAC', key, data);
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}
```

### 2. Encrypting Sensitive Data (AES-GCM)

```javascript
async function encryptData(text, password) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passwordKey = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt'],
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(text));
  return { encrypted, salt, iv };
}
```

---

## 🍖 Interview Grill

**Q: Why is LocalStorage less secure than Cookies for tokens?**
**A:** XSS can access LocalStorage. `HttpOnly` cookies cannot be accessed by JavaScript.

**Q: What is the 80/60 rule in Chrome?**
**A:** Chrome allows all sites to use 80% of disk, but a single site can only use 60% of that 80%.

**Q: If HttpOnly cookies are secure, why not use them for everything?**
**A:** They are limited to 4KB and sent with every request, hurting performance for large data.

**Q: What is the `QuotaExceededError` and how do you handle it?**
**A:** This occurs when storage is full. Handle it with `try...catch` and an LRU eviction policy, after checking available space via `navigator.storage.estimate()`.

---

## 🔥 Senior/Staff Level "Grill" Questions

### Q1: Why is "IndexedDB" safer for massive data than LocalStorage, beyond just size?

> **Answer:**
>
> 1. **Asynchronous:** LocalStorage is synchronous and blocks the main thread, causing "UI Jank" for large data. IndexedDB is asynchronous.
> 2. **Transaction-based:** IndexedDB supports ACID transactions. If a crash happens during a write, the database remains consistent. LocalStorage can be corrupted if a write is interrupted.
> 3. **Structured Data:** You can store Blobs and Files in IndexedDB without manual serialization.

### Q2: What is "XSS-based Data Extraction" and how do attackers bypass `HttpOnly`?

> **Answer:** `HttpOnly` stops an attacker from reading a cookie. However, it doesn't stop them from **Using** it.
>
> - **The Attack:** If your app stores PII in `LocalStorage` (e.g., `user_settings`), the attacker can read that directly. If you use `HttpOnly` cookies for auth, the attacker can't read the token, but they can still trigger `fetch('/delete-account')` from their malicious script. The browser will automatically attach the `HttpOnly` cookie. This is why you need **CSRF protection** even with `HttpOnly`.

### Q3: Explain the "Persistence Request" in the StorageManager API.

> **Answer:** Browsers normally use "Best-Effort" storage, meaning they will delete your app's data if the disk is full.
>
> - **The Solution:** Call `navigator.storage.persist()`. If granted, the browser promises not to delete your data until the user manually uninstalls the app or clears cache. This is critical for Offline-First PWAs.

### Q4: How do you handle "Sensitive Data" in shared environments (e.g., a Library/Public PC)?

> **Answer:**
>
> 1. **Session-only:** Use `SessionStorage` so data is wiped when the tab closes.
> 2. **Clear-Site-Data:** Send the `Clear-Site-Data: "storage"` header on logout.
> 3. **In-Memory:** Store encryption keys in a plain JS variable (which dies on refresh) and only keep the encrypted blob in storage.

---

## 🔐 Secure Communication (HTTPS)

In Frontend System Design, client-side security is only as strong as the "pipe" through which data travels. HTTPS is the foundational layer for all secure web interactions.

### 🛡️ Core Pillars of HTTPS

1.  **Data Encryption:** Protects the privacy of data being exchanged between the client and server (prevents eavesdropping).
2.  **Authentication:** Uses **SSL/TLS** certificates to verify that the server is who it claims to be.
    - _Note:_ **SSL** (Secure Sockets Layer) is the deprecated predecessor; **TLS** (Transport Layer Security) is the modern, secure standard (e.g., TLS 1.2, 1.3).
3.  **Data Integrity:** Uses **MAC (Message Authentication Code)** to ensure that the data is not modified or corrupted during transit. A MAC is a cryptographic checksum that verifies both the data's integrity and its authenticity.

### 🚀 Beyond Security: The Benefits

- **Search Engine Ranking:** Google and other search engines give an SEO boost to HTTPS-enabled sites.
- **Trust and Reputation:** Eliminates "Not Secure" browser warnings that drive users away.
- **Performance (HTTP/2 & HTTP/3):** Modern web protocols that significantly speed up loading times **require** HTTPS.
- **Compliance:** Essential for meeting standards like PCI-DSS (for payments) and GDPR (for privacy).

### 💡 Use Cases & Examples

- **E-commerce:** Protecting credit card info and user addresses during checkout.
- **HSTS (HTTP Strict Transport Security):** A header that tells the browser to _only_ communicate with the server over HTTPS, even if the user types `http://`.
  ```http
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  ```

### ⚠️ Pitfalls

- **Mixed Content:** Loading images or scripts over `http://` on an `https://` page creates a security hole and causes browser warnings.
- **Expired Certificates:** If the SSL certificate is not renewed, the site becomes inaccessible with a "Connection is not private" error.
- **SSL Stripping:** An attack where a hacker downgrades a connection from HTTPS to HTTP. Mitigated by using HSTS.

---

## 🔍 Quick Deep Dive Q&A

**Q: Can I use `localStorage` safely?**
**A:** Yes, for non-sensitive data like UI themes and preferences.

**Q: How does the `Secure` flag help?**
**A:** It ensures cookies are only sent over HTTPS, preventing MITM sniffing.
