# Cookie Architecture & Security Mechanics

HTTP cookies are small, key-value client-side data blocks managed by the browser. Unlike LocalStorage and SessionStorage, cookies are designed to be transmitted automatically between the client and server on **every matching HTTP network request**, introducing unique security controls and network performance implications at the Senior/Staff level.

- **Key Takeaway**: Cookies are the industry standard for secure authorization (session IDs, tokens) when protected with `HttpOnly`, `Secure`, and `SameSite` flags. However, they should never be used for storing large datasets or general user preferences due to their tight size limits and request-header overhead.

---

## 1. Core API & Mechanics

Cookies are structured as key-value string pairs separated by semicolons and can be initialized either from the server or the client.

### A. Server-Side Creation: The `Set-Cookie` Header

The primary way to establish cookies is via the HTTP response header:

```http
HTTP/1.1 200 OK
Set-Cookie: session_id=xyz123; Secure; HttpOnly; SameSite=Strict; Path=/; Domain=example.com; Max-Age=86400
```

### B. Client-Side Access: `document.cookie`

If not protected by security flags, client-side JavaScript can write and read cookies:

- **Writing**: `document.cookie = "username=JohnDoc; Max-Age=3600; Path=/;"`
- **Reading**: Accessing `document.cookie` returns a single string of all active key-value pairs (e.g., `"session_id=xyz123; username=JohnDoc"`). JavaScript must parse this string manually to extract individual values.

### C. Data Structure & Limitations

- **Key-Value String**: Data must be stored as URL-encoded strings (`encodeURIComponent`/`decodeURIComponent`).
- **4KB Size Limit**: Browsers restrict each individual cookie to **4KB** (keys + values + attributes).
- **Domain Limitations**: Browsers limit the total number of cookies per domain (typically **50 to 180** total cookies). Exceeding this limit results in the browser silently evicting the oldest cookies.

---

## 2. Lifecycles: Session vs. Persistent Cookies

A cookie's lifecycle is dictated by the presence or absence of expiration attributes:

### A. Session Cookies

- **Behavior**: If no expiration attribute is defined, the cookie is treated as a session cookie.
- **Expiration**: Purged automatically when the browser session ends (typically when the browser window or matching tab is closed).

### B. Persistent Cookies

- **Behavior**: If expiration parameters are defined, the cookie survives browser restarts and is stored on the client's local drive.
- **Expiration Controls**:
  - **`Expires=<date>`**: Sets an absolute GMT/UTC timestamp (e.g., `Expires=Wed, 21 Oct 2026 07:28:00 GMT`).
  - **`Max-Age=<seconds>`**: Sets a relative duration in seconds (e.g., `Max-Age=3600` for 1 hour). **`Max-Age` is preferred** in modern applications because it avoids client-side system clock skew bugs.

---

## 3. Scoping & Routing Boundaries

Unlike Web Storage APIs which are strictly bound to the exact origin (scheme + domain + port), cookies use a different, more flexible scoping model:

### A. Domain Attribute

- **Scoping**: Dictates which domains can receive the cookie.
- **If Omitted**: Scoped strictly to the host domain that set it (e.g., if set by `app.example.com`, it is **not** sent to `blog.example.com`).
- **If Defined**: Scoped to the domain and all its subdomains (e.g., setting `Domain=example.com` makes it accessible to `app.example.com`, `blog.example.com`, and `example.com`).

### B. Path Attribute

- **Scoping**: resticts the cookie to specific request paths (e.g., `Path=/api` sends the cookie to `/api/v1` but not to `/home`).
- **If Omitted**: Defaults to the path of the document context that set it.

### C. Secure Flag

- **Scoping**: Restricts cookie transmission to HTTPS secure connections only, protecting against packet sniffing and Man-in-the-Middle (MitM) attacks.

---

## 4. The Network Performance Bottleneck

Because cookies are sent on **every matching HTTP request** (including AJAX, HTML documents, CSS files, JavaScript scripts, images, and API calls), they carry massive performance trade-offs:

- **Header Bloat**: If an origin stores 10 cookies totaling 4KB, every asset fetch transfers an extra 4KB of request header data.
- **Upstream Bandwidth Squeeze**: Users on mobile devices with slow upload speeds suffer significant latencies during page loads, as request headers are sent before asset responses are fetched.
- **CDN Architectural Mitigation**: To bypass this overhead, static assets (images, JS, CSS) should be served from **Cookie-Free Domains** (e.g., hosting static files on a separate CDN domain like `example-cdn.com` rather than `static.example.com`, ensuring no cookie headers are attached to static fetches).

---

## 5. Security Architecture (Staff-Level Focus)

Cookies provide advanced security flags that make them far safer than LocalStorage or SessionStorage for holding authorization keys.

### A. `HttpOnly` Flag (XSS Defense)

- **Mechanism**: Prevents client-side scripts from reading or writing the cookie via `document.cookie`.
- **Impact**: If an XSS vulnerability occurs, the attacker cannot read the `HttpOnly` token from JavaScript. While the browser still attaches the cookie to requests, it prevents simple script-based session hijacking.

