# 🛡️ Security Architect Interview Grill (SDE-1 to Staff/Architect)

This guide provides a tiered approach to security interview questions. It ranges from foundational knowledge (SDE-1) to complex, open-ended architectural challenges (Staff/Architect).

---

## 🟢 Level 1: Foundational (SDE-1 / Junior)

_Focus: Definitions, basic mechanics, and awareness._

### Q: What is the difference between Authentication and Authorization?

**1-Liner:** Authentication is verifying **who you are** (login); Authorization is verifying **what you can do** (permissions).

### Q: Why should you never store passwords in plain text?

**1-Liner:** If the database is breached, attackers gain instant access to all accounts; hashing (with salt) ensures the original password remains unknown.

### Q: What is a "Salt" in the context of password hashing?

**1-Liner:** A random string added to a password before hashing to ensure two users with the same password have different hashes, preventing "Rainbow Table" attacks.

### Q: What does the `HttpOnly` flag on a cookie do?

**1-Liner:** It prevents JavaScript from accessing the cookie, which is a primary defense against session theft via XSS.

### Q: What is the Principle of Least Privilege (PoLP)?

**1-Liner:** Users and systems should only have the minimum permissions necessary to perform their specific job, and nothing more.

### Q: What is an IDOR (Insecure Direct Object Reference) vulnerability, and how do you prevent it at scale?

**Answer:**

- **The Vulnerability:** An attacker changes a parameter (like `user_id` in a URL or body) to access data belonging to another user (e.g., `GET /api/orders/555` -> `GET /api/orders/556`).
- **Prevention:**
  1.  **Ownership Check (Crucial):** Never rely on the ID alone. Every request must verify: `SELECT * FROM orders WHERE id = ? AND owner_id = <current_logged_in_user_id>`.
  2.  **UUIDs/HashIDs:** Use unpredictable identifiers (UUID v4) instead of sequential integers to make enumeration impossible.
  3.  **Authorization Middleware:** Use a central library (like CASL or a custom "Policy" layer) to enforce ownership rules consistently across the API.

### Q: What are the 4 critical security flags for a session cookie?

**1-Liners for SDE-1/2:**

1.  **HttpOnly:** Prevents JavaScript from reading the cookie (stops XSS session theft).
2.  **Secure:** Ensures the cookie is only sent over encrypted HTTPS connections.
3.  **SameSite:** (Strict/Lax) Prevents the browser from sending the cookie in cross-site requests (mitigates CSRF).
4.  **Domain/Path:** Restricts the cookie's scope to specific subdomains or paths to prevent "Cookie Tossing" attacks.

### Q: What is Clickjacking, and how does it differ from CSRF?

**Answer:**

- **Difference:** CSRF trick the browser into _sending a request_; Clickjacking tricks the user into _clicking something_ they didn't intend to (by overlaying a transparent iframe of your site over a malicious page).
- **Prevention:**
  1.  **X-Frame-Options:** Set to `DENY` or `SAMEORIGIN`.
  2.  **CSP `frame-ancestors`:** (Modern way) `Content-Security-Policy: frame-ancestors 'self'`.

---

## 🟡 Level 2: Experienced (SDE-2 / Senior)

_Focus: Implementation, trade-offs, and vulnerability mitigation._

### Q: How do you choose between `SameSite=Strict` and `SameSite=Lax` for session cookies?

**Answer:**

- **Strict:** Most secure. Cookies only sent if the request originates from the same site. Use for highly sensitive apps (banking).
- **Lax:** Good balance. Cookies are sent on top-level GET navigations (following a link). Use for general apps where "staying logged in" when coming from Google/Social Media is important for UX.

### Q: Explain "Defense in Depth" in the context of an API.

**Answer:** Don't rely on just one check. Use:

1. **Network:** TLS + Rate Limiting.
2. **Gateway:** Authentication (JWT check).
3. **Application:** Input Validation + Authorization (RBAC/ABAC).
4. **Data:** Encryption at rest + Audit Logging.

### Q: What is a Replay Attack, and how do you prevent it in a REST API?

**Answer:** An attacker captures a valid request and sends it again.
**Prevention:**

- Use **Nonces** (unique IDs per request) or **Timestamps**.
- The server stores used nonces for a short window and rejects duplicates.

---

## 🔴 Level 3: Advanced (Staff / Architect)

_Focus: Strategy, system-wide impact, and threat modeling._

### Q: Explain SSRF (Server-Side Request Forgery) and its impact in Cloud environments.

**Architectural Answer:**

