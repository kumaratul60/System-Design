# 🛡️ Security Architecture & Engineering Hub

Welcome to the central security knowledge base. This directory covers end-to-end web security, from browser-level primitives to server-side architectural patterns.

---

## PII: Personal Identity information

### The person whom trust the most is the most dangerous person, that exactly happens in security.

---

## 📂 Knowledge Modules

### 🔐 Authentication & Identity

Fundamental concepts and implementation details for securing user sessions and identity.

- **[Authentication & Authorization](./Auth/README.md):** Deep dive into MFA, OAuth2, OIDC, and session management.
- **[PII (Personally Identifiable Information)](./PII/README.md):** Standards for handling, encrypting, and redacting sensitive user data.

### 🌐 Web Browser Security

How browsers protect (and expose) your application.

- **[CORS (Cross-Origin Resource Sharing)](./CORS/README.md):** Understanding the Same-Origin Policy and secure cross-domain communication.
- **[Security Headers](./SecurityHeaders/README.md):** HSTS, X-Frame-Options, X-Content-Type-Options, and more.
- **[IFrame Security](./IFrame/README.md):** Sandboxing and cross-window communication (`postMessage`).
- **[Permission Policies](./PermissionPolicies/PermissionPolicies.md):** Restricting browser features like Camera, Mic, and Geolocation.
- **[Subresource Integrity (SRI)](./SubresourceIntegrity/README.md):** Protecting against CDN-based supply chain attacks.
- **[Client-Side Storage](./ClientSideStorage/README.md):** Security trade-offs between Cookies, LocalStorage, and IndexedDB.

### ⚔️ Common Attack Vectors & Mitigations

Understanding how attackers think and how to build resilient systems.

- **[XSS (Cross-Site Scripting)](./XSS/README.md):** Injection attacks and modern CSP-based mitigations.
- **[CSRF (Cross-Site Request Forgery)](./CSRF.md):** Exploiting session trust and token-based defenses.
- **[SSRF & Injection](./SSRF&JI.md):** Server-Side Request Forgery, SSJI, and XXE vulnerabilities.
- **[Input Validation & Sanitization](./Validation/InputValidation&Sanitization.md):** The first line of defense against all injection attacks.

### 🏗️ Advanced Architectural Patterns

Enterprise-level security strategies.

- **[Dependency Injection Security](./DependencyInjection/README.md):** Patterns for secure service orchestration.
- **[Feature Flags](./FeatureFlags/README.md):** Security implications of dynamic runtime configuration.
- **[Compliance & Regulations](./Compliance&Regulations.md):** Navigating GDPR, HIPAA, SOC 2, and more.

---

## 🚀 Interview & Assessment

Ready to test your knowledge or preparing for a Staff/Architect role?

- **[Security Architect Interview Grill](../Questions/Detailed/Security_Architect.md):** High-level architectural challenges and "grill" style questions.

---

> "Security is not a product, but a process." — Bruce Schneier
