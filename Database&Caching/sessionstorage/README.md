# SessionStorage Architecture & Mechanics

SessionStorage is a transient, synchronous client-side key-value storage API provided by modern web browsers. It is designed to persist data only for the duration of a specific page session (tab lifecycle), presenting unique isolation boundaries, security constraints, and performance implications at the Senior/Staff level.

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

### String-Only Serialization

The storage engine strictly accepts and stores strings.

- If non-string primitives or structured objects are passed directly (e.g., `sessionStorage.setItem('config', { theme: 'dark' })`), the JavaScript engine automatically coerces them to strings via `.toString()`. This transforms the object into the useless string `"[object Object]"`.
- To store structured data, you must serialize it using `JSON.stringify(data)` on write and deserialize using `JSON.parse(string)` on read.

---

## 2. Page Session Lifecycle & Isolation Boundaries

Unlike LocalStorage and cookies, SessionStorage has highly specific context rules that dictate how data is isolated and destroyed.

### A. Tab-Bound Scope

- A unique page session is created whenever a document is loaded in a particular tab or window.
- The session is valid **only for that specific tab**.
- Opening multiple tabs or windows with the exact same URL creates a completely separate, isolated `sessionStorage` context for each tab. Tab A cannot read or write to the SessionStorage of Tab B, even if they share the exact same origin.

### B. Persistence over Reloads & Restores

- A page session lasts as long as the tab or the browser is open.
- SessionStorage **survives page reloads and refreshes** (clicking the refresh button does not clear the session).
- SessionStorage **survives tab restores**. If the browser crashes and restores the session, or if the user recovers a recently closed tab (e.g., `Ctrl+Shift+T` / `Cmd+Shift+T`), the SessionStorage data is restored.

### C. Tab Duplication Behavior (Copy-on-Write)

- Duplicating an active tab (via browser right-click -> Duplicate) or programmatically opening a new window under the same origin via `window.open(url)` creates a **new session with the value of the top-level browsing context**.
- This copies the parent tab's SessionStorage into the new tab.
- Crucially, once duplicated, the two storage objects are **fully decoupled (copy-on-write)**. Mutations made in the parent tab are not reflected in the duplicated tab, and vice versa.
- Conversely, copying the URL and pasting it into a new, manually opened tab or window creates a brand-new, empty SessionStorage context.

### D. Protocol & Origin Sensitivity

- SessionStorage is governed by the **Same-Origin Policy** (SOP) and is scoped strictly by origin (scheme + domain + port).
- Scoped by protocol: Data stored by a script on a site accessed via HTTP (e.g., `http://example.com`) is placed in a different SessionStorage object from the same site accessed via HTTPS (e.g., `https://example.com`), preventing data leakage across secure and insecure protocols.

### E. Nested Browsing Contexts (Iframes)

- Embedded `iframe` elements of the **same origin** inside a parent page share the exact same SessionStorage database instance as the parent page.
- Consequently, if the parent page or the iframe mutates a key, it will trigger the window `storage` event in the other document, provided they are in the same tab. This is the **only** scenario where the sessionStorage `storage` event fires.

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

- Just like LocalStorage, SessionStorage operations run **synchronously on the browser's main thread**.
- While SessionStorage writes are typically written to in-memory transient caches rather than hitting disk hardware directly on every write, browsers still serialize and validate quotas synchronously. Large JSON stringification/parsing operations block layout execution and can lead to frame drops (jank) if run inside high-frequency event loops.

### B. Web Worker & Service Worker Unavailability

- Because SessionStorage is bound to the window context and operates synchronously, it is **completely unavailable inside Web Workers, Service Workers, or Worklets**.
- If background synchronization or offline service worker assets require cached state, developers must use **IndexedDB** or the **Cache Storage API**.

### C. WebKit/Safari 7-Day Storage Eviction (ITP)

- Under Apple's Intelligent Tracking Prevention (ITP) rules (introduced in iOS 13.4/Safari 13.1), writable client-side storage is subject to automatic eviction.
- If a website has not received user interaction (clicks, taps, form submissions) for 7 days of active browser use, Safari will **permanently delete all client-side storage** for that origin. This includes SessionStorage if the tab is restored after 7 days of inactivity.

---

## 4. Limits & Exceptions

