# Subresource Integrity (SRI)

Subresource Integrity (SRI) is a security feature that enables browsers to verify that resources they fetch (for example, from a CDN) are delivered without unexpected manipulation.

## How it Works (The Flow)

When a browser encounters a resource with an `integrity` attribute, it follows these steps:

1.  **Download**: The browser downloads the resource (e.g., from `cdn.b.com`).
2.  **Generate Hash**: The browser generates a cryptographic hash of the downloaded content using the specified algorithm (e.g., `sha256`, `sha384`, or `sha512`).
3.  **Compare**: The browser compares the locally generated hash with the value provided in the `integrity` attribute.
4.  **Execute or Block**: If the hashes match exactly, the browser executes the script or applies the stylesheet. If they do not match, the browser blocks the resource to protect the user.

---

## Key Benefits

- **Protection against Compromised CDNs**: If a 3rd party resource provider (like a CDN) is hacked and the file is replaced with malicious code, the hash will change and the browser will block the attack.
- **Version Consistency**: Prevents accidental updates. If a CDN updates a resource to a new version at the same URL (Eg: version change) without your knowledge, the hash will mismatch, alerting you to the change.

---

## How to Implement SRI

You add the `integrity` and `crossorigin` attributes to your `<script>` or `<link>` tags.

### Example with `<link>` (CSS):

```html
<link
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
  rel="stylesheet"
  integrity="sha384-T3c6Coli6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"
  crossorigin="anonymous"
/>
```

### Example with `<script>` (JS):

```html
<script
  src="https://code.jquery.com/jquery-3.6.0.min.js"
  integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4="
  crossorigin="anonymous"
></script>
```

### Key Attributes:

1.  **`integrity`**: Contains the hash algorithm followed by the base64-encoded hash value.
2.  **`crossorigin="anonymous"`**: **Mandatory** for cross-origin SRI. It ensures the request is made without sending cookies or authentication, which is required for the browser to perform the integrity check.

---

## Generating SRI Hashes

### 1. Online Tools

- [srihash.org](https://www.srihash.org/): Paste a URL to generate the complete tag.

### 2. Command Line (OpenSSL)

```bash
cat filename.js | openssl dgst -sha384 -binary | openssl base64 -A
```

### 3. Build Tools

Many build tools (Webpack, Rollup) have plugins that automatically generate SRI hashes for your assets during the build process.

---

## Senior/Staff Level "Grill" Questions

### Q1: Why does SRI require `crossorigin="anonymous"`?

> **Answer:** SRI works by fetching the file and calculating its hash.
>
> - **The SOP Barrier:** Normally, the **Same-Origin Policy (SOP)** prevents a site from reading the raw bytes of a script from a different domain.
> - **The Fix:** `crossorigin="anonymous"` triggers a **CORS request**. If the CDN responds with `Access-Control-Allow-Origin: *`, the browser is allowed to read the bytes, calculate the hash, and perform the integrity check.
> - **Note:** If you forget `crossorigin`, the SRI check will fail and the script will be blocked.

### Q2: How does SRI handle "Dynamic Scripts" (e.g., Google Analytics or Ads)?

> **Answer:** It doesn't. Dynamic scripts change their content frequently (personalized data, version updates), meaning the hash would break every few hours.
>
> - **The Trade-off:** You cannot use SRI for dynamic 3rd-party trackers.
> - **The Defense:** For these, you must rely on a strong **Content-Security-Policy (CSP)** to restrict what those scripts can do and where they can send data.

### Q3: What is the "SRI Fallback" pattern?

> **Answer:** If a CDN is down or a hash mismatches, your site might break.
>
> - **The Solution:** A small inline script can detect if a required library (like jQuery) failed to load and then try to load a **local fallback** version.
>
> ```html
> <script src="https://cdn.com/jquery.js" integrity="..." crossorigin="anonymous"></script>
> <script>
>   window.jQuery || document.write('<script src="/js/jquery.min.js"><\/script>');
> </script>
> ```

### Q4: Can SRI protect against a "Compromised Developer Machine"?

> **Answer:** No. SRI protects against the **Delivery Channel** (the CDN) being compromised. If a developer's machine is infected and they commit malicious code _before_ the hash is generated, the SRI hash will simply reflect that malicious code, and the browser will execute it without warning.
>
> - **The Defense:** Use **Signed Commits (GPG)** and **Code Reviews** to protect the integrity of the source code.

---

## SRI and Browser Support

SRI is supported by all modern browsers. If a browser doesn't support SRI, it simply ignores the `integrity` attribute and loads the script normally, so it is a **progressive enhancement** with no downside for older browsers.

---

## Summary Checklist

- [ ] Use SRI for all third-party scripts and styles (CDNs).
- [ ] Always include the `crossorigin="anonymous"` attribute.
- [ ] Ensure the CDN provider supports CORS (sends `Access-Control-Allow-Origin`).
- [ ] Prefer `sha384` or `sha512` for higher security.