- **The Attack:** An attacker tricks a server into making a request to an internal or external resource it shouldn't access (e.g., `?url=http://localhost:8080/admin`).
- **Cloud Impact:** The most dangerous use is accessing the **Cloud Metadata Service** (e.g., `http://169.254.169.254/latest/meta-data/`). This can allow an attacker to steal temporary IAM credentials and gain control over your entire cloud infrastructure.
- **Prevention:**
  1.  **Whitelist-based Egress:** Only allow the server to talk to specific, trusted domains/IPs.
  2.  **Network Segmentation:** Use VPCs and security groups to block the app server from reaching sensitive internal ports.
  3.  **Disable Metadata Access:** Use IMDSv2 (AWS) which requires a session token and resists simple SSRF.

### Q: What is the difference between OAuth2 and OpenID Connect (OIDC)?

**1-Liner:** **OAuth2** is for **Authorization** (obtaining a token to access a resource/API); **OIDC** is an identity layer on top of OAuth2 for **Authentication** (obtaining an ID Token to know _who_ the user is).

### Q: How would you design a defense-in-depth strategy for a large-scale Micro-Frontends (MFE) application?

**Answer:**
A defense-in-depth strategy for MFEs must be applied at multiple layers:

1.  **Network Layer:** Implement strict CORS policies at the API Gateway level. Use HSTS with preloading.
2.  **Application Header Layer:** Standardize security headers (CSP, Permissions-Policy, X-Content-Type-Options) across all MFEs.
3.  **Sandbox Layer:** Use the `sandbox` attribute on iframes to restrict script execution. For module-based MFEs, use CSP to restrict script sources.
4.  **Auth Layer:** Centralize authentication (OIDC/OAuth2) so individual MFEs don't handle credentials. Use scoped tokens (claims).
5.  **Build Layer:** Implement Subresource Integrity (SRI) for shared vendor bundles and use dependency scanning.

### Q: We are moving to a stateless JWT-based authentication. What are the primary security trade-offs, and how do you handle token revocation/logout?

**Answer:**

- **Trade-offs:** Stateless JWTs reduce database load but are "self-contained," meaning they can't be easily invalidated once issued.
- **The Revocation Problem:** Logout on the client doesn't actually stop the token from being valid on the server until it expires.
- **Solutions:**
  1.  **Short TTLs + Refresh Tokens:** Give access tokens a very short life (5-15 mins) and use a database-backed refresh token to issue new ones. You can "revoke" the refresh token.
  2.  **Blacklisting (Hybrid):** Store a list of revoked JWT IDs (jti) in a fast cache like Redis.
  3.  **Version/Grace Period:** Increment a `user_version` field in the DB.

### Q: "Zero Trust" is a popular buzzword. How would you practically implement it in a legacy microservices environment?

**Architectural Answer:**
Zero Trust means "Never Trust, Always Verify." In legacy:

1.  **Identity per Workload:** Move from IP-based trust to identity-based trust using SPIFFE/Spire or mutual TLS (mTLS).
2.  **Micro-segmentation:** Use a Service Mesh (Istio/Linkerd) to enforce that Service A can _only_ talk to Service B.
3.  **Continuous Verification:** Every single internal call must be authenticated and authorized.

### Q: We are building a Public API for third-party developers. How do you handle Rate Limiting and DoS protection at scale?

**Grill Questions/Nuance:**

- **Layer 7 (Application):** Implement Token Bucket or Leaky Bucket algorithms. Store quotas in Redis.
- **Tiers:** Implement different limits based on API Keys.
- **Edge Protection:** Use a CDN (Cloudflare/AWS Shield).
- **Fail-Open vs. Fail-Closed:** If your Redis rate-limiter goes down, do you block everyone (safe) or allow everyone (available)?

### Q: Design a secure "Forgot Password" flow that is resilient to User Enumeration and Account Takeover (ATO).

**The "Grilled" Answer:**

1.  **No Enumeration:** The response should always be: "If an account exists with this email, you will receive instructions."
2.  **Secure Tokens:** Use a cryptographically strong, one-time-use token with a short TTL (15-30 mins).
3.  **Rate Limiting:** Aggressively rate limit the "Submit" and "Reset" endpoints by IP and by Email.
4.  **Notification:** Send an email to the user even if they didn't request the reset.
5.  **Invalidation:** Changing the password must invalidate all active sessions/JWTs.

### Q: How do you handle "The Secret Management Problem" (Chicken & Egg)? How does a server get its first secret to talk to the Vault?

**Answer:**

- **Platform Identity:** Use the cloud provider's IAM (AWS IAM Roles for EC2/Lambda).
- **Vault Auth:** The Vault trusts the Cloud Provider. The service presents its platform identity, and Vault gives it a temporary token.

### Q: Scenario: A developer accidentally logs user emails and SSNs in plain text. How do you fix this and prevent it from happening again?

**Answer:**

