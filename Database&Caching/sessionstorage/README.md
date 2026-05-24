# SessionStorage Architecture & Mechanics

SessionStorage is a transient, synchronous client-side key-value storage API provided by modern web browsers. It is designed to persist data only for the duration of a specific page session (tab lifecycle), presenting unique isolation boundaries, security constraints, and performance implications at the Senior/Staff level.

- **Key Takeaway**: SessionStorage is ideal for storing transient, tab-specific state (e.g., active page states in a multi-step form) that should be destroyed automatically when the tab closes. It is not a secure vault and is vulnerable to XSS.

- **Interactive Playgrounds**:
  - **[SessionStorage Architectural Playground & Monitor](./index.html)**
  - **[SessionStorage Todo CRUD Application](./todo.html)**

---

## 1. Core API & Mechanics

SessionStorage is exposed via the global `window.sessionStorage` object, which implements the same `Storage` interface as LocalStorage.

### Core Interface

- `sessionStorage.setItem(key, value)`: Stores or updates a key-value pair.
- `sessionStorage.getItem(key)`: Retrieves the string value associated with the key. Returns `null` if the key does not exist.
- `sessionStorage.removeItem(key)`: Deletes the key-value pair from storage.
- `sessionStorage.clear()`: Empties all key-value pairs associated with the session for the current origin.
- `sessionStorage.length`: Returns the number of keys stored.
- `sessionStorage.key(index)`: Returns the name of the key at the specified index.

### String-Only Serialization Gotchas

- **Automatic Coercion**: The storage engine strictly accepts strings. If you pass an object directly (e.g., `sessionStorage.setItem('config', { theme: 'dark' })`), the browser coerces it to `"[object Object]"`, destroying the data.
- **Manual Serialization**: You must serialize via `JSON.stringify` on write and deserialize via `JSON.parse` on read. Both operations run synchronously and block the main thread.

---

## 2. Page Session Lifecycle & Isolation Boundaries

Unlike LocalStorage and cookies, SessionStorage has highly specific context rules that dictate how data is isolated and destroyed.

### A. Tab-Bound Scope

- **Strict Tab Boundaries**: A unique page session is created whenever a document is loaded in a tab. The session is valid **only for that specific tab**.
- **Zero Cross-Tab Sync**: Opening multiple tabs with the exact same URL creates completely separate, isolated `sessionStorage` contexts. Tab A cannot read or write to the SessionStorage of Tab B, even if they share the same origin.

### B. Persistence over Reloads & Restores

- **Survives Refreshes**: SessionStorage survives page reloads, refreshes, and browser crashes if the tab is restored.
- **Wiped on Close**: Closing the specific tab ends the session and purges its SessionStorage database.

### C. Tab Duplication Behavior (Copy-on-Write)

- **Context Cloning**: Duplicating an active tab (via browser right-click -> Duplicate) or programmatically opening a window via `window.open(url)` copies the parent's SessionStorage to the new tab.
- **Decoupled States**: Once cloned, the two storage objects are **fully decoupled (copy-on-write)**. Mutations in the parent tab are not reflected in the child tab, and vice versa.
- **Paste Navigation**: Manually copying the URL and pasting it into a new tab starts a brand-new, empty SessionStorage context.

### D. Protocol & Origin Sensitivity

- **SOP Scoping**: SessionStorage is governed by the Same-Origin Policy (SOP).
- **Protocol Scoping**: Data stored under HTTP (`http://example.com`) is placed in a separate SessionStorage instance from HTTPS (`https://example.com`), preventing data leakage across secure and insecure protocols.

### E. Nested Browsing Contexts (Iframes)

- **Shared Tab Context**: Embedded `iframe` elements of the **same origin** inside a parent page share the exact same SessionStorage database instance as the parent page.
- **Storage Event Sync**: If the parent page or the iframe mutates a key, it triggers the window `storage` event in the other document.

#### Storage Event Dispatch Mechanics