### B. `SameSite` Attribute (CSRF Defense)

SameSite controls whether cookies are attached to cross-site requests, mitigating Cross-Site Request Forgery (CSRF) attacks:

- **`SameSite=Strict`**: The cookie is sent **only** if the request originates from the same site. Clicking a link to `example.com` from `facebook.com` will **not** attach the session cookie.
- **`SameSite=Lax`**: (Modern Browser Default) The cookie is withheld on cross-site subresource requests (images, iframes) but is attached during top-level navigations (clicking a link).
- **`SameSite=None`**: The cookie is sent on all cross-site requests. **Requires the `Secure` flag to be active**.

### C. Cookie Prefixes (`__Host-` and `__Secure-`)

Subdomain takeovers can pollute or overwrite root cookies. To prevent this, modern browsers enforce strict rules on cookies named with prefixes:

- **`__Secure-` Prefix**:
  - Must be set with the `Secure` flag.
  - Must be sent from a secure origin (HTTPS).
- **`__Host-` Prefix** (The most secure configuration):
  - Must be set with the `Secure` flag.
  - Must NOT define a `Domain` attribute (restricts the cookie strictly to the host domain, preventing subdomains from overwriting or reading it).
  - Must define `Path=/` (accessible across the entire host).

### D. Subdomain Cookie Tossing (Shadow Session Hijacking)

- **The Vulnerability**: If a subdomain (e.g., `attacker.example.com`) is compromised, scripts running on it can write a wildcard cookie for the parent domain (`example.com`).
- **The Exploit**: When the user requests the secure parent domain (`example.com`), the browser receives two cookies with the same name (one from `example.com` and the shadowed one from `attacker.example.com`). The server might read the shadowed attacker session ID instead, leading to session hijacking.
- **Mitigation**: Use the `__Host-` prefix on all critical cookies to prohibit subdomains from setting cookies on parent contexts.

### E. Server-Side Data Wiping: The `Clear-Site-Data` Header

The standard HTTP response header **`Clear-Site-Data`** instructs the browser to wipe client-side data (cookies, storage, cache) associated with the requesting origin. This is a critical security practice for user logout workflows.

#### 1. Syntax Constraints & Core Rules

- **Double Quotes Required**: Directives **MUST** be wrapped in double quotes. A header value like `Clear-Site-Data: cookies` (without quotes) is invalid and will be silently ignored by the browser.
- **HTTPS Only**: Browsers will ignore this header if delivered over insecure HTTP connections.
- **Comma-Separated**: Multiple directives should be comma-separated.
- **Case-Sensitivity**: Values are case-sensitive and must be entirely lowercase.

```http
# Correct Syntax (All standard types)
Clear-Site-Data: "cookies", "storage", "cache", "executionContexts"

# Correct Syntax (Wildcard shortcut)
Clear-Site-Data: "*"

# INCORRECT Syntax (Will fail - no quotes)
Clear-Site-Data: cookies, storage
```

#### 2. Supported Directives (Key-Value Keymap)

| Directive                 | Type                    | Browser Support     | Detailed Behavior & Data Wiped                                                                                                                                                                       |
| :------------------------ | :---------------------- | :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`"cookies"`**           | Standard                | All Modern Browsers | Clears all cookies associated with the requesting origin. Wipes domain cookies, subdomain cookies, and HTTP authentication credentials (e.g., Basic/Digest auth).                                    |
| **`"storage"`**           | Standard                | All Modern Browsers | Clears all local storage engines under the origin, including:<br>• `localStorage`<br>• `sessionStorage`<br>• IndexedDB<br>• Web SQL database<br>• File System API<br>• Service Worker registrations  |
| **`"cache"`**             | Standard                | All Modern Browsers | Wipes the browser's HTTP cache, Cache Storage API, stylesheet/script caches, prefetch cache, and memory caches.                                                                                      |
| **`"executionContexts"`** | Standard                | All Modern Browsers | Terminates active execution contexts under the origin by reloading all open tabs/iframes matching the origin, closing active WebSocket connections, and shutting down active service worker scripts. |
| **`"clientHints"`**       | Experimental (Chromium) | Chrome, Edge, Opera | Clears the saved preferences for Client Hints (like device pixel ratio, viewport width, User-Agent parameters) sent to the origin.                                                                   |
| **`"*"`**                 | Wildcard                | All Modern Browsers | Wipes **all** types of client-side data for the origin, including future standard directives. (Equivalent to declaring `"cookies", "storage", "cache", "executionContexts"` together).               |

#### 3. Production Best Practice (Secure Logout Response)

When a user triggers a logout, the backend server should send the wildcard header along with strict cache controls to ensure that back-button caching does not expose sensitive user data:

```http
HTTP/1.1 200 OK
Clear-Site-Data: "*"
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
```

---

## 6. When to Use vs. When Not to Use

