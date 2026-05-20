# Input Validation and Sanitization

Input validation and sanitization are the first line of defense in any secure application. They ensure that the data entering your system is clean, safe, and exactly what you expect.

## Core Concepts

- **Validation:** Checking if the data meets a specific format (e.g., "Is this a valid email?", "Is this age a positive number?").
- **Sanitization:** Cleaning or transforming the data to make it safe for use (e.g., stripping HTML tags, trimming whitespace, escaping special characters).

---

## Client-Side vs. Server-Side

| Feature            | Client-Side Validation                         | Server-Side Validation                       |
| :----------------- | :--------------------------------------------- | :------------------------------------------- |
| **Primary Goal**   | **User Experience (UX)** - Immediate feedback. | **Security** - The authoritative gatekeeper. |
| **Trust Level**    | **Untrusted** - Can be bypassed easily.        | **Trusted** - Under your control.            |
| **Bypass Method**  | Disabling JS, DevTools, `curl` requests.       | None (if implemented correctly).             |
| **Recommendation** | Use for speed and guidance.                    | **Mandatory** for every single input.        |

---

## Key Strategies (Implementation Guide)

### 1. Whitelist Validation (Prefer over Blacklist)

Always define what **is** allowed rather than what is forbidden.

- **Blacklist approach (Bad):** "Don't allow `<script>` tags." (Attackers will use `<img>` or `<iframe>` instead).
- **Whitelist approach (Good):** "Only allow alphanumeric characters and underscores."

**How to do it:** Use an array of allowed values or a strict schema.

```javascript
const allowedRoles = ['admin', 'user', 'editor'];
if (!allowedRoles.includes(req.body.role)) {
  throw new Error('Invalid role - only admin, user, or editor allowed');
}
```

### 2. Regular Expressions (Regex)

Enforce strict formats for strings like phones, IDs, or codes.

- **Example (Email):** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Example (Username):** `/^[a-zA-Z0-9_]{3,16}$/` (Alphanumeric, 3-16 chars).

**How to do it:** Use `.test()` to validate against a pattern.

```javascript
const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
if (!phoneRegex.test(req.body.phone)) {
  return res.status(400).send('Invalid phone number format');
}
```

### 3. Escape User Input

Prevent **Cross-Site Scripting (XSS)** by escaping special characters so the browser treats them as literal text instead of executable code.

| Character | HTML Entity (Escaped) |
| :-------- | :-------------------- |
| `<`       | `&lt;`                |
| `>`       | `&gt;`                |
| `&`       | `&amp;`               |
| `"`       | `&quot;`              |
| `'`       | `&#x27;`              |
| `/`       | `&#x2F;`              |

- **Rule:** Escape data when rendering it in the browser to prevent malicious scripts from executing.
- **Example:** `<script>` becomes `&lt;script&gt;`, which is harmlessly displayed as text.

### 4. Parameterized URLs & Queries

Never concatenate user input directly into SQL queries or API URLs.

- **Vulnerable:** `db.query("SELECT * FROM users WHERE id = " + req.params.id)`
- **Safe:** `db.query("SELECT * FROM users WHERE id = $1", [req.params.id])`

**How to do it:** Use placeholders (like `$1` or `?`) provided by your DB driver.

```javascript
// ✅ SAFE: The DB driver handles escaping automatically
const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

### 5. Validate Data Types

Ensure the input matches the expected primitive type.

- **Checks:** Is it a `string`? `number`? `boolean`? `Date`?

**How to do it:** Use `typeof` or schema libraries like Zod.

```javascript
if (typeof req.body.age !== 'number' || req.body.age < 0) {
  return res.status(400).send('Age must be a positive number');
}
```

### 6. Length & Size Checks

Prevent **Buffer Overflow** and **Denial of Service (DoS)** attacks.

- **Length:** Set `maxlength` for text inputs (e.g., "Bio" should not be 1 million characters).
- **Size:** Limit the size of JSON payloads (e.g., use `express.json({ limit: '10kb' })`).

**How to do it:** Set limits in middleware and check string lengths.

```javascript
// Limit total JSON payload to 10kb
app.use(express.json({ limit: '10kb' }));