To understand the **Nested Contexts (Iframes)** behavior, we have to look at how the browser decides when to fire a `storage` event.

##### 1. The Core Rule of the `storage` Event

By default, the browser fires the `storage` event under one main condition:

> _"Fire this event in every other document window of the same origin, except the single window context that made the change."_

This is designed to prevent infinite loops (where a tab modifies storage, receives its own event, modifies it again, and triggers itself recursively forever).

##### 2. What happens in a Normal Multi-Tab setup?

If you have two separate browser tabs open to your app (Tab A and Tab B):

- Tab A writes to storage: `sessionStorage.setItem('theme', 'dark')`
- Tab A receives **no** event.
- Tab B receives **no** event because SessionStorage is strictly isolated to each tab context.

##### 3. What happens in a Single-Tab Iframe setup?

```
+----------------------------------------------------+
|  Browser Tab (Same Origin: https://example.com)    |
|                                                    |
|  Parent Window (parent.html)                       |
|   |                                                |
|   |  [writes to sessionStorage]                    |
|   v                                                |
|  +----------------------------------------------+  |
|  |  Embedded Iframe (iframe.html)               |  |
|  |                                              |  |
|  |  [Receives "storage" Event!]                 |  |
|  +----------------------------------------------+  |
+----------------------------------------------------+
```

- The parent page and embedded same-origin iframe are separate document contexts inside the same tab. If the parent page writes to SessionStorage, the embedded iframe **receives the `storage` event** (and vice-versa).
- **Why this is uniquely crucial for SessionStorage**: Since SessionStorage is strictly isolated to its tab, separate tabs (e.g., Tab B) will never receive a SessionStorage event from Tab A. However, because same-origin iframes share the same tab context, they share the exact same SessionStorage database instance. Therefore, this same-tab iframe scenario is the **only** case in all of web development where a `storage` event fires for `sessionStorage`.

### F. Comparative Matrix: SessionStorage vs. LocalStorage vs. Session Cookies

| Dimension                   | SessionStorage                         | LocalStorage                                           | Session Cookies                                           |
| :-------------------------- | :------------------------------------- | :----------------------------------------------------- | :-------------------------------------------------------- |
| **Persistence / Lifecycle** | Cleared when the tab/window is closed. | Permanent (until manually cleared or browser-evicted). | Cleared when the browser session ends (unless persisted). |
| **Isolation Scope**         | Strictly bound to the active tab.      | Shared across all tabs of the same origin.             | Shared across all tabs of the same origin.                |
| **Size Limit**              | ~5MB per origin, per tab context.      | ~5MB per origin.                                       | ~4KB per cookie.                                          |
| **API Sync Type**           | Synchronous (blocking).                | Synchronous (blocking).                                | Synchronous (accessed via `document.cookie`).             |
| **Sent on HTTP Requests?**  | No.                                    | No.                                                    | Yes, automatically on matching scope.                     |
| **Web Workers Access**      | No.                                    | No.                                                    | Yes (via Cookie Store API).                               |

---

## 3. Deep Technical & Architectural Details (Staff-Level Focus)

### A. The Synchronous Blocking Problem

- **Main Thread Blocking**: SessionStorage operations run synchronously on the main thread.
- **UI Jank**: Although writes hit in-memory transient caches first, browsers serialize and validate quotas synchronously. Large JSON operations block layout execution, causing frame drops (jank) inside high-frequency loops.

### B. Web Worker & Service Worker Unavailability

- **Scope Restriction**: Because SessionStorage is bound to the window context, it is **completely unavailable inside Web Workers, Service Workers, or Worklets**.
- **PWA Alternative**: Offline synchronization or background operations requiring cached state must use **IndexedDB** or the **Cache Storage API**.

### C. WebKit/Safari 7-Day Storage Eviction (ITP)

