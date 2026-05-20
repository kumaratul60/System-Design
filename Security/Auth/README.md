# Authentication and Authorization

In web security, "Auth" usually refers to two distinct but related processes: **Authentication (Who are you?)** and **Authorization (What are you allowed to do?)**.

---

## 1. Authentication (AuthN)

The process of verifying the identity of a user or service.

### Common Methods:

- **Passwords:** The most common (and often weakest) method. Use hashing (like `bcrypt`) and salting.
- **Multi-Factor Authentication (MFA):** Adds an extra layer (SMS, Authenticator App, Hardware Key).
- **OAuth 2.0 / OpenID Connect (OIDC):** Delegated authentication (e.g., "Login with Google").
- **Biometrics:** Fingerprint, Face ID.
- **Tokens/JWT:** Stateless authentication for APIs.

### Security Best Practices:

- **Password Hashing:** Never store passwords in plain text. Use `Argon2` or `bcrypt`.
- **Session Management:** Use secure, `HttpOnly` cookies for session IDs.
- **Rate Limiting:** Prevent brute-force attacks on login endpoints.
- **Secure Token Storage:** Don't store JWTs in `localStorage` if they contain sensitive data or have long TTLs.

---

## 2. Authorization (AuthZ)

The process of determining whether an authenticated user has permission to perform a specific action or access a resource.

### Common Models:

- **RBAC (Role-Based Access Control):** Permissions are assigned to roles (e.g., `admin`, `editor`, `viewer`).
- **ABAC (Attribute-Based Access Control):** Decisions are based on attributes (e.g., "Users in department X can access resource Y during business hours").
- **ACL (Access Control Lists):** A list of permissions attached to a specific object.

---

## Implementation Example: JWT with Express.js

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

const SECRET_KEY = 'your-very-secret-key';

// Middleware for Authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden (Invalid token)
    req.user = user;
    next();
  });
};

// Middleware for Authorization (RBAC)
const authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};

app.get('/admin', authenticateToken, authorizeRole('admin'), (req, res) => {
  res.send('Welcome, Admin!');
});

app.listen(3000);
```

---

## 🔥 Senior/Staff Level "Grill" Questions

### Q1: OAuth 2.0 vs. OpenID Connect (OIDC): Why do we need both?

> **Answer:**
>
> - **OAuth 2.0:** Is an **Authorization** framework. It gives you an `Access Token` to use a resource (e.g., "I have permission to post to your Twitter"). It doesn't tell you _who_ the user is.
> - **OIDC:** Is an **Identity** layer on top of OAuth 2.0. It adds an `ID Token` (a JWT) that contains user profile information (name, email, etc.).
> - **The "Staff" Take:** Never use an OAuth 2.0 `Access Token` for authentication. If you need to know who the user is, use OIDC.

### Q2: What is "Refresh Token Rotation" and why is it mandatory for SPAs?

> **Answer:** In Single Page Apps (SPAs), tokens are stored in the browser, making them vulnerable to theft via XSS.
>
> - **The Solution:** Every time you use a `Refresh Token` to get a new `Access Token`, the server issues a **new** Refresh Token and invalidates the old one.
> - **Breach Detection:** If an attacker steals a Refresh Token and uses it, and then the legitimate user tries to use the _same_ (now old) token, the server detects the reuse and immediately invalidates the entire session for that user.

### Q3: Is it a security risk to store PII (email, role) inside a JWT?

> **Answer:** JWTs are **Signed**, not **Encrypted** (by default). Anyone who can see the token can decode it and read the payload.
>
> - **The Risk:** If you store sensitive data (like a user's home address) in a JWT, that data is leaked to the browser and any proxy in between.
> - **The Strategy:** Only store non-sensitive identifiers (UID, roles, scopes). If you _must_ store PII, you must use **JWE (JSON Web Encryption)**, which encrypts the payload.

### Q4: Explain the "Stateless Session" myth.

> **Answer:** Many claim JWTs are "stateless," but for any production-grade system, you need the ability to revoke tokens (e.g., if a phone is stolen).
>
> - **The Reality:** The moment you add a "Revocation List" or "Blacklist" in Redis to check token validity, your system is no longer stateless. It is **Stateful at the Edge**.

---

## Authentication vs. Authorization Summary

| Feature      | Authentication (AuthN)        | Authorization (AuthZ)              |
| :----------- | :---------------------------- | :--------------------------------- |
| **Question** | Who are you?                  | What can you do?                   |
| **Check**    | Identity verification.        | Permissions check.                 |
| **Example**  | Entering a username/password. | Checking if you can delete a post. |
| **Order**    | Occurs first.                 | Occurs second (after AuthN).       |
