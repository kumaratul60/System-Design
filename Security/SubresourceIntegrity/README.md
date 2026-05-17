# Subresource Integrity (SRI)

Subresource Integrity (SRI) is a security feature that enables browsers to verify that resources they fetch (for example, from a CDN) are delivered without unexpected manipulation.

## The Problem: Compromised CDNs

Many websites load common libraries like jQuery, Bootstrap, or FontAwesome from public CDNs. If an attacker gains access to the CDN, they can inject malicious code into those libraries, leading to a massive XSS attack on all websites using that CDN.

## The Solution: SRI

With SRI, you provide a cryptographic hash of the file you expect. The browser fetches the file, calculates its hash, and compares it to the hash you provided. If they don't match, the browser refuses to execute the script or apply the stylesheet.

---

## How to Implement SRI

You add the `integrity` attribute to your `<script>` or `<link>` tags.

### Example with `<script>` tag:

```html
<script
  src="https://code.jquery.com/jquery-3.6.0.min.js"
  integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4="
  crossorigin="anonymous"
></script>
```

### Key Attributes:

1.  **`integrity`**: Contains the hash algorithm (e.g., `sha256`, `sha384`, `sha512`) followed by the base64-encoded hash value.
2.  **`crossorigin="anonymous"`**: Required for SRI to work on cross-origin requests. It tells the browser to fetch the resource without sending user credentials (cookies).

---

## Generating SRI Hashes

### 1. Online Tools

- [srihash.org](https://www.srihash.org/): Paste a URL to generate the SRI tag.

### 2. Command Line (OpenSSL)

```bash
cat filename.js | openssl dgst -sha384 -binary | openssl base64 -A
```

### 3. Build Tools

Many build tools (Webpack, Rollup) have plugins that automatically generate SRI hashes for your assets during the build process.

---

## SRI and Browser Support

SRI is supported by all modern browsers. If a browser doesn't support SRI, it simply ignores the `integrity` attribute and loads the script normally, so it is a **progressive enhancement** with no downside for older browsers.

## Summary Checklist

- [ ] Use SRI for all third-party scripts and styles (CDNs).
- [ ] Use `crossorigin="anonymous"` attribute.
- [ ] Ensure your server/CDN sends the correct CORS headers (`Access-Control-Allow-Origin`).
- [ ] Prefer `sha384` or `sha512` for stronger security.