- **The Rule**: Under Apple's Intelligent Tracking Prevention (ITP) rules, if a website receives no user interaction for 7 days of active browser use, Safari will **permanently delete all client-side storage** for that origin. This includes SessionStorage if the tab is restored after 7 days of inactivity.

---

## 4. Limits & Exceptions

- **5MB Origin Quota**: Standard browsers restrict SessionStorage to **5MB per Origin per Tab**.
- **QuotaExceededError**: Writing past the limit throws a `QuotaExceededError` DOMException.
- **Incognito/Private Browsing**: Modern browsers partition private tabs into separate, temporary in-memory SessionStorage databases. Data is available during the private session (surviving reloads) but is instantly deleted when the private tab or window is closed.

---

## 5. Security Risks & Mitigations (Staff-Level Focus)

Because SessionStorage is a JavaScript-accessible client-side API, it has severe security limitations.

### A. Storage Limit (Denial of Service)

An attacker exploiting a script injection vector can execute an infinite write loop to saturate the 5MB quota. This locks up storage and crashes application tasks that depend on saving layouts or UI configurations. Size tracking and fallback mechanisms protect storage availability.

> [!NOTE]
> **The Session Eviction Caveat**: In LocalStorage, when a `QuotaExceededError` is thrown, we can programmatically evict old caches (e.g., LRU eviction). In SessionStorage, however, automatic eviction is dangerous. SessionStorage is typically used to hold critical session-specific flow states (like active form fields). Evicting keys automatically could corrupt the active user flow, which is why dropping to an in-memory Map fallback is preferred over automatic eviction.

### B. No HttpOnly Protection (XSS Exposure)

SessionStorage has **no equivalent to the HttpOnly cookie flag**. Any JavaScript executing on the origin (via XSS, compromised third-party SDKs, or npm package vulnerabilities) can read all data in SessionStorage.

- **Is SessionStorage safer than LocalStorage?**
  - **Yes, marginally**: Because it's cleared when the tab is closed, it minimizes the duration of exposure on the device and prevents data leaks in public kiosk/shared-device environments.
  - **No, fundamentally**: During the active session, a running XSS attack can read SessionStorage just as easily as LocalStorage. Storing credentials or access tokens remains an anti-pattern.

> [!CAUTION]
> **XSS Vulnerability remains active:** Storing credentials or access tokens in SessionStorage is still an anti-pattern. While it protects against physical shared-device snooping after tab closure, it does not defend against active XSS attacks during the session.

### C. Storage DoS & Eviction Mitigations

- **Saturating Quotas**: Attackers can run infinite write loops to saturate the 5MB quota, crashing application tasks.
- **The Session Eviction Caveat**: In LocalStorage, when a `QuotaExceededError` is thrown, we can programmatically evict old caches (e.g., LRU eviction). In SessionStorage, however, automatic eviction is dangerous because it is used for critical active flow states (e.g. form fields). Evicting keys automatically could corrupt user flow, which is why falling back to an in-memory Map fallback is preferred.

### D. The Encryption Key Fallacy

Encrypting data in SessionStorage is a false security boundary. Since the decryption logic and key must exist in JavaScript memory to read the data, an XSS exploit can capture the key or read the data from memory after decryption.

### E. Session Expiry & Inactivity Timeout

Unlike cookies, SessionStorage does not support time-based expiration. It lasts exactly as long as the tab is open. If a user leaves a tab open on a public terminal, the data persists. Developers must implement a **custom programmatic inactivity timeout** (TTL) in JavaScript, tracking user activity and purging SessionStorage if no interaction is detected within a sliding window (e.g., 15 minutes).

---

## 6. When to Use vs. When Not to Use

