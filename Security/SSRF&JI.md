# Server-Side Security: SSRF, SSJI, Deserialization & XXE

This document covers critical server-side vulnerabilities: **Server-Side Request Forgery (SSRF)**, **Server-Side JavaScript Injection (SSJI)**, **Insecure Deserialization**, and **XML External Entity (XXE)**.

---

## 1. Server-Side Request Forgery (SSRF)

SSRF is a vulnerability where an attacker forces a server to make requests to unintended locations. This is typically used to target internal systems that are not accessible from the public internet.

### How it Works (The Attack Flow)

![SSRF Attack Diagram](https://raw.githubusercontent.com/atulkumarawasthi/SystemDesign/main/Security/assets/ssrf-diagram.png)
_(Note: Imagine a diagram where a Hacker sends a payload to a Web Server, which then proxies that request to a Private Network containing internal databases, services, or cloud metadata endpoints.)_

1.  **Hacker** sends a request to the **Web Server** containing a malicious URL.
2.  The **Web Server** (vulnerable) fetches the URL without proper validation.
3.  The request hits an **Internal Service** (e.g., a database, an admin panel, or cloud metadata) within the **Private Network**.

### Vulnerable Example: Unvalidated User Input

If your server takes a URL from a query parameter and fetches it directly, it is vulnerable.

```javascript
// VULNERABLE CODE
const fetch = require('node-fetch');

async function makeRequest(url) {
  try {
    const response = await fetch(url); // Directly fetching user-provided URL
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

// Attack Example: Accessing AWS Metadata to steal credentials
// URL: https://myapp.com/proxy?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/admin-role
```

### Critical Target: Cloud Metadata (169.254.169.254)

Cloud providers (AWS, GCP, Azure) provide a metadata service at a local IP `169.254.169.254`. If an attacker can reach this via SSRF, they can often steal **IAM credentials**, giving them full access to your cloud infrastructure.

### Prevention: Whitelisting & Validation

The most effective way to prevent SSRF is to strictly validate and whitelist allowed domains.

```javascript
// SECURE CODE: Using a Whitelist
const allowedDomains = ['api.example.com', 'trusted-service.internal'];

function isAllowedDomain(url) {
  try {
    const parsedURL = new URL(url);
    // Only allow specific domains from the whitelist
    return allowedDomains.includes(parsedURL.hostname);
  } catch (e) {
    return false; // Invalid URL format
  }
}

app.get('/proxy', (req, res) => {
  const userUrl = req.query.url;

  if (isAllowedDomain(userUrl)) {
    // Safe to make the request
    makeSafeRequest(userUrl);
  } else {
    return res.status(403).send('Access to this domain is not allowed.');
  }
});
```

---

## 2. Server-Side JavaScript Injection (SSJI)

SSJI occurs when an application takes untrusted user input and executes it as JavaScript code on the server.

### 1. Direct Execution of User Code

**Issue:**

```javascript
const userCode = req.body.code; // User-provided JavaScript code
eval(userCode); // Directly executing user code
```

**Mitigation:**

```javascript
const userCode = req.body.code; // User-provided JavaScript code
// Do not directly execute user-provided code
// Use safe alternatives like lookup tables or sandboxes.
```

### 2. Using Dangerous Functions (`new Function`)

**Issue:**

```javascript
const userCode = req.body.code; // User-provided JavaScript code
const func = new Function(userCode); // Using new Function to execute user code
func();
```

**Mitigation:**

```javascript
const userCode = req.body.code; // User-provided JavaScript code
// Do not use new Function() to execute user-provided code
```

### Vulnerable Example: The `new Function()` Constructor

Developers sometimes blindly use `new Function()` to create a function from a string. If this string is user-provided, it leads directly to SSJI.

```javascript
// VULNERABLE CODE
app.post('/custom-sort', (req, res) => {
  // The user provides a string that is supposed to be the body of a sorting function
  const userCode = req.body.sortLogic;

  // Dangerous: Creating a function from an untrusted string
  const sortFn = new Function('a', 'b', userCode);

  const sortedData = myData.sort(sortFn);
  res.json(sortedData);
});
```

### Vulnerable Sinks (Avoid these!)

The most dangerous functions in Node.js that enable SSJI are:

- `eval()`
- `setTimeout(string, delay)`
- `setInterval(string, delay)`
- `new Function(string)`

### 3. Inadequate Input Validation

**Issue:**

```javascript
const userInput = req.body.input; // User-provided input
// Blindly trusting input or using weak validation
```

**Mitigation:**

```javascript
const userInput = req.body.input; // User-provided input

if (!isValidInput(userInput)) {
  // Handle the invalid input (return error or sanitize)
  return res.status(400).send('Invalid input');
}

function isValidInput(input) {
  // Implement proper input validation logic
  // Reject any input that contains potentially dangerous characters
  const regex = /^[a-zA-Z0-9\s]+$/; // Example: Allow only letters, numbers, and spaces
  return regex.test(input);
}
```

### 4. The Async Sink Trap: `setTimeout` & `setInterval`

Timers are often used "blindly," leading to both security vulnerabilities and severe application instability.

#### A. Security Issue: String Evaluation (SSJI)

**Issue:** If the first argument to `setTimeout` is a string, it is evaluated as code, exactly like `eval()`.

```javascript
const delay = req.body.delay;
const task = req.body.task; // Attacker sends "res.send(process.env)"
setTimeout(task, delay); // VULNERABLE: Executes arbitrary code
```

#### B. Stability Issue: Uncaught Exceptions & Process Crashes

**Issue:** Errors thrown inside a `setTimeout` callback are asynchronous. They cannot be caught by a `try...catch` block surrounding the `setTimeout` call. If unhandled, they bubble up to the **global scope**, causing an `uncaughtException` which crashes the entire Node.js process.

```javascript
// VULNERABLE & UNSTABLE CODE
try {
  setTimeout(() => {
    // Some logic that fails
    throw new Error('Secret Database Error!');
  }, 1000);
} catch (e) {
  // ❌ THIS WILL NOT WORK. The error happens after this block has finished.
  console.log('Caught error:', e);
}
// The server CRASHES here because the error is unhandled in the async context.
```

#### Mitigation: The Safe Way

1.  **Never pass strings:** Always pass an anonymous function or a reference to a function.
2.  **Internal Try-Catch:** Always wrap the logic _inside_ the callback in a `try...catch`.

```javascript
// ✅ SECURE & STABLE CODE
setTimeout(() => {
  try {
    // Safe execution of logic
    runBusinessLogic();
  } catch (err) {
    console.error('Async Task Failed:', err);
    // Log internally, don't let it crash the process
  }
}, 1000);
```

### Attack Payloads

- `expression = "res.send(process.env)"` // Leaks secret environment variables
- `expression = "require('fs').readFileSync('/etc/passwd')"` // Reads sensitive files
- `expression = "process.exit(1)"` // Kills the server process (DoS)

### Prevention & Mitigation Strategies

1.  **Avoid Execution Sinks Entirely:** Never use `eval()`, `new Function()`, or string-based `setTimeout()` on user input.
2.  **Lookup Tables (Map):** Instead of executing dynamic logic (like the custom sort example above), map user input to pre-defined, safe functions.
3.  **Strict Input Validation:** Implement proper input validation logic to reject any input containing dangerous characters.
    ```javascript
    // MITIGATION: Whitelist alphanumeric characters only
    const regex = /^[a-zA-Z0-9\s]+$/;
    if (!regex.test(userInput)) {
      return res.status(400).send('Invalid input');
    }
    ```
4.  **Sandbox untrusted code:** If you MUST run dynamic code, use a highly secure sandbox like **`isolated-vm`**.

### The Dangers of `eval()`

The `eval()` function is one of the most dangerous features in JavaScript. It evaluates a string as code in the **local scope**, giving it full access to the server's environment.

#### 1. Security Risks (The "Why")

- **Full Context Access:** Unlike a sandbox, `eval()` has access to local variables, global objects (`process`, `module`), and can `require()` any library (like `fs` to read files or `child_process` to run system commands).
- **Data vs. Code:** It blurs the line between data and code. Anything a user sends as "data" can suddenly become "logic" executed by your server.

#### 2. Performance & Debugging

- **V8 De-optimization:** Modern JS engines (like V8) cannot optimize code that uses `eval()` because they cannot predict what the code will do at runtime. This makes your application significantly slower.
- **Obfuscated Stack Traces:** Errors occurring inside an `eval()` string are extremely difficult to debug, as the stack trace often doesn't point to a specific file or line number.

#### 3. Common "Blind" Use Cases & Safe Alternatives

| Blind Use Case              | Why people use it                                 | **Safe Alternative**                              |
| :-------------------------- | :------------------------------------------------ | :------------------------------------------------ |
| **Parsing JSON**            | Legacy way to convert strings to objects.         | `JSON.parse(string)`                              |
| **Dynamic Property Access** | Accessing `obj.user_name` using a variable key.   | `obj[keyName]`                                    |
| **Dynamic Logic**           | Choosing which function to run based on a string. | **Lookup Table (Map)** of functions.              |
| **Math Calculations**       | Evaluating `"2 + 2"` from a string.               | A dedicated math parser library (e.g., `mathjs`). |

---

## 3. Insecure Deserialization

Insecure deserialization occurs when untrusted data is used to abuse the logic of an application, inflict a Denial of Service (DoS) attack, or even execute arbitrary code.

**Issue:**

```javascript
const serializedData = req.body.data; // User-provided serialized data
const deserializedObject = deserialize(serializedData); // Insecure deserialization
```

**Mitigation:**

```javascript
const serializedData = req.body.data; // User-provided serialized data

// Implement secure deserialization and validate the data
try {
  // Use safe parsers like JSON.parse for JSON data
  const deserializedObject = JSON.parse(serializedData);

  // Validate the deserializedObject for any malicious content
  if (isValidData(deserializedObject)) {
    // Process the deserializedObject
  } else {
    res.status(400).send('Invalid data');
  }
} catch (error) {
  // Handle deserialization errors
  res.status(500).send('Error while deserializing data');
}

function isValidData(data) {
  // Implement validation logic to check the deserialized data for safety
  // Example: Use Zod or Joi to validate the object structure
  return true;
}
```

### Common Exploitation Vectors

#### 1. Injection Attacks in SQL/NoSQL Databases

Attackers can use specially crafted JSON objects to bypass authentication in NoSQL databases like MongoDB.

```javascript
// INSECURE: Directly using user input in a query
const userInput = { username: 'admin', password: { $ne: null } };
// The {$ne: null} condition is "Not Equal to Null", which evaluates to true.
```

#### 2. Resource Exhaustion (Denial of Service)

A large payload can be used to crash the server or consume all available memory.

```javascript
// INSECURE: Parsing an excessively large user-provided string
const userInput = '{ "data": "' + 'A'.repeat(1000000) + '" }';
const data = JSON.parse(userInput); // Consumes significant CPU and memory
```

#### 3. Buffer & Class Deserialization

Using functions that convert data into complex objects (like Buffers or Classes) can be exploited if the input is not validated.

```javascript
// INSECURE: Creating a Buffer directly from user-provided data
const userInput = { type: 'Buffer', data: [72, 101, 108, 108, 111] };
const buffer = JSON.parse(userInput);
const text = Buffer.from(buffer).toString(); // Can lead to memory corruption or info leaks
```

#### 4. Prototype Pollution

A specialized form of injection where an attacker modifies the base object prototype (`Object.prototype`) to inject malicious properties into every object in the application.

```javascript
// INSECURE: Deep-merging user input without checking for __proto__
function deepMerge(target, source) {
  for (let key in source) {
    if (key === '__proto__') continue; // Basic fix, but better to use Map or null-prototype objects
    target[key] = source[key];
  }
}

// Attack Payload: { "__proto__": { "admin": true } }
// Result: Every object in your app now has { admin: true }, bypassing auth checks!
```

---

## 4. XML External Entity (XXE)

XXE is a vulnerability that occurs when an XML parser improperly handles external entities within a `DOCTYPE` declaration. This can allow attackers to read local files, probe internal networks, or perform SSRF.

### Vulnerable Example: Malicious XML

An attacker sends an XML document containing a reference to a local file.

```xml
<!-- Malicious XML document -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [
  <!ELEMENT foo ANY >
  <!ENTITY xxe SYSTEM "file:///etc/passwd" >]>
<foo>&xxe;</foo>
```

### Prevention Strategies

1.  **Disable DTDs entirely:** If your application doesn't need them, tell the parser to ignore them.
2.  **Disable External Entity Processing:** Ensure that `SYSTEM` or `PUBLIC` entities are not expanded.
3.  **Prefer Pure JS Parsers:** Libraries like `xml2js` are inherently safer.
