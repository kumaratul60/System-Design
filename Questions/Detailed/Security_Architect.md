# Security Architect Interview Grill (Staff/Architect Level)

This guide focuses on high-level security architecture, defense-in-depth strategies, and complex trade-offs. It is designed for interviewing Senior Staff Engineers or Architects.

---

## 1. Architecture & Defense-in-Depth

**Q: How would you design a defense-in-depth strategy for a large-scale Micro-Frontends (MFE) application?**

**Answer:**
A defense-in-depth strategy for MFEs must be applied at multiple layers:

1.  **Network Layer:** Implement strict CORS policies at the API Gateway level. Use HSTS with preloading to ensure all traffic is encrypted.
2.  **Application Header Layer:** Standardize security headers (CSP, Permissions-Policy, X-Content-Type-Options) across all MFEs via a shared middleware or proxy config.
3.  **Sandbox Layer:** Use the `sandbox` attribute on iframes (if using iframe-based MFEs) to restrict script execution and form submission. For module-based MFEs, use CSP to restrict script sources.
4.  **Auth Layer:** Centralize authentication (OIDC/OAuth2) so individual MFEs don't handle credentials. Use scoped tokens (claims) to enforce least-privilege access.
5.  **Build Layer:** Implement Subresource Integrity (SRI) for shared vendor bundles and use dependency scanning (e.g., Snyk, npm audit) to prevent supply chain attacks.

---

## 2. Authentication & Identity Management

**Q: We are moving to a stateless JWT-based authentication. What are the primary security trade-offs, and how do you handle token revocation/logout?**

**Answer:**

- **Trade-offs:** Stateless JWTs reduce database load and simplify scaling but are "self-contained," meaning they can't be easily invalidated once issued.
- **The Revocation Problem:** Since the server doesn't keep session state, a "logout" on the client doesn't actually stop the token from being valid on the server until it expires.
- **Solutions:**
  1.  **Short TTLs + Refresh Tokens:** Give access tokens a very short life (5-15 mins) and use a database-backed refresh token to issue new ones. You can "revoke" the refresh token to stop future access.
  2.  **Blacklisting (The "Hybrid" approach):** Store a list of revoked JWT IDs (jti) in a fast cache like Redis. The server checks this list on every request. This re-introduces a bit of state but is much lighter than a full session DB.
  3.  **Version/Grace Period:** Increment a `user_version` field in the DB. When a user logs out or changes their password, all tokens with an older version are rejected.

---

## 3. Data Privacy (PII) & Compliance

**Q: Scenario: A developer accidentally logs user emails and SSNs in plain text to an external logging service (Splunk/Datadog). How do you fix this and prevent it from happening again?**

**Answer:**

1.  **Immediate Remediation:** Rotate any leaked secrets. Purge the logs from the external service immediately. Notify the Data Privacy/Legal team if this constitutes a breach under GDPR/CCPA.
2.  **The Fix (Code):** Implement a "Redaction Middleware" in the logging utility that uses a whitelist or regex to mask sensitive fields (e.g., `email: "***@***.com"`) before they leave the application process.
3.  **Prevention (Architectural):**
    - **Custom Logger:** Wrap the logging library in a company-wide internal library that enforces redaction by default.
    - **Static Analysis (SAST):** Use custom ESLint rules or Semgrep patterns to detect `console.log(user.email)` or similar patterns in CI.
    - **Data Masking at Edge:** Configure the logging aggregator (e.g., Logstash or a proxy) to run "Sensitive Data Discovery" and redact patterns like SSNs or Credit Cards automatically.

---

## 4. Web Security Primitives (CSP & SRI)

**Q: Compare CSP Nonces vs. Hashes. Which would you recommend for a legacy codebase that uses many inline scripts?**

**Answer:**

- **Hashes:** Best for **static** inline scripts. You generate a hash of the content, and it stays valid as long as the content doesn't change. It's difficult to maintain if you have hundreds of scripts.
- **Nonces:** Best for **dynamic** or high-volume scripts. The server generates a unique "number used once" per request and injects it into every `<script>` tag.
- **Recommendation for Legacy:** **Nonces** are usually easier to retrofit. You can modify your template engine (EJS, Handlebars, React) to automatically inject the `nonce` attribute into all script tags.
- **The Catch:** If the legacy code uses `eval()` or `setTimeout(string)`, you'll also need `'unsafe-eval'`, which weakens the policy. The architect's goal should be to migrate away from these "sinks" first.

---

## 5. Advanced Vulnerabilities

**Q: Explain the security implications of Prototype Pollution. How do you prevent it in a high-performance Node.js environment?**

**Answer:**

- **Implication:** An attacker injects properties like `__proto__.admin = true` into a base object. Because of JS inheritance, _every_ object in the app now has `admin: true`, potentially bypassing authentication checks.
- **Prevention:**
  1.  **Object.create(null):** When creating maps or dictionaries for untrusted data, use `null` prototypes so there's no `__proto__` to pollute.
  2.  **Map Objects:** Use the native `Map` class instead of plain objects `{}` for key-value storage.
  3.  **Validation:** Use schema validators like **Zod** or **Joi** to strip out `__proto__`, `constructor`, and `prototype` keys from incoming JSON.
  4.  **Frozen Prototypes:** In sensitive environments, you can call `Object.freeze(Object.prototype)`, though this can break some legacy libraries.

---

## 6. Organizational Security & CI/CD

**Q: How do you protect against Supply Chain attacks (malicious dependencies) without slowing down the development team?**

**Answer:**

1.  **Lockfiles:** Mandate `package-lock.json` or `yarn.lock` to ensure consistent, audited versions across all environments.
2.  **Private Registry Proxy:** Use a tool like Verdaccio or Artifactory to cache dependencies. This prevents "left-pad" style deletions and allows for scanning before the team downloads them.
3.  **Automated Scanning:** Integrate `npm audit`, `Snyk`, or `GitHub Advanced Security` into the PR flow. Block merges if a "Critical" vulnerability is found.
4.  **Dependency Pinning vs. Ranges:** For critical security libraries (like `jsonwebtoken` or `bcrypt`), pin the exact version. For others, use `~` (patches) but avoid `^` (minors) for ultra-sensitive modules.
5.  **Audit Exemption Policy:** Create a clear, fast-track process for devs to "snooze" false positives (e.g., a vulnerability in a devDependency that doesn't ship to production).