// Check individual string lengths
if (req.body.bio.length > 500) {
  return res.status(400).send('Bio exceeds 500 characters');
}
```

### 7. Images & File Uploads

Files are high-risk inputs that can hide malware.

- **Type Check:** Validate by magic numbers (file headers), not just extensions.
- **Renaming:** Always rename files on the server (e.g., `user_123_avatar.png`) to prevent directory traversal.
- **Scanning:** Use an antivirus (like ClamAV) to scan uploaded files.
- **Storage:** Store files in a separate bucket (S3) with restricted execution permissions.

**How to do it:**

1. **Magic Numbers:** Use libraries like `file-type` to check the binary header.
2. **Rename:** Always rename files (e.g., `uuid() + '.jpg'`).
3. **Separate Storage:** Store files in S3/Cloud Storage, never on your app server.

### 8. Error Handling

Don't leak system secrets (like table names or stack traces) in error responses.

- **How to do it:** Log the real error for developers, but send a generic message to the user.

```javascript
try {
  await db.save(data);
} catch (err) {
  console.error('DB Save Error:', err); // Internal log
  res.status(500).send('Internal Server Error'); // Generic user response
}
```

### 9. Security Headers

Protect the browser environment from common attacks.

- **How to do it:** Use the **Helmet.js** middleware for Express.

```javascript
import helmet from 'helmet';
app.use(helmet()); // Sets CSP, HSTS, X-Frame-Options, etc.
```

---

## Senior/Staff Level "Grill" Questions

### Q1: What is "ReDoS" (Regular Expression Denial of Service) and how do you prevent it?

> **Answer:** ReDoS occurs when a malicious string triggers "Exponential Backtracking" in a poorly written regex (e.g., `(a+)+$`).
>
> - **The Attack:** An attacker sends a string like `aaaaaaaaaaaaaaaaaaaaaaaaaaaaa!` which takes minutes or hours to process, pegging the CPU and crashing the server.
> - **The Fix:**
>   1. **Regex Static Analysis:** Use tools like `safe-regex` to detect vulnerable patterns.
>   2. **Timeouts:** Use a regex engine that supports execution timeouts.
>   3. **Simplicity:** Avoid nested quantifiers and complex alternations in regex used on untrusted user input.

### Q2: Explain the "Canonicalization" (Path Traversal) attack.

> **Answer:** This occurs when a server fails to resolve "Shortcuts" (like `../`) in a filename before using it.
>
> - **The Attack:** A user uploads a file named `../../../etc/passwd`. If the server blindly concatenates this to `/uploads/`, it will overwrite or read system files.
> - **The Fix:** Always **Normalize** the path (e.g., `path.resolve()` in Node.js) and check if the resulting absolute path still starts with the intended directory.

### Q3: Why is "Double Encoding" a common bypass for input filters?

> **Answer:** An attacker sends a payload like `%253Cscript%253E`.
>
> 1. The **Security Filter** decodes it once: `%3Cscript%3E`. It looks safe (not executable).
> 2. The **Application Logic** decodes it a _second_ time (e.g., during database insertion or template rendering): `<script>`.
>
> - **The Fix:** Always decode once at the edge and perform validation on the **Final Normalized Data**.

### Q4: When is "Client-Side Sanitization" actually dangerous?

> **Answer:** If you rely on the client (browser) to sanitize data before sending it to the server.
>
> - **The Danger:** An attacker can easily bypass your client-side script using `curl` or a proxy, sending the "raw" malicious payload directly to your server.
> - **The "Staff" Rule:** Client-side sanitization is for **UX**; Server-side sanitization is for **Security**. Never trust data coming from the client, even if it was "sanitized" there.

---

## The "Safe Way": Using Frameworks & Libraries

Modern frameworks provide battle-tested tools. **Don't build your own security logic from scratch.**

### Backend: Express.js + Zod

[Zod](https://zod.dev/) is the modern standard for schema validation and sanitization.

```javascript
import { z } from 'zod';

const userSchema = z.object({
  username: z.string().min(3).trim(), // Sanitization: auto-trim
  email: z.string().email().toLowerCase(), // Normalization
  age: z.number().positive().int(),
});

app.post('/user', (req, res) => {
  const result = userSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json(result.error);
  }
  const userData = result.data; // Valid and Sanitized
});
```

### Frontend: React + React Hook Form

Provide instant feedback to users before they even hit the "Submit" button.

```javascript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const Registration = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
  });
  // ... render form
};
```

---

## Security Issues & Common Pitfalls

1.  **Trusting the Client:** Thinking `maxlength="10"` in HTML is enough security.
2.  **Improper Error Handling:** Leaking system secrets in raw error messages.
3.  **Blacklist Validation:** Trying to block specific "bad" words (attackers always find a workaround).
4.  **Inconsistent Sanitization:** Sanitizing data on input but then rendering it unsafely.

---

## Best Practices Checklist

- [ ] **Use Framework libraries:** Leverage Zod, Joi, or built-in framework validators.
- [ ] **Avoid building your own:** Use **DOMPurify** for HTML; don't write your own regex for complex sanitization.
- [ ] **Security Headers:** Use `Helmet.js` to set `Content-Security-Policy` (CSP).
- [ ] **Regular Updates:** Patch your dependencies regularly to fix newly discovered bypasses.
- [ ] **Security Audits:** Regularly test your inputs with tools like OWASP ZAP.
- [ ] **Education & Training:** Ensure the whole team understands that **all user input is malicious until proven otherwise.**
