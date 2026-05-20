# Feature Flags and Security

Feature flags (also known as feature toggles) allow you to enable or disable features in your application without deploying new code. While they are a powerful tool for CI/CD, they introduce specific security considerations.

## Security Use Cases for Feature Flags

### 1. Kill Switches

If a new feature is found to have a critical security vulnerability or is causing a DoS on your database, a feature flag acts as a "kill switch" to immediately disable it globally.

### 2. Gradual Rollout (Canary Releases)

By enabling a feature for only 1% of users, you can monitor for unexpected security issues or performance bottlenecks before a full release.

### 3. Permission-Based Access

Feature flags can be used to gate features for specific user roles or Beta testers, acting as a secondary layer of authorization.

---

## Security Risks of Feature Flags

### 1. Information Leakage

If feature flag names or states are exposed in client-side code (e.g., in a global `window.config` object), attackers can discover upcoming features or hidden administrative tools.

- **Risk:** `if (window.flags.adminBeta) { ... }`
- **Mitigation:** Only send the flags relevant to the current user to the client. Never send the entire flag configuration.

### 2. Bypass Attacks

If the feature flag check only happens on the client, an attacker can easily toggle it using the browser console.

- **Risk:** `if (features.enabled('new_payment_flow')) { ... }`
- **Mitigation:** **Always** perform the feature flag check on the server as well.

### 3. Technical Debt and "Dead" Flags

Unused or legacy feature flags clutter the codebase, making it harder to audit and increasing the risk of "logic bombs" or unexpected behavior if a flag is accidentally toggled.

- **Best Practice:** Set an "expiration date" for every flag and remove the code once the feature is 100% rolled out.

---

## 🔥 Senior/Staff Level "Grill" Questions

### Q1: Is a Feature Flag a form of "Authorization"?

> **Answer:** Technically, no.
>
> - **Authorization** is "Can User X do Y?".
> - **Feature Flag** is "Is Feature Y turned on?".
> - **The Conflict:** If you use a flag to hide an admin tool, but the API endpoint itself doesn't check the user's role, an attacker can still use the tool. Always perform **RBAC/ABAC** checks independently of feature flags.

### Q2: How do you prevent "State Inconsistency" across microservices when toggling a flag?

> **Answer:** This is the "Distributed Toggle" problem. If Service A enables a new data format but Service B (the consumer) hasn't received the flag update yet, the system crashes.
>
> - **The Solution:**
>   1. **Phased Rollout:** Always update the "Consumer" first to handle the new format _before_ the "Producer" starts sending it.
>   2. **Flag Sync Service:** Use a centralized provider (like LaunchDarkly) with **Push-based updates (SSE)** to ensure all services sync within milliseconds.

### Q3: Why is "Flag Debt" a Security Risk?

> **Answer:** Unused flags make the code path complex and difficult to audit. An attacker might find a "Dead Flag" that still has logic attached to it and toggle it via a cache-poisoning or database-injection attack to re-enable a vulnerable or deprecated feature.

---

## Implementation Example (Express.js)

```javascript
// Middleware to inject user-specific flags
app.use(async (req, res, next) => {
  const user = req.user;
  // Fetch only relevant flags for this user from a service (LaunchDarkly, ConfigCat, etc.)
  const flags = await featureService.getFlagsForUser(user.id);

  // Attach to request for server-side checks
  req.flags = flags;

  // Pass to client-side (only what's needed)
  res.locals.clientFlags = {
    enableNewUI: flags.enableNewUI,
  };
  next();
});

// Server-side check
app.post('/api/new-feature', (req, res) => {
  if (!req.flags.enableNewFeature) {
    return res.status(403).send('Feature not enabled');
  }
  // ... logic
});
```
