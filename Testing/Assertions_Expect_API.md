# Assertions, Matchers & Expect API Architecture (Jest & Vitest)

> **Scope:** Deep-dive into the `expect` assertion engine across Jest and Vitest, equality algorithms (`toBe` vs `toEqual` vs `toStrictEqual`), asymmetric matchers, soft assertions, async polling (`expect.poll`), and custom matcher authoring (`expect.extend`).

---

## Table of Contents

- [Assertions, Matchers \& Expect API Architecture (Jest \& Vitest)](#assertions-matchers--expect-api-architecture-jest--vitest)
  - [Table of Contents](#table-of-contents)
  - [1. The Equality Spectrum: `toBe` vs. `toEqual` vs. `toStrictEqual`](#1-the-equality-spectrum-tobe-vs-toequal-vs-tostrictequal)
    - [The Deadly `toEqual` vs `toStrictEqual` Difference:](#the-deadly-toequal-vs-tostrictequal-difference)
  - [2. Asymmetric Matchers \& Partial Object Matching](#2-asymmetric-matchers--partial-object-matching)
    - [Common Asymmetric Matchers:](#common-asymmetric-matchers)
  - [3. Modern Vitest Expect Capabilities](#3-modern-vitest-expect-capabilities)
    - [Soft Assertions (`expect.soft`)](#soft-assertions-expectsoft)
    - [Async Polling (`expect.poll`)](#async-polling-expectpoll)
    - [Unreachable Assertions (`expect.unreachable`)](#unreachable-assertions-expectunreachable)
  - [4. Promise Assertions: `.resolves` \& `.rejects`](#4-promise-assertions-resolves--rejects)
  - [5. Authoring Custom Matchers with `expect.extend`](#5-authoring-custom-matchers-with-expectextend)
  - [6. Complete Matchers Quick-Reference Matrix](#6-complete-matchers-quick-reference-matrix)
  - [7. Official Documentation \& Authoritative References](#7-official-documentation--authoritative-references)

---

## 1. The Equality Spectrum: `toBe` vs. `toEqual` vs. `toStrictEqual`

Choosing the wrong equality matcher causes false passes or confusing test failures:

```text
+-----------------------+------------------------------------+------------------------------------+
| Matcher               | Comparison Algorithm               | Edge Case Handling                 |
+-----------------------+------------------------------------+------------------------------------+
| **`toBe(val)`**       | `Object.is(a, b)` (Primitive /     | Checks memory reference equality.  |
|                       | Strict reference identity)         | `{ a: 1 } !== { a: 1 }` (Fails!)   |
+-----------------------+------------------------------------+------------------------------------+
| **`toEqual(val)`**    | Deep recursive value equality      | ⚠️ Ignores `undefined` object      |
|                       |                                    | keys & class prototypes.           |
+-----------------------+------------------------------------+------------------------------------+
| **`toStrictEqual()`** | Strict deep value & type equality  | ✅ Checks prototypes, array holes, |
|                       | (Gold standard for objects)        | and explicit `undefined` fields.   |
+-----------------------+------------------------------------+------------------------------------+
```

### The Deadly `toEqual` vs `toStrictEqual` Difference:

```typescript
class User {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

const obj1 = { name: 'Atul' };
const obj2 = new User('Atul');

// ⚠️ toEqual PASSES (ignores class prototype difference!):
expect(obj1).toEqual(obj2); // PASSES

// ✅ toStrictEqual FAILS (catches class prototype mismatch!):
expect(obj1).toStrictEqual(obj2); // FAILS (Correct behavior!)
```

---

## 2. Asymmetric Matchers & Partial Object Matching

When asserting on complex objects containing dynamic timestamps, auto-incrementing IDs, or random UUIDs, use **Asymmetric Matchers** instead of fragile exact object snapshots:

```typescript
it('creates user with dynamic server timestamps', () => {
  const user = createUser('atul@example.com');

  expect(user).toEqual(
    expect.objectContaining({
      id: expect.stringMatching(/^usr_[a-z0-9]{12}$/),
      email: 'atul@example.com',
      createdAt: expect.any(Date),
      roles: expect.arrayContaining(['USER']),
      metadata: expect.anything(),
    }),
  );
});
```

### Common Asymmetric Matchers:

- `expect.anything()`: Matches anything except `null` or `undefined`.
- `expect.any(Constructor)`: Matches any value created with the given constructor (e.g. `expect.any(Number)`, `expect.any(Function)`).
- `expect.stringContaining(str)` / `expect.stringMatching(regex)`.
- `expect.arrayContaining(array)`: Matches arrays containing a subset of items in any order.
- `expect.objectContaining(obj)`: Matches objects containing a subset of key-value pairs.
- `expect.not.objectContaining(obj)`.

---

## 3. Modern Vitest Expect Capabilities

### Soft Assertions (`expect.soft`)

By default, an assertion failure immediately terminates test execution, skipping all subsequent checks. `expect.soft()` marks the failure but **continues running subsequent assertions**, allowing you to see all errors in a single test run:

```typescript
it('validates entire user response structure', () => {
  const res = fetchUserProfile();

  expect.soft(res.status).toBe(200);
  expect.soft(res.body.name).toBe('Atul');
  expect.soft(res.body.role).toBe('Staff Engineer');
  expect.soft(res.body.isActive).toBe(true);
  // All failing assertions are reported together at test completion!
});
```

---

### Async Polling (`expect.poll`)

Instead of writing manual retry loops, `expect.poll(fn, options)` continuously re-evaluates a callback until the assertion passes or times out:

```typescript
it('polls job status until completion', async () => {
  submitAsyncJob('job_123');

  // Polls getJobStatus('job_123') every 100ms up to 3000ms
  await expect
    .poll(() => getJobStatus('job_123'), {
      timeout: 3000,
      interval: 100,
    })
    .toBe('COMPLETED');
});
```

---

### Unreachable Assertions (`expect.unreachable`)

Ensures that guarded code branches are never reached:

```typescript
it('throws a specific validation error', async () => {
  try {
    await processPayment({ amount: -50 });
    expect.unreachable('Payment with negative amount should have thrown!');
  } catch (err: any) {
    expect(err.message).toMatch(/invalid amount/i);
  }
});
```

---

## 4. Promise Assertions: `.resolves` & `.rejects`

Always `await` promise assertion chains to avoid unhandled async rejections:

```typescript
it('handles async resolutions and rejections', async () => {
  // 1. Resolves
  await expect(fetchUser(10)).resolves.toEqual({ id: 10, name: 'Atul' });

  // 2. Rejects
  await expect(fetchUser(-1)).rejects.toThrow('User not found');
  await expect(fetchUser(-1)).rejects.toThrowError(NotFoundError);
});
```

---

## 5. Authoring Custom Matchers with `expect.extend`

Create reusable, domain-specific matchers to drastically improve test readability and error reporting:

```typescript
// matchers/toBeWithinRange.ts
import { expect } from 'vitest';

expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// TypeScript declaration merging
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeWithinRange(floor: number, ceiling: number): void;
  }
}
```

```typescript
// Usage in tests:
it('computes response time within acceptable SLA range', () => {
  const latencyMs = calculateLatency();
  expect(latencyMs).toBeWithinRange(10, 50);
});
```

---

## 6. Complete Matchers Quick-Reference Matrix

| Matcher Category       | Methods                                                                                   | Example                                      |
| :--------------------- | :---------------------------------------------------------------------------------------- | :------------------------------------------- |
| **Identity & Values**  | `toBe`, `toEqual`, `toStrictEqual`, `toBeDefined`, `toBeUndefined`, `toBeNull`, `toBeNaN` | `expect(val).toBeNull()`                     |
| **Truthiness**         | `toBeTruthy`, `toBeFalsy`                                                                 | `expect(isActive).toBeTruthy()`              |
| **Numbers & Math**     | `toBeGreaterThan`, `toBeGreaterThanOrEqual`, `toBeLessThan`, `toBeCloseTo`                | `expect(0.1 + 0.2).toBeCloseTo(0.3, 5)`      |
| **Strings & Regex**    | `toMatch`, `toContain`                                                                    | `expect('Hello World').toMatch(/world/i)`    |
| **Arrays & Iterables** | `toContain`, `toContainEqual`, `toHaveLength`                                             | `expect(users).toHaveLength(3)`              |
| **Exceptions**         | `toThrow`, `toThrowError`                                                                 | `expect(() => parse('')).toThrow(TypeError)` |
| **Mock Functions**     | `toHaveBeenCalled`, `toHaveBeenCalledTimes`, `toHaveBeenCalledWith`, `toHaveReturnedWith` | `expect(spy).toHaveBeenCalledTimes(1)`       |
| **Snapshots**          | `toMatchSnapshot`, `toMatchInlineSnapshot`, `toThrowErrorMatchingSnapshot`                | `expect(dom).toMatchSnapshot()`              |

---

## 7. Official Documentation & Authoritative References

- [Jest `expect` API & Matchers Specification](https://jestjs.io/docs/expect)
- [Vitest `expect` API & Soft Assertions Guide](https://vitest.dev/api/expect.html)
- [Testing Library Jest-DOM Custom Matchers](https://github.com/testing-library/jest-dom)
- [Chai Assertion Library Documentation](https://www.chaijs.com/api/bdd/)
