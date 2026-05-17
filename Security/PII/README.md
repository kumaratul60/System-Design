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

## Compliance Reference

| Regulation | Scope                | Key Requirement                                          |
| :--------- | :------------------- | :------------------------------------------------------- |
| **GDPR**   | EU Citizens          | Right to be forgotten, data portability.                 |
| **CCPA**   | California Residents | Right to know what data is collected.                    |
| **HIPAA**  | US Healthcare        | Strict protection of Protected Health Information (PHI). |
