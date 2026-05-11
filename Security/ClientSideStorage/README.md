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

| Storage Type       | Limit Type  | Default Size          | Behavior                                        |
| :----------------- | :---------- | :-------------------- | :---------------------------------------------- |
| **LocalStorage**   | **Fixed**   | **~5MB - 10MB**       | Synchronous. Fails with `QuotaExceededError`.   |
| **SessionStorage** | **Fixed**   | **~5MB**              | Per tab. Lost when tab closes.                  |
| **Cookies**        | **Fixed**   | **4KB**               | Per cookie. Total ~20 cookies per domain.       |
| **IndexedDB**      | **Dynamic** | **~10GB** (Default)\* | Asynchronous. Can store GBs if disk allows.     |
| **Cache API**      | **Dynamic** | **~10GB** (Default)\* | Used by Service Workers. Part of the same pool. |

_\*Note: 10GB (10,737,418,240 bytes) is a common default reported by modern Chrome, but the actual limit scales via the 80/60 rule._

---

## 🛡️ Security Mechanisms & Best Practices

Based on the core principles of Frontend System Design, here are the "Safe Points" for client storage:

### 1. Storing Sensitive Data

- **Server-First:** Always prefer storing truly sensitive data (PII, financial info) on the server. The client should only hold a reference (e.g., a token).
- **Encryption:** If you MUST store sensitive data (like a cached email), use the **Web Crypto API** to encrypt it before saving.
- **Token Expiry:** Ensure any stored tokens have a short TTL (Time To Live) to minimize the window of opportunity for an attacker.

### 2. Authentication Security

- **JWT/OAuth:** Store tokens securely. Avoid LocalStorage for high-risk tokens.
- **HttpOnly Cookies:** The gold standard for session tokens. `HttpOnly` prevents JavaScript from accessing the cookie, mitigating **XSS** theft.
- **MFA (Multi-Factor Auth):** Use MFA to add a layer of protection that client-side storage can't provide.

### 3. Data Integrity

- **Checksums:** When storing critical configuration or data, store a **checksum (HMAC)** alongside it. Verify the checksum on read to ensure the data hasn't been tampered with by a malicious script or user.

---

## ⚠️ Common Pitfalls

1.  **XSS (Cross-Site Scripting):** If an attacker injects a script, they can call `localStorage.getItem()` and steal everything.
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

## 🔍 Quick Deep Dive Q&A

**Q: Can I use `localStorage` safely?**
**A:** Yes, for non-sensitive data like UI themes and preferences.

**Q: How does the `Secure` flag help?**
**A:** It ensures cookies are only sent over HTTPS, preventing MITM sniffing.
