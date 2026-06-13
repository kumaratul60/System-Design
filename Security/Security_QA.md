# 🛡️ Security Architecture: 33 Core Interview Questions & Answers

This Q&A document provides a structured, tiered review of foundational web security principles, attack vectors, modern mitigations, and staff/architect-level considerations.

---

## 📚 Table of Contents

1. [Cross-Site Scripting (XSS) & Content Security Policy (Q1 - Q5)](#1-cross-site-scripting-xss--content-security-policy-q1---q5)
2. [Cross-Site Request Forgery (CSRF) & SameSite Cookies (Q6 - Q10)](#2-cross-site-request-forgery-csrf--samesite-cookies-q6---q10)
3. [IFrame Security & Clickjacking (Q11 - Q13)](#3-iframe-security--clickjacking-q11---q13)
4. [Identity, Auth & Transmission Security (Q14, Q19, Q20)](#4-identity-auth--transmission-security-q14-q19-q20)
5. [Security Headers & Permissions Policies (Q15, Q16, Q30, Q31)](#5-security-headers--permissions-policies-q15-q16-q30-q31)
6. [Client-Side Storage Security (Q17, Q18)](#6-client-side-storage-security-q17-q18)
7. [Dependency & Supply Chain Security (Q21, Q22)](#7-dependency--supply-chain-security-q21-q22)
8. [Compliance & Regulations (Q23, Q24)](#8-compliance--regulations-q23-q24)
9. [Input Validation & Sanitization (Q25)](#9-input-validation--sanitization-q25)
10. [SSRF & Server-Side JavaScript Injection (Q26 - Q29)](#10-ssrf--server-side-javascript-injection-q26---q29)
11. [Subresource Integrity (Q32, Q33)](#11-subresource-integrity-q32-q33)

---

## 1. Cross-Site Scripting (XSS) & Content Security Policy (Q1 - Q5)

### Q1: What is XSS, and how does it pose a security risk in web applications?

- **Definition:** Cross-Site Scripting (XSS) occurs when an application includes untrusted user input in an HTTP response/web page without validation or escaping, leading the browser to parse and execute malicious scripts in the victim's browser context.
- **Primary Risks:**
  - **Session Hijacking:** Stealing session ID cookies (via `document.cookie`) to hijack accounts.
  - **Credential Harvesting:** Injecting fake login forms over legitimate pages.
  - **DOM Manipulation & Exfiltration:** Executing arbitrary actions on behalf of the user or logging keys.
- **Staff Architect Insight:** Modern XSS is not just about raw HTML injection; it includes **DOM-based XSS** (where client-side JS insecurely reads sources like `location.hash` and writes to sinks like `innerHTML`) and **Blind XSS** (where the payload is stored and executed days later inside an asynchronous dashboard, e.g., a customer support panel).

### Q2: Explain the concept of output encoding and its role in preventing XSS attacks.

- **Concept:** Output encoding (or context-sensitive escaping) translates user input into safe string representations before rendering them, ensuring browsers treat input as flat text rather than executable syntax.
- **Why Context Matters:**
  - **HTML Body Context:** Encode `<` as `&lt;`, `>` as `&gt;`.
  - **HTML Attribute Context:** Encode quotes (e.g., `"` as `&quot;`) to prevent escaping the attribute value boundary.
  - **JavaScript Context:** Encode characters as Unicode escapes (e.g., `\u0022` for double quotes) to prevent script execution.
- **Staff Architect Insight:** Applying HTML encoding inside a `<script>` tag or inline event handler (like `onload="..."`) is useless. Developers must employ context-specific libraries (like the OWASP Java Encoder or DOMPurify for sanitizing HTML markup) to match the exact injection sink.

### Q3: How can a Content Security Policy (CSP) help mitigate XSS vulnerabilities?

- **Concept:** Content Security Policy (CSP) is an HTTP header (`Content-Security-Policy`) that allows developers to define a whitelist of trusted sources for scripts, styles, images, and other assets.
- **Mitigation Actions:**
  - **Block Inline Scripts:** Standard CSP blocks inline scripts (`<script>alert(1)</script>`) and event attributes (`onclick="..."`) unless explicitly allowed via Nonces or Hashes.
  - **Restrict Hosts:** Restricts script sources to trusted domains (`script-src 'self' https://apis.example.com`).
  - **Disable Eval:** Disables standard string-to-code compilation features like `eval()`, `new Function()`, and `setTimeout(string)`.
- **Staff Architect Insight:** Do not rely on domain-based whitelist CSPs; they are highly vulnerable to CDN bypasses. Implement a **Strict CSP** using **cryptographic nonces** (generated dynamically on each request) combined with `strict-dynamic` to automatically trust scripts loaded by other validated scripts.

### Q4: Discuss the impact of XSS on user privacy and data integrity.

- **Impact on Privacy:** Attackers can read sensitive personal data displayed on the screen, access local storage/cookies, monitor browser actions, or record user input via keylogger payloads.
- **Impact on Data Integrity:** Attackers can silently perform write actions (e.g., changing passwords, invoking fund transfers, making purchases) by forging client-side API requests using the victim's active session.

### Q5: What are some best practices for developers to prevent XSS attacks in their applications?

1.  **Use Framework Escaping:** Leverage modern frameworks (React, Angular, Vue) that implicitly auto-escape rendered variables.
2.  **Context-Aware Escaping:** Use trusted escaping libraries when dynamically binding to HTML attributes or JavaScript targets.
3.  **Sanitize Rich HTML:** For user-authored rich text, pass the HTML string through **DOMPurify** before rendering.
4.  **Strict CSP:** Enforce a strict CSP response header using nonces or hashes.
5.  **Cookie Defense:** Secure cookies with the `HttpOnly` flag to prevent access via JavaScript.

---

## 2. Cross-Site Request Forgery (CSRF) & SameSite Cookies (Q6 - Q10)

### Q6: What is CSRF, and how does it work as an attack vector?

- **Definition:** Cross-Site Request Forgery (CSRF) exploits a web application's trust in a user's browser session. It tricks an authenticated user's browser into executing a state-changing HTTP request (POST, PUT, DELETE) on a target site.
- **Attack Vector:**
  1.  A user logs into `legitimate-bank.com`. The browser stores their session cookie.
  2.  The user visits `evil-attacker.com` in another tab.
  3.  `evil-attacker.com` contains a hidden form that auto-submits a POST request to `legitimate-bank.com/transfer`.
  4.  The browser automatically attaches the `legitimate-bank.com` session cookies, and the transaction executes.

### Q7: Explain the role of anti-CSRF tokens in preventing CSRF attacks.

- **Mechanism:** Anti-CSRF tokens are unique, cryptographically secure, and unpredictable values generated by the server for each user session.
- **Mitigation:** The server embeds the token in forms or returns it via a custom header. When a state-changing request is submitted, the server validates the received token against the session record. Since external malicious domains cannot read the token (due to the browser's Same-Origin Policy), any forged request will fail verification.
- **Staff Architect Insight:** For stateless APIs (like SPAs using stateless JWTs), employ the **Double Submit Cookie pattern**. Set the anti-CSRF token in a non-HttpOnly cookie. The client reads this cookie and duplicates the token into a custom header (e.g., `X-CSRF-Token`). The server validates that the cookie value matches the header value.

### Q8: How does the SameSite cookie attribute contribute to CSRF protection?

- **Concept:** The `SameSite` attribute controls whether cookies are sent during cross-site requests.
- **Directives:**
  - `Strict`: The cookie is never sent in cross-site requests (e.g., clicking an external link to your site loads you as logged out).
  - `Lax`: Cookies are sent on "safe" top-level cross-site navigations (GET requests), but blocked on state-changing cross-site requests (POST/PUT/DELETE).
  - `None`: Cookies are sent with all requests (requires the `Secure` flag).
- **Staff Architect Insight:** SameSite is a powerful first-line defense but is not a complete replacement for CSRF tokens. Bypasses occur through sub-domain vulnerability takeovers, state-changing GET endpoints (an anti-pattern), or CORS misconfigurations.

### Q9: Discuss scenarios where CSRF attacks can have severe consequences.

- **Administrative Actions:** Tricking an admin into modifying application settings, adding backdoor admin accounts, or disabling firewalls.
- **Financial Integrity:** Forging bank transfers, checkout operations, or adding malicious shipping addresses.
- **Account Takeover:** Forging password-reset submissions or changing linked emails/phone numbers.

### Q10: What are common methods to secure against CSRF attacks in web applications?

1.  **Anti-CSRF Tokens:** Implement Synchronizer Token or Double Submit Cookie patterns.
2.  **SameSite Cookie Policy:** Enforce `SameSite=Lax` or `SameSite=Strict` on all cookies.
3.  **Strict REST Semantics:** Never perform state-changing operations via HTTP GET requests.
4.  **Custom Request Headers:** Require custom headers (e.g., `X-Requested-With`) to force a CORS preflight options pre-check on cross-site scripts.
5.  **Multi-Factor Authorization:** Force re-authentication (password, MFA, captcha) for high-value actions.

---

## 3. IFrame Security & Clickjacking (Q11 - Q13)

### Q11: Why are IFrames a potential security risk, and how can they be used maliciously?

- **Risk:** An `<iframe>` embeds an external HTML document inside your application context. If not restricted, malicious IFrames can:
  - Listen to keyboard events or hijack inputs.
  - Perform redirect attacks (`window.top.location`).
  - Expose internal page namespaces if script access is allowed.
  - Wrap your target application inside their layout to perform clickjacking.

### Q12: Describe techniques to prevent clickjacking and other IFrame-related attacks.

1.  **Frame Deny Policies:** Set headers/directives telling browsers not to render the site inside an IFrame.
2.  **Sandbox Directive:** Explicitly lock down what an embedded frame can do:
    ```html
    <iframe src="https://example.com" sandbox="allow-scripts allow-forms"></iframe>
    ```
    _(Omit `allow-top-navigation` and `allow-same-origin` to isolate the frame completely)._
3.  **Frame Busting Scripts:** Legacy JavaScript that checks `if (top !== self) { top.location = self.location; }` (easily bypassed by attackers disabling scripts in their outer frame).

### Q13: How does the X-Frame-Options header contribute to IFrame protection?

- **Concept:** An HTTP response header informing browsers whether they are allowed to embed your page inside a `<frame>`, `<iframe>`, `<embed>`, or `<object>`.
- **Directives:**
  - `DENY`: No page can embed this document, regardless of origin.
  - `SAMEORIGIN`: Only pages belonging to the same origin can embed it.
  - `ALLOW-FROM uri`: (Obsolete/unsupported in modern browsers).
- **Staff Architect Insight:** Prefer CSP `frame-ancestors` directive (e.g., `Content-Security-Policy: frame-ancestors 'self'`) over `X-Frame-Options` as it supports granular domain whitelisting and is parsed natively by all modern browsers.

---

## 4. Identity, Auth & Transmission Security (Q14, Q19, Q20)

### Q14: Differentiate between authentication and authorization in the context of web security.

- **Authentication (AuthN):** The process of verifying **who** a user is (e.g., validating passwords, OIDC tokens, biometric scans, or MFA).
- **Authorization (AuthZ):** The process of verifying **what** an authenticated user is permitted to do (e.g., validating RBAC roles, OAuth2 scopes, or ACL file permissions).

### Q19: Why is HTTPS important for securing communication between clients and servers?

- **Three Core pillars of HTTPS:**
  1.  **Confidentiality:** Encrypts data in transit to prevent eavesdropping (Man-in-the-Middle attacks).
  2.  **Integrity:** Employs hashing to detect any modification or tampering of packets in transit.
  3.  **Authenticity:** Validates that the client is communicating with the genuine server via SSL/TLS certificates signed by trusted Certificate Authorities (CAs).

### Q20: Explain the role of SSL/TLS in establishing a secure connection.

- **TLS Handshake Flow:**
  1.  **Client Hello:** Client sends supported protocol versions, cipher suites, and a client random string.
  2.  **Server Hello + Certificate:** Server returns chosen cipher suite, server random, and its public SSL/TLS certificate.
  3.  **Key Exchange (Authentication):** The client validates the certificate. It then generates a _Pre-Master Secret_, encrypts it with the server's public key (or uses Diffie-Hellman ephemeral keys), and sends it to the server.
  4.  **Session Key Generation:** Both sides compute a _Master Secret_ to derive a shared symmetric session key.
  5.  **Finished:** All subsequent communication is encrypted using this symmetric key (which is fast and computationally lightweight).

---

## 5. Security Headers & Permissions Policies (Q15, Q16, Q30, Q31)

### Q15: Name and describe key security headers used to enhance web application security.

- `Content-Security-Policy (CSP)`: Dictates trusted sources of executable scripts, styles, frames, and assets.
- `Strict-Transport-Security (HSTS)`: Restricts browser connections to secure HTTPS only.
- `X-Frame-Options`: Instructs browsers whether they can frame the application layout.
- `X-Content-Type-Options: nosniff`: Prevents browsers from guessing file MIME types, mitigating upload-based XSS attacks.
- `Referrer-Policy`: Controls how much referrer metadata is passed along during outgoing link clicks.
- `Permissions-Policy`: Restricts browser hardware APIs (microphone, camera, geolocations).

### Q16: Explain how the Strict-Transport-Security (HSTS) header improves security.

- **Mechanism:** `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`. It instructs browsers to convert all insecure HTTP attempts to secure HTTPS requests automatically client-side.
- **Mitigation:** Prevents SSL-stripping attacks (intercepting initial HTTP redirects to block HTTPS handshakes).
- **Staff Architect Insight:** The initial HTTP-to-HTTPS redirect is a vulnerable window. Developers must register their domain in the global browser **HSTS Preload List** (via hstspreload.org). Modern browsers ship with this list compiled into their source, enforcing HTTPS-only connections starting at the very first request.

### Q30: How can Permissions/Feature policies help control and restrict features in a web application?

- **Mechanism:** By establishing strict control limits, Permissions Policies define exactly what browser hardware APIs can execute in the context of the page or child IFrames.
- **Mitigation:** If an attacker compromises your application via XSS, a strict permissions policy ensures they cannot access the user's camera, microphone, geolocation, or USB connections.

### Q31: Explain the purpose of Feature Policy and Permissions-Policy headers in web security.

- **Purpose:** Enforces security isolation at the hardware and browser API layer.
- **Syntax:**
  ```http
  Permissions-Policy: camera=(), microphone=(), geolocation=(self)
  ```
  _(Restricts camera and microphone execution everywhere, and allows geolocation queries only from the parent domain)._

---

## 6. Client-Side Storage Security (Q17, Q18)

### Q17: Discuss security considerations when using client-side storage mechanisms like cookies and localStorage.

- **LocalStorage / SessionStorage:**
  - _Risk:_ Insecure against XSS. Any executing script can read, write, or exfiltrate all stored key-value pairs (e.g., JWTs, session tokens, personal info).
  - _Rule:_ Never store sensitive authentication identifiers, secrets, or PII here.
- **IndexedDB:**
  - _Risk:_ Subject to the Same-Origin Policy, but accessible via client-side JavaScript APIs (vulnerable to XSS extraction).
- **Cookies:**
  - _Risk:_ Shielded from script access via flags, but vulnerable to CSRF transmission unless SameSite settings are configured.

### Q18: How can SameSite cookies and the HttpOnly flag enhance client-storage security?

- **`HttpOnly` Flag:** Instructs the browser that the cookie cannot be read via `document.cookie` or client-side APIs, mitigating session token theft during XSS attacks.
- **`Secure` Flag:** Ensures cookies are only sent over encrypted connections (HTTPS), mitigating eavesdropping.
- **`SameSite=Lax/Strict`:** Prevents automatic cookie transmission during cross-origin requests, blocking CSRF.

---

## 7. Dependency & Supply Chain Security (Q21, Q22)

### Q21: How can the use of third-party dependencies introduce security vulnerabilities?

- **Vulnerability Vector:** Applications rely on vast trees of open-source packages (e.g., via npm, pip, Maven). A single compromised transitive dependency deep in the tree can execute malicious code on developer machines, production build pipelines, or inside the client's browser context (supply-chain attack).

### Q22: Discuss best practices for securing and monitoring dependencies in a web application.

1.  **Software Bill of Materials (SBOM):** Maintain a manifest of all direct and transitive dependencies.
2.  **Automated Vulnerability Scanning:** Run automated CLI checks in pipelines (e.g., `npm audit`, Snyk, Dependabot, OSV-Scanner) to fail builds on critical CVEs.
3.  **Strict Lockfiles:** Always check in `package-lock.json` or `yarn.lock` to ensure deterministic, checksum-validated installs in CI/CD.
4.  **Private Registries / Proxying:** Cache and scan packages internally using artifactory systems to prevent "Dependency Confusion" attacks.

---

## 8. Compliance & Regulations (Q23, Q24)

### Q23: What are common compliance standards and regulations related to web application security?

- **GDPR:** General Data Protection Regulation (EU data privacy mandate).
- **PCI DSS:** Payment Card Industry Data Security Standard (card processing security).
- **HIPAA:** Health Insurance Portability and Accountability Act (US health data privacy).
- **SOC 2 (Type II):** Voluntary audit system verifying security, availability, processing integrity, confidentiality, and privacy controls.

### Q24: How can compliance with standards like GDPR and PCI DSS impact web application security?

- **GDPR Impact:** Forces developers to implement "Privacy by Design" (encryption-at-rest for PII, data minimization, pseudonymization, and mechanisms for users to export or delete their profile data under the "Right to be Forgotten").
- **PCI DSS Impact:** Mandates network segmentation (isolating Cardholder Data Environment - CDE), TLS 1.2/1.3 enforcement, tokenization of card numbers (never store primary PANs directly in application databases), and regular vulnerability testing.

---

## 9. Input Validation & Sanitization (Q25)

### Q25: Why is input validation crucial for preventing security vulnerabilities?

- **Explanation:** Input validation is the primary line of defense. It prevents malformed, unexpected, or malicious data from reaching interpreters, query engines, or rendering layers.
- **Mitigation Target:**
  - **SQL Injection:** Prevents escaping queries (use parameterized statements/ORMs).
  - **Command Injection:** Rejects parameter strings containing system shell characters (`;`, `&&`, `$()`).
  - **XSS / Path Traversal:** Validates incoming payloads to ensure they match expected patterns (e.g., email format, integer ranges) before compilation.
- **Staff Architect Insight:** Never rely on client-side validation alone; attackers bypass client-side code entirely by calling APIs directly. Implement validation strictly on the **server-side** at the entry controller level.

---

## 10. SSRF & Server-Side JavaScript Injection (Q26 - Q29)

### Q26: What is SSRF, and how can it be exploited by attackers?

- **Definition:** Server-Side Request Forgery (SSRF) occurs when a web application takes a user-supplied URL (e.g., for fetching a profile image or importing data) and attempts to resolve/fetch it without proper sanitization.
- **Exploitation Vector:** The attacker inputs a private internal URL (e.g., `http://localhost:8080/admin` or cloud metadata endpoints like `http://169.254.169.254/latest/meta-data/`). The server processes the request internally, bypassing edge firewalls and exposing sensitive configuration details or cloud credentials.

### Q27: Discuss methods to prevent SSRF attacks in a web application.

1.  **Block Private IP Ranges:** DENY resolution to RFC 1918 private IP ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.1/32`, `::1`).
2.  **Verify Resolution (DNS Rebinding Mitigation):**
    - _Anti-Pattern:_ Resolving the IP to check if it's public, then fetching the URL separately (vulnerable to DNS rebinding, where the DNS TTL is set to 0, causing the second fetch to resolve to a private IP).
    - _Correction:_ Resolve the hostname, validate that the returned IP is public, and immediately fetch using the validated IP address while pinning the host header.
3.  **Dedicated Outbound Proxies:** Force all outbound request services through a sandboxed egress gateway.

### Q28: What is SSJI, and how does it pose a security risk?

- **Definition:** Server-Side JavaScript Injection (SSJI) occurs when an application takes untrusted input and passes it into dynamic code execution contexts (like Node.js `eval()`, `setTimeout()`, or `new Function()`).
- **Risk:** Remote Code Execution (RCE) on the server, leading to host file extraction, server takeover, and lateral network traversal.

### Q29: How can developers prevent server-side JavaScript injection vulnerabilities?

1.  **Avoid Dynamic Execution Sinks:** Never use `eval()`, `new Function()`, or dynamic runtime compilation.
2.  **Use Static Code Analyzers:** Run AST linters (like ESLint security plugins) to block execution sinks.
3.  **Strict Sandbox Isolation:** If user-generated scripts must execute, run them inside isolated sandboxes (such as separate virtual machines or Docker containers with read-only filesystems and tight resource limits).

---

## 11. Subresource Integrity (Q32, Q33)

### Q32: What is SRI, and how does it contribute to the security of external resources?

- **Definition:** Subresource Integrity (SRI) is a security feature that enables browsers to verify that resources they fetch (from a CDN or third-party host) have not been modified or compromised in transit.
- **Mitigation:** Prevents supply chain attacks where CDNs are hacked to inject scripts into shared libraries (e.g., jQuery, bootstrap).

### Q33: Discuss the implementation and benefits of Subresource Integrity.

- **Implementation:** Generate a SHA-256/384/512 hash of the target script. Include the hash inside the `integrity` attribute and set `crossorigin="anonymous"`:
  ```html
  <script
    src="https://cdn.example.com/js/jquery.min.js"
    integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
    crossorigin="anonymous"
  ></script>
  ```
- **Benefits:**
  - **Zero execution on mismatch:** If the fetched script is modified by even one character, the cryptographic hash mismatches, and the browser blocks script execution immediately.
  - **Verifiable deployment:** Guarantees deterministic frontend script deliveries.

---

[Return to Security Architecture Hub](./README.md)