1.  **Remediation:** Rotate any leaked secrets. Purge the logs. Notify Data Privacy/Legal.
2.  **The Fix:** Implement a "Redaction Middleware" in the logging utility to mask sensitive fields.
3.  **Prevention:**
    - **Custom Logger:** Wrap the logging library in a company-wide library that enforces redaction.
    - **Static Analysis (SAST):** Use custom ESLint rules or Semgrep patterns to detect sensitive logging in CI.
    - **Data Masking at Edge:** Configure the logging aggregator to redact patterns automatically.

### Q: Explain the security implications of Prototype Pollution. How do you prevent it in a high-performance Node.js environment?

**Answer:**

- **Implication:** An attacker injects properties like `__proto__.admin = true` into a base object, potentially bypassing auth checks globally.
- **Prevention:**
  1.  **Object.create(null):** Use for untrusted data maps.
  2.  **Map Objects:** Use native `Map` class.
  3.  **Validation:** Use schema validators (Zod/Joi) to strip out `__proto__`, `constructor`, and `prototype` keys.
  4.  **Frozen Prototypes:** Call `Object.freeze(Object.prototype)`.

### Q: Compare CSP Nonces vs. Hashes. Which would you recommend for a legacy codebase that uses many inline scripts?

**Answer:**

- **Hashes:** Best for **static** inline scripts. You generate a hash of the content, and it stays valid as long as the content doesn't change. It's difficult to maintain if you have hundreds of scripts.
- **Nonces:** Best for **dynamic** or high-volume scripts. The server generates a unique "number used once" per request and injects it into every `<script>` tag.
- **Recommendation for Legacy:** **Nonces** are usually easier to retrofit. You can modify your template engine (EJS, Handlebars, React) to automatically inject the `nonce` attribute into all script tags.
- **The Catch:** If the legacy code uses `eval()` or `setTimeout(string)`, you'll also need `'unsafe-eval'`, which weakens the policy.

### Q: How do you protect against Supply Chain attacks (malicious dependencies) without slowing down the development team?

**Answer:**

1.  **Lockfiles:** Mandate `package-lock.json` or `yarn.lock` to ensure consistent, audited versions across all environments.
2.  **Private Registry Proxy:** Use a tool like Verdaccio or Artifactory to cache dependencies. This prevents "left-pad" style deletions and allows for scanning before the team downloads them.
3.  **Automated Scanning:** Integrate `npm audit`, `Snyk`, or `GitHub Advanced Security` into the PR flow. Block merges if a "Critical" vulnerability is found.
4.  **Audit Exemption Policy:** Create a clear, fast-track process for devs to "snooze" false positives (e.g., a vulnerability in a devDependency that doesn't ship to production).

### Q: Why is OAuth2 PKCE (Proof Key for Code Exchange) recommended for SPAs/Mobile apps over the standard Authorization Code flow?

**Architectural Answer:**

- **The Problem:** In standard Auth Code flow, the "Client Secret" cannot be safely stored in a browser (SPA) or mobile app. If an attacker intercepts the `code`, they could exchange it for a token if they have the secret (or if no secret is required).
- **The PKCE Fix:** PKCE replaces the static client secret with a dynamic **Code Verifier** (random string) and a **Code Challenge** (hash of the verifier).
- **The Flow:** The client sends the challenge during the initial redirect. When exchanging the `code` later, it sends the original verifier. The server hashes the verifier and ensures it matches the challenge. Even if an attacker steals the `code`, they don't have the verifier to complete the exchange.

### Q: What are the unique security risks of GraphQL compared to REST, and how do you mitigate them?

**Grill Answer:**

1.  **Query Depth/Complexity:** Attackers can send deeply nested queries (circular references) that crash the server or DB. **Mitigation:** Implement `max_depth` limits and "Query Cost Analysis" (reject queries exceeding a cost threshold).
2.  **Batching Attacks:** Attackers can pack thousands of queries into a single request to bypass rate limiters. **Mitigation:** Rate limit based on the number of _operations_ or _cost_, not just HTTP requests.
3.  **Introspection:** Leaving introspection on in production allows attackers to map your entire schema easily. **Mitigation:** Disable introspection in production.

### Q: Explain the "Shared Responsibility Model" in Cloud Security (AWS/GCP/Azure).

**1-Liner:** The Cloud Provider is responsible for the security **OF** the cloud (hardware, global infrastructure); the Customer is responsible for security **IN** the cloud (OS patching, IAM, data encryption, network config).

---

## 🧠 Situational "Grills"

**Q: You discover a critical SQL injection in a core service. The fix requires a database schema change and 4 hours of downtime. The Business wants to wait until the weekend. What is your move?**

- **SDE-1:** "I'll follow whatever the manager says."
- **Staff/Architect:** "I will propose an immediate **WAF (Web Application Firewall)** rule to block the specific injection pattern at the edge. This buys us time to perform the proper schema change during off-peak hours without leaving the app vulnerable for days. If the WAF isn't possible, I'll escalate the risk: cost of downtime vs. cost of a full database leak."
