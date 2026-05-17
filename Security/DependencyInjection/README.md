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