| When to Use (Best Practices)                                                                          | When NOT to Use (Anti-Patterns)                                                                                   |
| :---------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| **Authentication Session IDs** (Must use `HttpOnly`, `Secure`, and `SameSite=Lax/Strict` attributes). | **Large Client-side Datasets** (Saturates bandwidth; use `IndexedDB` instead).                                    |
| **JWT Refresh Tokens** (HttpOnly cookies keep long-lived tokens protected from script environments).  | **Client-only Application State** (e.g., UI panels toggle status; use state managers or LocalStorage).            |
| **CSRF Tokens** (Double-submit cookie validation methods).                                            | **Sensitive Data in Plaintext** (Always sign or encrypt server-read cookie payloads to prevent client tampering). |

---

## 7. Code Implementation: `SafeCookie`

The following TypeScript implementation provides a helper wrapper to read, write, and delete client-side cookies safely.

```typescript
type CookieOptions = {
  path?: string;
  domain?: string;
  maxAge?: number; // duration in seconds
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
};

export class SafeCookie {
  // 1. Write Cookie
  public static set(key: string, value: string, options: CookieOptions = {}): boolean {
    try {
      let cookieString = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;

      if (options.path) {
        cookieString += `; path=${options.path}`;
      } else {
        cookieString += '; path=/'; // Default path to root
      }

      if (options.domain) {
        cookieString += `; domain=${options.domain}`;
      }

      if (options.maxAge !== undefined) {
        cookieString += `; max-age=${options.maxAge}`;
      }

      if (options.secure) {
        cookieString += '; secure';
      }

      if (options.sameSite) {
        cookieString += `; samesite=${options.sameSite}`;
      } else {
        cookieString += '; samesite=Lax'; // Default to safe SameSite attribute
      }

      document.cookie = cookieString;
      return true;
    } catch (e) {
      console.error('Failed to write cookie:', e);
      return false;
    }
  }

  // 2. Read Cookie
  public static get(key: string): string | null {
    try {
      const cookies = document.cookie ? document.cookie.split('; ') : [];
      const prefix = `${encodeURIComponent(key)}=`;

      for (const cookie of cookies) {
        if (cookie.startsWith(prefix)) {
          return decodeURIComponent(cookie.substring(prefix.length));
        }
      }
      return null;
    } catch (e) {
      console.error('Failed to read cookie:', e);
      return null;
    }
  }

  // Alternative Regex-based Read (Faster for large cookie headers)
  public static getViaRegex(key: string): string | null {
    try {
      const escapedKey = key.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1');
      const matches = document.cookie.match(new RegExp(`(?:^|; )${encodeURIComponent(escapedKey)}=([^;]*)`));
      return matches ? decodeURIComponent(matches[1]) : null;
    } catch (e) {
      console.error('Regex cookie parse failed:', e);
      return null;
    }
  }

  // 3. Delete Cookie
  public static remove(key: string, path: string = '/', domain?: string): boolean {
    try {
      // Deleting a cookie requires setting its max-age to 0 or expiration to the past
      let deleteString = `${encodeURIComponent(key)}=; path=${path}; max-age=0`;

      if (domain) {
        deleteString += `; domain=${domain}`;
      }

      document.cookie = deleteString;
      return true;
    } catch (e) {
      console.error('Failed to remove cookie:', e);
      return false;
    }
  }

  // 4. Erase Cookie (Alias of remove)
  public static erase(key: string, path: string = '/', domain?: string): boolean {
    return this.remove(key, path, domain);
  }

  // 5. Update Cookie (Only updates if cookie already exists)
  public static update(key: string, value: string, options: CookieOptions = {}): boolean {
    if (this.get(key) === null) {
      console.warn(`Cookie "${key}" does not exist. Aborting update.`);
      return false;
    }
    return this.set(key, value, options);
  }

  // 6. Search Cookies (Finds all cookies whose keys match a query string or regex pattern)
  public static search(pattern: string | RegExp): { key: string; value: string }[] {
    const results: { key: string; value: string }[] = [];
    try {
      const cookies = document.cookie ? document.cookie.split('; ') : [];
      const regex =
        typeof pattern === 'string'
          ? new RegExp(pattern.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1'), 'i')
          : pattern;

      for (const cookie of cookies) {
        const parts = cookie.split('=');
        const key = decodeURIComponent(parts[0]);
        const value = parts[1] ? decodeURIComponent(parts[1]) : '';

        if (regex.test(key)) {
          results.push({ key, value });
        }
      }
    } catch (e) {
      console.error('Failed to search cookies:', e);
    }
    return results;
  }

  // 7. Find Cookie (Returns first cookie matching a custom predicate function)
  public static find(predicate: (key: string, value: string) => boolean): { key: string; value: string } | null {
    try {
      const cookies = document.cookie ? document.cookie.split('; ') : [];

      for (const cookie of cookies) {
        const parts = cookie.split('=');
        const key = decodeURIComponent(parts[0]);
        const value = parts[1] ? decodeURIComponent(parts[1]) : '';

        if (predicate(key, value)) {
          return { key, value };
        }
      }
    } catch (e) {
      console.error('Failed to find cookie:', e);
    }
    return null;
  }
}
```