| When to Use (Best Practices)                                                                                                     | When NOT to Use (Anti-Patterns)                                                                                   |
| :------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| **Tab-specific layout state** (e.g., active page tab in a dashboard, search filter query on the current screen).                 | **Session IDs & Auth Tokens** (vulnerable to XSS; use secure, `HttpOnly`, `SameSite=Strict/Lax` cookies instead). |
| **Multi-step wizard forms** (maintaining user inputs across page reloads in case of accidental refresh before final submission). | **Large datasets** (causes main-thread blocking; use `IndexedDB` instead).                                        |
| **Transient UI data** that should definitely be wiped when the tab is closed.                                                    | **Cross-tab state sharing** (SessionStorage is isolated per tab; use LocalStorage or BroadcastChannel instead).   |
| **Temporary analytics state** correlation for a single browsing session.                                                         | **Long-term caching** of static assets.                                                                           |

---

## 7. Code Implementation: `SafeSessionStorage`

The following TypeScript implementation handles feature detection, fallback to an in-memory Map store when storage is disabled, automatic JSON serialization, and a **sliding inactivity timeout** to enforce session expiry.

```typescript
type StorageValue<T> = {
  data: T;
  lastAccess: number; // timestamp in milliseconds for sliding inactivity check
};

export class SafeSessionStorage {
  private static isAvailable: boolean | null = null;
  private static memoryFallback: Map<string, string> = new Map();
  private static inactivityTimeoutMs: number = 15 * 60 * 1000; // Default: 15 minutes

  // 1. Feature Detection
  public static checkAvailability(): boolean {
    if (this.isAvailable !== null) return this.isAvailable;
    try {
      const testKey = '__session_storage_test__';
      window.sessionStorage.setItem(testKey, testKey);
      const testVal = window.sessionStorage.getItem(testKey);
      window.sessionStorage.removeItem(testKey);
      this.isAvailable = testVal === testKey;
    } catch (e) {
      this.isAvailable = false;
    }
    return this.isAvailable;
  }

  // Configure inactivity timeout dynamically
  public static setInactivityTimeout(ms: number): void {
    this.inactivityTimeoutMs = ms;
  }

  // 2. Safe Write with Serialization
  public static setItem<T>(key: string, value: T): boolean {
    const record: StorageValue<T> = {
      data: value,
      lastAccess: Date.now(),
    };

    const serializedValue = JSON.stringify(record);

    if (!this.checkAvailability()) {
      this.memoryFallback.set(key, serializedValue);
      return true;
    }

    try {
      window.sessionStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      if (
        error instanceof DOMException &&
        (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED' || error.code === 22)
      ) {
        console.warn(`SessionStorage quota exceeded on key "${key}"! Falling back to memory storage.`);
      } else {
        console.error('Failed to write to SessionStorage:', error);
      }
      this.memoryFallback.set(key, serializedValue);
      return false;
    }
  }

  // 3. Safe Read with Automated Deserialization and Inactivity Expiry
  public static getItem<T>(key: string): T | null {
    let rawValue: string | null = null;

    if (this.checkAvailability()) {
      rawValue = window.sessionStorage.getItem(key);
    } else {
      rawValue = this.memoryFallback.get(key) || null;
    }

    if (!rawValue) return null;

    try {
      const record = JSON.parse(rawValue) as StorageValue<T>;
      const currentTime = Date.now();

      if (currentTime - record.lastAccess > this.inactivityTimeoutMs) {
        console.warn(`SessionStorage item for key "${key}" expired due to inactivity.`);
        this.removeItem(key);
        return null;
      }

      // Update last access timestamp for sliding expiration
      this.setItem(key, record.data);

      return record.data;
    } catch (error) {
      console.error(`Failed to parse SessionStorage item for key "${key}":`, error);
      return null;
    }
  }

  // 4. Safe Deletion
  public static removeItem(key: string): boolean {
    this.memoryFallback.delete(key);
    if (!this.checkAvailability()) return true;
    try {
      window.sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove SessionStorage item "${key}":`, error);
      return false;
    }
  }

  // 5. Safe Clear All
  public static clear(): boolean {
    this.memoryFallback.clear();
    if (!this.checkAvailability()) return true;
    try {
      window.sessionStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear SessionStorage:', error);
      return false;
    }
  }
}
```
