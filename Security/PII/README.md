# Personally Identifiable Information (PII)

PII is any information that can be used to identify a specific individual. Protecting PII is a core requirement of privacy laws like **GDPR**, **CCPA**, and **HIPAA**.

## Examples of PII

- **Direct Identifiers:** Full name, Social Security Number (SSN), driver's license number, email address, physical address.
- **Indirect/Linkable Identifiers:** Date of birth, IP address, geolocation data, employment history, medical records.

---

## Best Practices for Handling PII

### 1. Data Minimization

Only collect and store the PII that is absolutely necessary for your application to function. If you don't have it, you can't lose it.

### 2. Encryption at Rest

Always encrypt sensitive PII when it is stored in your database. Use strong encryption standards like **AES-256**.

### 3. Encryption in Transit

Ensure all PII is transmitted over **HTTPS (TLS)** to prevent interception (Man-in-the-Middle attacks).

### 4. Anonymization and Pseudonymization

- **Anonymization:** Removing all identifying features so the data can never be linked back to an individual.
- **Pseudonymization:** Replacing identifiers with a "pseudonym" (like a UUID). The link still exists but is stored separately and securely.

### 5. Proper Logging

Never log PII in plain text. Use middleware to "redact" or mask sensitive fields (e.g., credit card numbers, passwords) before they hit your logging service.

---

## Redaction Example (Express Middleware)

```javascript
const winston = require('winston');

const redactPii = (info) => {
  const piiFields = ['email', 'password', 'ssn', 'phone'];
  const redactedInfo = { ...info };

  piiFields.forEach((field) => {
    if (redactedInfo[field]) {
      redactedInfo[field] = '***REDACTED***';
    }
  });

  return redactedInfo;
};

// Logger setup
const logger = winston.createLogger({
  format: winston.format.combine(winston.format.json(), winston.format(redactPii)()),
  transports: [new winston.transports.Console()],
});

// Middleware
app.use((req, res, next) => {
  logger.info('Incoming Request', {
    path: req.path,
    body: req.body, // Body is now automatically redacted
  });
  next();
});
```

---

## Senior/Staff Level "Grill" Questions

### Q1: How do you handle the "Right to be Forgotten" (GDPR) in immutable database backups?

> **Answer:** This is a classic distributed systems problem. You cannot "delete" a single row from a compressed, encrypted backup file sitting on S3.
>
> - **The "Staff" Solution:** **Cryptographic Erasure (Crypto-shredding).** Each user's PII is encrypted with a unique "User Key." When the user asks to be forgotten, you delete their _User Key_ from your active key management system. The data remains in the backups, but it is now mathematically impossible to decrypt.

### Q2: What is "Searchable Encryption" and why do we need it for PII?

> **Answer:** If you encrypt a user's `email` field with AES-256, you can no longer run a SQL query like `SELECT * FROM users WHERE email = 'test@test.com'`.
>
> - **The Trade-off:**
>   1. **Deterministic Encryption:** The same input always produces the same ciphertext. (Allows searching but is less secure).
>   2. **Blind Indexing:** Store a hashed version of the email in a separate column. You search against the hash, but display the encrypted value.

### Q3: Explain "Differential Privacy" in the context of data analytics.

> **Answer:** If you want to release a dataset of "average salaries" without revealing individual PII, an attacker can sometimes "triangulate" an individual if the dataset is small.
>
> - **The Solution:** **Differential Privacy** adds a mathematically calculated amount of "noise" to the results. It ensures that the presence or absence of a single individual in the dataset doesn't significantly change the output of the query, protecting their anonymity while maintaining statistical accuracy.

### Q4: Data Sovereignty: How do you architect a system that must keep EU data in the EU and US data in the US?

> **Answer:** You cannot use a single global database.
>
> - **The Architecture:**
>   1. **Sharding by Region:** Partition your database clusters geographically.
>   2. **Regional Routing:** Use an **API Gateway** or **Global Load Balancer** (like AWS Route53 Geolocation) to route requests to the correct regional cluster based on the user's origin.
>   3. **Global Metadata:** Store only non-PII identifiers in a global "discovery" service to help route users if they travel between regions.

---

## Compliance Reference

| Regulation | Scope                | Key Requirement                                          |
| :--------- | :------------------- | :------------------------------------------------------- |
| **GDPR**   | EU Citizens          | Right to be forgotten, data portability.                 |
| **CCPA**   | California Residents | Right to know what data is collected.                    |
| **HIPAA**  | US Healthcare        | Strict protection of Protected Health Information (PHI). |
