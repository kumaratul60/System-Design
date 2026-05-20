# Dependency Injection (DI) and Security

Dependency Injection is a design pattern in which an object receives other objects that it depends on. While primarily a software architecture pattern, it has significant security benefits.

## Security Benefits of DI

### 1. Hardcoded Secrets Prevention

Instead of hardcoding API keys or database credentials inside a module, they can be "injected" from a secure configuration service or environment variables.

### 2. Improved Testability

DI makes it easy to mock dependencies (like databases or external APIs) during security testing (Unit/Integration tests), allowing you to simulate edge cases and malicious inputs without hitting production systems.

### 3. Reduced Attack Surface

By injecting only the necessary dependencies, you limit the capabilities of a module. For example, a "Logger" module shouldn't have access to the "Database" module.

---

## 🔥 Senior/Staff Level "Grill" Questions

### Q1: Can DI actually _increase_ the attack surface?

> **Answer:** Yes, if the "Composition Root" (the place where dependencies are linked) is not secured. If an attacker can control which modules are injected (e.g., via a dynamic configuration file or a `require(variable)` vulnerability), they can inject a **Malicious Mock** that exfiltrates data or grants admin access.

### Q2: Explain "Circular Dependencies" and why they are an architectural red flag.

> **Answer:** Module A depends on B, and B depends on A.
>
> - **The Problem:** It makes the system impossible to test in isolation, creates "Spaghetti Code," and can lead to memory leaks or stack overflows during initialization.
> - **The Fix:** Use a **Third Module** (C) to hold the shared logic, or use **Interface Injection** to break the direct link.

### Q3: Why is "Singleton Injection" dangerous in a multi-tenant environment?

> **Answer:** If you inject a Singleton service (like a `UserContext`) that stores data in its local memory, and that service is shared across multiple concurrent requests from different users, you might leak **User A's data to User B**.
>
> - **The Rule:** Never store request-specific state in a Singleton. Use **Request-scoped Injection**.

---

## Example: Insecure vs. Secure (DI)

### Insecure: Hardcoded Dependency

```javascript
// Database.js
const mysql = require('mysql');
// SECRETS ARE EXPOSED IN SOURCE CODE!
const connection = mysql.createConnection({
  host: 'prod-db.example.com',
  user: 'admin',
  password: 'super-secret-password',
});

module.exports = connection;
```

### Secure: Dependency Injection

```javascript
// UserController.js
class UserController {
  constructor(db) {
    this.db = db; // DB is injected, not hardcoded
  }

  async getUser(id) {
    return this.db.query('SELECT * FROM users WHERE id = ?', [id]);
  }
}

// app.js (Composition Root)
const db = require('./Database'); // DB is configured elsewhere with ENV vars
const userController = new UserController(db);
```

---

## Security Risks: Dependency Confusion

While DI is a pattern, the _dependencies themselves_ can be a risk. **Dependency Confusion** occurs when an attacker publishes a malicious package with the same name as an internal private package to a public repository (like npm), tricking the build system into downloading the malicious version.

### Prevention:

- Use **Scoped Packages** (e.g., `@myorg/my-package`).
- Use **Lockfiles** (`package-lock.json`, `yarn.lock`) to ensure consistent versions.
- Configure your package manager to prioritize private registries.
