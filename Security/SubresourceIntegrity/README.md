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

## SRI and Browser Support

SRI is supported by all modern browsers. If a browser doesn't support SRI, it simply ignores the `integrity` attribute and loads the script normally, so it is a **progressive enhancement** with no downside for older browsers.

---

## Summary Checklist

- [ ] Use SRI for all third-party scripts and styles (CDNs).
- [ ] Always include the `crossorigin="anonymous"` attribute.
- [ ] Ensure the CDN provider supports CORS (sends `Access-Control-Allow-Origin`).
- [ ] Prefer `sha384` or `sha512` for higher security.