- **5MB Origin Quota:** Standard browsers restrict SessionStorage to **5MB per Origin per Tab**.
- **QuotaExceededError:** If you attempt to write a key that exceeds the remaining space, the browser throws a `QuotaExceededError` DOMException.
- **Closing Tab vs. Closing Browser:**
  - Closing the specific tab ends the session and immediately purges its SessionStorage database.
  - Closing the entire browser window containing the tab ends the session. However, some browsers with active "session restore" settings might cache this data temporarily to restore the tab on relaunch.
- **Incognito/Private Browsing**: Modern browsers partition incognito/private tabs into separate, temporary in-memory SessionStorage databases. Data is available during the private session (surviving reloads) but is instantly deleted when the private tab or window is closed.

---

## 5. Security Risks & Mitigations (Staff-Level Focus)

Because SessionStorage is a JavaScript-accessible client-side API, it has severe security limitations.

### A. Storage Limit (Denial of Service)

An attacker exploiting a script injection vector can execute an infinite write loop to saturate the 5MB quota. This locks up storage and crashes application tasks that depend on saving layouts or UI configurations. Size tracking and fallback mechanisms protect storage availability.

> [!NOTE]
> **The Session Eviction Caveat**: In LocalStorage, when a `QuotaExceededError` is thrown, we can programmatically evict old caches (e.g., LRU eviction). In SessionStorage, however, automatic eviction is dangerous. SessionStorage is typically used to hold critical session-specific flow states (like active form fields). Evicting keys automatically could corrupt the active user flow, which is why dropping to an in-memory Map fallback is preferred over automatic eviction.

### B. No HttpOnly Protection (XSS Exposure)

SessionStorage has **no equivalent to the HttpOnly cookie flag**. Any JavaScript executing on the origin (including malicious code injected via Cross-Site Scripting (XSS), compromised third-party SDKs, or supply-chain npm vulnerabilities) can read all data in SessionStorage via `window.sessionStorage`.

- **Is SessionStorage safer than LocalStorage?**
  - **Yes, marginally.** Because SessionStorage is automatically cleared when the tab is closed, it minimizes the duration of exposure on the client's device. It also prevents data leaks in shared-device/kiosk environments since logging out or closing the tab destroys the session database.
  - **No, fundamentally.** During the active session, a running XSS attack can read SessionStorage just as easily as LocalStorage. Storing credentials or access tokens in SessionStorage remains an anti-pattern.

### C. The Encryption Key Fallacy

Encrypting data in SessionStorage before saving it is a false security boundary. Since the decryption logic and key must exist in JavaScript memory (or be fetched dynamically from the server) to decrypt the data on the client side, a malicious script running via XSS can intercept the key, intercept the decryption function, or simply wait for the data to be decrypted and read it from memory.

### D. Session Expiry & Inactivity Timeout

Unlike cookies, SessionStorage does not support time-based expiration. It lasts exactly as long as the tab/window session. If a user walks away from an open tab in a public library, the data persists. To mitigate this, developers must implement a **custom programmatic inactivity timeout** (TTL) in JavaScript, tracking user activity and purging SessionStorage if no interaction is detected within a sliding window (e.g., 15 minutes).

> [!CAUTION]
> **XSS Vulnerability remains active:** Storing credentials or access tokens in SessionStorage is still an anti-pattern. While it protects against physical shared-device snooping after tab closure, it does not defend against active XSS attacks during the session.

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

The following type-safe TypeScript implementation handles feature detection, fallback to an in-memory Map store when storage is disabled, automatic JSON serialization, and a **sliding inactivity timeout** to enforce session expiry.

```typescript
type StorageValue<T> = {
  data: T;
  lastAccess: number; // timestamp in milliseconds for sliding inactivity check
};

export class SafeSessionStorage {
  private static isAvailable: boolean | null = null;
  // Fallback in-memory store if SessionStorage is disabled or blocked
  private static memoryFallback: Map<string, string> = new Map();
  // Sliding inactivity timeout (default: 15 minutes)
  private static inactivityTimeoutMs: number = 15 * 60 * 1000;

  // 1. Feature Detection (verifies write, read, and deletion capabilities)
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
      // Fallback to in-memory store to prevent application failure
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

      // Check if session item has expired due to inactivity
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
