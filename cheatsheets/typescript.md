# TypeScript API & Pattern Cheat Sheet

A comprehensive reference for TypeScript configuration, operators, utility types, compile-time systems, and integration with React.

---

## Table of Contents

- [1. Type Erasure & The Compilation Timeline](#1-type-erasure--the-compilation-timeline)
- [2. Structural Typing & Duck Typing](#2-structural-typing--duck-typing)
- [3. `type` vs. `interface` vs. `enum` Decision Matrix](#3-type-vs-interface-vs-enum-decision-matrix)
- [4. Type Narrowing & Guards](#4-type-narrowing--guards)
- [5. Type Assertions (`as`) vs. Annotations (`:`) vs. `satisfies` vs. Guards](#5-type-assertions-as-vs-annotations--vs-satisfies-vs-guards)
- [6. Nullable Types & Chaining](#6-nullable-types--chaining)
- [7. `any` vs. `unknown` vs. `never` vs. `void` (And Problematic Object Types)](#7-any-vs-unknown-vs-never-vs-void-and-problematic-object-types)
- [8. Utility Types](#8-utility-types)
- [9. Generics, Constraints & `const` Type Parameters](#9-generics-constraints--const-type-parameters)
- [10. Mapped & Conditional Types](#10-mapped--conditional-types)
- [11. Type Inference & Advanced Operators](#11-type-inference--advanced-operators)
- [12. Function Types & Overloads](#12-function-types--overloads)
- [13. React + TypeScript Integration](#13-react--typescript-integration)
- [14. Type Variance (Covariance, Contravariance, Bivariance & Invariance)](#14-type-variance-covariance-contravariance-bivariance--invariance)
- [15. Declaration Files & Module Augmentation](#15-declaration-files--module-augmentation)
- [16. Compiler Options Worth Knowing (`tsconfig.json`)](#16-compiler-options-worth-knowing-tsconfigjson)

---

## 1. Type Erasure & The Compilation Timeline

### The Compilation Timeline

```text
          Write Code (.ts)
                 │
                 ▼
        TypeScript Compiler (tsc)
        ✔ Checks all types
        ✔ Finds errors
        ✔ Provides IntelliSense
                 │
         Removes all types
                 │
                 ▼
        Pure JavaScript (.js)
                 │
                 ▼
      Browser / Node executes it
```

### What actually happens

The compiler uses types to reason about your code, then discards them.
For example, this TypeScript code:

```ts
type User = {
  name: string;
};

function greet(user: User): string {
  return `Hi ${user.name}`;
}
```

During compilation, TypeScript checks:

1. Is the `User` type defined? (Yes)
2. Does `user` have a `name` property? (Yes)
3. Does `greet` return a `string`? (Yes)

After all checks pass, it erases the types and emits:

```js
function greet(user) {
  return `Hi ${user.name}`;
}
```

### The Spell Checker Analogy

Think of a word processor's spell checker:

```text
You write a document
        │
Spell checker finds typos
        │
You fix them
        │
Print the final document
```

The printed document doesn't contain the spell checker's red squiggly lines or notes. Similarly, the emitted JavaScript contains no types.

### Closure vs. Type Erasure

It is common to confuse compile-time and runtime behaviors.
| Concept | Closure | Type Erasure |
| :--- | :--- | :--- |
| **Stage** | JavaScript Runtime | TypeScript Compile-time |
| **State** | Variables are preserved in scope | Types are completely removed |
| **Lifecycle** | Exists while the program runs | Exists only while compiling |

### Interview Definition

> **Type erasure** is the process by which the TypeScript compiler uses type information to perform static type checking during compilation, and then removes all type annotations before emitting plain JavaScript. This delivers compile-time safety with zero runtime overhead.

### Common Type Erasure Gotchas

```ts
interface User {
  name: string;
}

// ❌ CANNOT do runtime checks on types/interfaces:
if (data instanceof User) {
} // Runtime Error: 'User' only refers to a type, but is being used as a value
if (typeof data === 'User') {
} // Bug: typeof returns JS primitives ('object', 'string', etc.)

// ❌ CANNOT inspect types dynamically at runtime:
function getKeys<T>() {
  return Object.keys(T); // Error: 'T' only refers to a type
}
```

### `import type` (Guaranteed Erasure)

To ensure type imports never accidentally bundle heavy JavaScript code or cause circular runtime dependencies, use `import type`:

```ts
import type { LargeTypeDefinition } from './heavy-module'; // 100% erased, 0 bytes emitted
import { myRuntimeHelper } from './heavy-module';
```

> **Note on Runtime Code Generation**: Almost all TypeScript constructs produce zero JavaScript. The only exceptions that emit actual runtime code are: **Classes**, **Enums**, **Namespaces**, and **Parameter Properties** (`constructor(public name: string)`).

---

## 2. Structural Typing & Duck Typing

Types do not exist at runtime. Structural typing ("duck typing") checks compatibility based on the shape of variables, not their explicit class/interface inheritance.

### Structural Typing (TypeScript Model)

TypeScript checks the **shape** of an object, not its declared class or interface name. If two types have the same properties, they are compatible.

```ts
interface User {
  name: string;
}

interface Employee {
  name: string;
}

const emp: Employee = { name: 'John' };
const user: User = emp; // ✅ Compatible because the structural shape matches
```

### Duck Typing (Runtime Analogy)

> _"If it looks like a duck, swims like a duck, and quacks like a duck, then it probably is a duck."_

```ts
interface Bird {
  fly(): void;
}

const drone = {
  fly() {
    console.log('Whirrrr');
  },
};

const b: Bird = drone; // ✅ Compatible because drone has a fly() method matching Bird
```

---

## 3. `type` vs. `interface` vs. `enum` Decision Matrix

### Overview & Capabilities

| Feature                        | `type`                      | `interface`                | `enum`                      | `const object` (`as const`) |
| :----------------------------- | :-------------------------- | :------------------------- | :-------------------------- | :-------------------------- |
| **Object Shapes**              | ✅ Yes                      | ✅ Yes (preferred for OOP) | ❌ No                       | ✅ Yes (as runtime value)   |
| **Unions (`\|`) & Primitives** | ✅ Yes (`string \| number`) | ❌ No                      | ❌ No                       | ❌ No                       |
| **Declaration Merging**        | ❌ No (errors on dupes)     | ✅ Yes (auto-merges)       | ✅ Yes                      | ❌ No                       |
| **Extends / Implements**       | Intersections (`&`)         | `extends` / `implements`   | ❌ No                       | ❌ No                       |
| **Emits Runtime JavaScript?**  | ❌ 0 bytes (Erased)         | ❌ 0 bytes (Erased)        | ⚠️ **Yes** (Generates IIFE) | ✅ Plain JS object          |
| **Type Safety**                | Pure compile-time           | Pure compile-time          | ⚠️ Loose on numeric enums   | ✅ 100% Narrow literal      |

---

### Deep Dive: `type` vs. `interface`

```ts
// 1. Interface: Ideal for open models & declaration merging
interface User {
  id: string;
}
interface User {
  name: string; // ✅ Automatically merged into { id: string; name: string }
}

// 2. Type Alias: Ideal for unions, tuples, primitives, and computation
type ID = string | number; // Union
type Point = [x: number, y: number]; // Tuple
type Status = 'idle' | 'loading' | 'done'; // Union Literal
type Tree<T> = { value: T; left?: Tree<T>; right?: Tree<T> }; // Recursive
```

---

### Why Avoid `enum` (And What to Use Instead)

#### How Numeric `enum` Auto-Increments:

- By default, uninitialized enums start at `0` and increment by `1`.
- If you set a numeric value on one member, the members following it **auto-increment by `1` from that number**:

```ts
enum HttpStatus {
  OK = 200,
  Created, // 201 (auto-incremented)
  Accepted, // 202 (auto-incremented)
  BadRequest = 400,
  Unauthorized, // 401 (auto-incremented)
}
```

> ⚠️ **Auto-Increment Pitfall (Accidental Duplicate Values):**
>
> ```ts
> enum Priority {
>   Low = 1,
>   Medium, // 2 (auto-incremented from 1)
>   High = 2, // 2 (collides with Medium! No compile error!)
>   Critical, // 3
> }
> ```
>
> String enums **do not** auto-increment — every member after a string value must be explicitly initialized.

#### The Problems with `enum`:

1. **Emits Runtime JS**: Unlike almost all of TypeScript, `enum` generates runtime code (an IIFE function), adding bundle bloat.
2. **Numeric Enum Pitfall**: Numeric enums are not type-safe — any arbitrary number is assignable to them!
   ```ts
   enum Status {
     Active,
     Inactive,
   }
   function setStatus(s: Status) {}
   setStatus(999); // ❌ Compiles with zero errors! (Unsafe reverse mapping bug)
   ```
3. **Nominal Typing**: String enums use nominal identity instead of structural strings, breaking compatibility with exact string values from JSON/APIs.

#### The Modern Replacement: `const` Object (`as const`) + Derived Type

```ts
// ✅ Modern best practice:
export const Status = {
  Pending: 'pending',
  Success: 'success',
  Failed: 'failed',
} as const;

// Derive the union type directly from the object:
export type Status = (typeof Status)[keyof typeof Status]; // 'pending' | 'success' | 'failed'

// Usage:
function handleStatus(status: Status) {}
handleStatus(Status.Pending); // ✅ Autocomplete with namespace
handleStatus('success'); // ✅ Plain string from API works directly!
```

---

### When to Use Which:

- **Use `interface`**: When designing library APIs, classes (`implements`), or public contracts that consumers may need to extend via declaration merging.
- **Use `type`**: For everything else — unions, primitives, tuples, utility types, and React component props.
- **Use `as const` object**: For fixed lookup values, status lists, configuration tables, and dropdown options.
- **Avoid `enum`**: In modern TypeScript applications unless maintaining legacy codebases.

---

## 4. Type Narrowing & Guards

TypeScript refines broad types into narrower types based on runtime checks.

```ts
function print(x: string | number) {
  if (typeof x === 'string') {
    x.toUpperCase(); // Inferred as: string
  } else {
    x.toFixed(2); // Inferred as: number
  }
}
```

### 5 Ways to Narrow Types

1.  **`typeof`**: For primitives (`typeof x === "string"`).
2.  **`instanceof`**: For classes / prototype chains (`x instanceof Date`).
3.  **`"key" in obj`**: For checking property existence (`"admin" in user`).
4.  **Discriminated Unions**: Using a shared literal tag property.
5.  **Custom Type Guards**: Functions returning type predicates (`x is string`).

### Custom Type Guards

```ts
function isString(x: unknown): x is string {
  return typeof x === 'string';
}
```

---

## 5. Type Assertions (`as`) vs. Annotations (`:`) vs. `satisfies` vs. Guards

### The Mental Model

| Mechanism              | Purpose                         | Compiler Attitude                                         | Type Widening?                         | Runtime Safety              |
| :--------------------- | :------------------------------ | :-------------------------------------------------------- | :------------------------------------- | :-------------------------- |
| **Annotation (`: T`)** | Declare required shape          | "I will enforce `T` on this value."                       | **Yes** (widens to `T`)                | Compile-time check only     |
| **Assertion (`as T`)** | Override compiler type          | _"Trust me, I know better than you."_                     | **Yes** (forces to `T`)                | ❌ **None** (can hide bugs) |
| **`satisfies T`**      | Validate shape without widening | _"Check me against `T`, but keep what I actually wrote."_ | ❌ **No** (preserves exact types/keys) | Compile-time check only     |
| **Type Guard (`is`)**  | Narrow type at runtime          | "Run this boolean test to safely narrow `T`."             | Narrowed in branch                     | ✅ **Safe** (runtime check) |

---

### Assertion (`as`) vs. `satisfies` vs. Annotation (`:`)

#### The Problem with `as` (Type Assertion)

Tells the compiler to override its checks and trust your manual assertion. It performs **zero runtime validation** and silences genuine compiler errors:

```ts
type RGB = [number, number, number];
type Color = string | RGB;

// ❌ with `as`: Compiler is forced to trust it, but loses specific types
const palette = {
  red: [255, 0, 0],
  green: '#00ff00',
} as Record<string, Color>;

// ❌ TypeScript forgets `green` is specifically a string!
// Error: Property 'toUpperCase' does not exist on type 'Color' (might be an RGB tuple)
palette.green.toUpperCase();
```

#### The Limitation of `: Type` (Type Annotation)

Annotations enforce the type, but **widen** properties to union types and forget exact keys:

```ts
// ⚠️ with `: Type`: Validates, but widens to Color
const palette: Record<string, Color> = {
  red: [255, 0, 0],
  green: '#00ff00',
};

// ❌ Still widened to string | RGB:
palette.green.toUpperCase(); // Error: Property 'toUpperCase' does not exist on type 'Color'
```

#### The Power of `satisfies` (Validation + Exact Types)

Validates that an object conforms to a shape **without widening it**, preserving autocomplete, exact literals, and member types:

```ts
// ✅ with `satisfies`: Validated AND keeps exact inferred types!
const palette = {
  red: [255, 0, 0],
  green: '#00ff00',
} satisfies Record<string, Color>;

palette.green.toUpperCase(); // ✅ Works! TS knows it's a string
palette.red.map((n) => n / 255); // ✅ Works! TS knows it's an RGB tuple
```

> **Summary:** `"as"` tells the compiler _"trust me."_ `satisfies` says _"check me, but keep what I wrote."_ Same object, but `satisfies` checks that it matches the type without widening it, so you get autocomplete and safety without unsafe casts.

---

### Type Guards (`is`)

Uses runtime validation code that the compiler trusts to narrow down types within a block:

```ts
function isUser(data: unknown): data is User {
  return typeof data === 'object' && data !== null && 'name' in data;
}

if (isUser(data)) {
  console.log(data.name); // ✅ Safe, type is narrowed to User
}
```

_Staff rule: Validate at trust boundaries (APIs, LocalStorage) with Type Guards / Zod schemas. Assertions (`as`) should never be used to silence genuine compiler type uncertainty._

---

## 6. Nullable Types & Chaining

### `null` vs `undefined`

```text
undefined -> Value is missing, unassigned, or not provided.
null      -> Value is explicitly empty, cleared, or has no value.
```

```ts
let selectedUser: User | null = null; // Explicitly no user selected yet
function findUser(id?: string) {} // id is optional (string | undefined)
```

### Optional Chaining & Nullish Coalescing

Use `?.` to access deeply nested properties safely. Use `??` to fall back to a default value _only_ when the variable is `null` or `undefined`.

```ts
const avatar = user.avatarUrl?.toLowerCase() ?? defaultAvatar;
```

_Difference between `||` and `??`:_

```ts
0 || 10; // returns 10 (since 0 is falsy)
0 ?? 10; // returns 0 (since 0 is not null/undefined)
```

---

## 7. `any` vs. `unknown` vs. `never` vs. `void` (And Problematic Object Types)

### Why You Must Avoid `any`

`any` is a viral "turn off the type checker" escape hatch. It spreads silently throughout your application:

```ts
// ❌ Dangerous contagion:
function parseInput(input: any) {
  return input.trim(); // No error if input is a number, will crash at runtime!
}
const result = parseInput(42); // result is implicitly `any`, propagating un-checked types downstream
```

#### Safe Alternatives to `any`:

1. **`unknown`**: When you don't know the incoming type (APIs, JSON, user input) — forces you to narrow before using.
2. **Generics (`<T>`)**: When you want to preserve relationships between inputs and outputs.
3. **Type Guards / Zod**: Validate data at runtime boundaries to produce guaranteed types.

---

### `unknown` (The Type-Safe Top Type)

Any value can be assigned to `unknown`, but TypeScript will not let you perform any operations on it until you narrow it:

```ts
function processData(value: unknown) {
  // value.toUpperCase(); // ❌ TS Error: Object is of type 'unknown'

  if (typeof value === 'string') {
    return value.toUpperCase(); // ✅ Safe, narrowed to string
  }
}
```

---

### Avoiding `{}` vs. `Object` vs. `object` vs. `Record<string, unknown>`

A huge source of confusion in TypeScript:

| Type                          | What it actually accepts                  | Includes Primitives (`string`, `number`)?         | When to use                                |
| :---------------------------- | :---------------------------------------- | :------------------------------------------------ | :----------------------------------------- |
| **`Object`** (Capital O)      | Any value with `Object.prototype` methods | ⚠️ **Yes** (everything except `null`/`undefined`) | ❌ **Never** (almost always a mistake)     |
| **`{}`** (Empty type)         | **Any non-nullish value!**                | ⚠️ **Yes** (`"hello"`, `42`, `true`, `{}`)        | ❌ **Never** (does NOT mean empty object!) |
| **`object`** (Small o)        | Any **non-primitive** reference type      | ❌ **No** (only objects, arrays, functions)       | Rare (e.g. `Object.create(obj)`)           |
| **`Record<string, unknown>`** | Plain key-value object / dictionary       | ❌ **No**                                         | ✅ **Preferred for generic object maps**   |
| **`Record<string, never>`**   | Truly empty object `{}`                   | ❌ **No**                                         | ✅ **For strictly empty objects**          |

```ts
// ❌ Misleading: `{}` accepts primitives!
let badObj: {} = 'hello'; // ✅ Compiles without error!
let badObj2: {} = 42; // ✅ Compiles without error!

// ⚠️ `object` rejects primitives, but lacks property access:
let obj: object = { name: 'Alice' };
// obj.name; // ❌ Error: Property 'name' does not exist on type 'object'

// ✅ Best practice for dynamic dictionaries:
let userMap: Record<string, unknown> = { name: 'Alice', age: 30 };
```

---

### `never` (The Bottom Type)

Represents values that can never occur. Used for exhaustive switch/type checks and functions that never return:

```ts
function fail(msg: string): never {
  throw new Error(msg);
}

// Exhaustive check pattern in Discriminated Unions:
type Action = { type: 'ADD' } | { type: 'REMOVE' };

function reducer(action: Action) {
  switch (action.type) {
    case 'ADD':
      return 1;
    case 'REMOVE':
      return -1;
    default: {
      const _exhaustive: never = action; // ❌ TS will error if a new Action is added and unhandled
      return _exhaustive;
    }
  }
}
```

---

### `void`

Represents a function return value that should be ignored (returns `undefined` or has no return value):

```ts
function log(msg: string): void {
  console.log(msg);
}
```

---

## 8. Utility Types

### `Pick<T, K>`

Extracts a subset of properties from `T`.

```ts
type UserPreview = Pick<User, 'id' | 'name'>;
```

### `Omit<T, K>`

Removes a subset of properties from `T`.

```ts
type UserWithoutPassword = Omit<User, 'password'>;
```

### `Partial<T>`

Makes all properties of `T` optional.

```ts
type UserPatch = Partial<User>;
```

### `Required<T>`

Makes all properties of `T` required.

### `Readonly<T>`

Marks all properties of `T` as readonly.

### `Record<K, V>`

Maps keys of type `K` to values of type `V`.

```ts
type UserMap = Record<string, User>;
```

### `Exclude<T, U>`

Removes types from union `T` that are assignable to `U`.

```ts
type BasicColors = Exclude<'red' | 'blue' | 'yellow', 'yellow'>; // 'red' | 'blue'
```

### `Extract<T, U>`

Keeps types from union `T` that are assignable to `U`.

### `NonNullable<T>`

Removes `null` and `undefined` from type `T`.

```ts
type SafeString = NonNullable<string | null | undefined>; // string
```

### Function & Constructor Utilities

```ts
type FnArgs = Parameters<typeof myFunc>;
type FnResult = ReturnType<typeof myFunc>;
type AsyncResult = Awaited<ReturnType<typeof asyncFunc>>;

// Class / Constructor Utilities
type Instance = InstanceType<typeof MyClass>;
type ConstructorArgs = ConstructorParameters<typeof MyClass>;
```

### Intrinsic String Manipulation Types

```ts
type UppercaseEvent = Uppercase<'click'>; // 'CLICK'
type LowercaseEvent = Lowercase<'CLICK'>; // 'click'
type Capitalized = Capitalize<'user_id'>; // 'User_id'
type Uncapitalized = Uncapitalize<'UserId'>; // 'userId'
```

---

## 9. Generics, Constraints & `const` Type Parameters

Generics allow writing flexible, reusable code that preserves type relationships:

```ts
function identity<T>(value: T): T {
  return value;
}
```

### Generic Constraints

Restrict the types a generic can accept by using the `extends` keyword:

```ts
function printName<T extends { name: string }>(obj: T) {
  console.log(obj.name); // Safe because T is guaranteed to have 'name'
}
```

### `const` Type Parameters (TypeScript 5.0+)

By default, TS infers generalized types for generic function arguments (e.g. `string[]` instead of literal tuples). Adding `const` directly to the type parameter infers the narrowest literal type automatically without requiring `as const` at every call site:

```ts
// Without const: T is inferred as string[]
function setRoutesBad<T extends readonly string[]>(routes: T): T {
  return routes;
}
const r1 = setRoutesBad(['/home', '/about']); // Type: string[]

// With `const T`: T is inferred as readonly ['/home', '/about']
function setRoutes<const T extends readonly string[]>(routes: T): T {
  return routes;
}
const r2 = setRoutes(['/home', '/about']); // Type: readonly ["/home", "/about"]
```

---

## 10. Mapped & Conditional Types

### Mapped Types

Creates new types by iterating over keys of an existing type. This is how utilities like `Partial`, `Readonly`, `Required`, `Record`, `Pick`, and `Omit` are built under the hood.

```ts
// Custom Readonly implementation
type CustomReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

// Custom Partial implementation
type CustomPartial<T> = {
  [K in keyof T]?: T[K];
};
```

### Key Remapping with `as`

You can filter or transform keys in a mapped type using the `as` clause (often combined with template literals):

```ts
// Create getter method types for an interface
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Person {
  name: string;
  age: number;
}

type PersonGetters = Getters<Person>;
// Inferred: { getName: () => string; getAge: () => number; }
```

### Template Literal Types

Build string types by interpolating union types or primitives directly inside backticks:

```ts
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type APIEndpoint = `/api/v1/${string}`;
type RouteAction = `${HTTPMethod} ${APIEndpoint}`; // e.g. "GET /api/v1/users"

// CSS units type safety
type CSSDimension = `${number}px` | `${number}rem` | `${number}%` | 'auto';
const width: CSSDimension = '100px'; // ✅
// const badWidth: CSSDimension = '100'; // ❌ Type error

// Extracting route parameters:
type ExtractRouteParams<T extends string> = T extends `${string}:${infer Param}/${infer Rest}`
  ? Param | ExtractRouteParams<`/${Rest}`>
  : T extends `${string}:${infer Param}`
    ? Param
    : never;

type Params = ExtractRouteParams<'/users/:userId/posts/:postId'>; // 'userId' | 'postId'
```

### Conditional Types

Selects a type based on a condition matching compile-time properties.

```ts
type IsString<T> = T extends string ? true : false;

type Result1 = IsString<string>; // true
type Result2 = IsString<number>; // false
```

### Type Inference with `infer`

Extracts nested types from generic signatures inside conditional checks.

```ts
type PromiseValue<T> = T extends Promise<infer U> ? U : T;
type ElementType<T> = T extends (infer E)[] ? E : T;
```

---

## 11. Type Inference & Advanced Operators

### `keyof`

Gets keys of an object structure as a union.

```ts
type UserKeys = keyof User; // 'id' | 'name'
```

### `typeof`

Derives a type from a runtime value context.

```ts
const themeConfig = { dark: true, color: 'blue' };
type Theme = typeof themeConfig; // { dark: boolean; color: string }
```

### Contextual Typing

TypeScript can infer types without explicit annotations based on where the code is executed.

```ts
button.onclick = (e) => {
  e.preventDefault(); // TypeScript infers 'e' is a MouseEvent from onclick's signature
};
```

### Indexed Access

Allows looking up the type of a specific property on another type using brackets.

```ts
type UserAge = User['age']; // number | undefined
```

### `as const` (Locks Values & Tuples)

Narrows literal types to their exact values, turns arrays into readonly tuples, and marks all object properties `readonly`.

```ts
const config = {
  endpoint: 'https://api.example.com',
  retries: 3,
  roles: ['admin', 'editor'],
} as const;

// Inferred Type:
// {
//   readonly endpoint: "https://api.example.com";
//   readonly retries: 3;
//   readonly roles: readonly ["admin", "editor"];
// }
```

### `satisfies` (Validation Without Widening)

Ensures an expression matches a contract/type **without losing its inferred specific shape**.

> **"as"** tells the compiler _"trust me."_
> **satisfies** says _"check me, but keep what I wrote."_

```ts
type RGB = [number, number, number];
type Color = string | RGB;

// 1. Keeps Exact Property Types
const theme = {
  primary: '#ff0000',
  accent: [0, 255, 128],
} satisfies Record<string, Color>;

theme.primary.toUpperCase(); // ✅ string methods autocomplete & work!
theme.accent.map((n) => n * 2); // ✅ tuple/array methods autocomplete & work!

// 2. Catches Typos While Preserving Exact Known Keys
type RouteConfig = { path: string; protected?: boolean };

const routes = {
  home: { path: '/' },
  dashboard: { path: '/dashboard', protected: true },
  // setings: { path: '/settings' }, // ❌ TS catches typo if matching Record<RouteKeys, RouteConfig>
} satisfies Record<string, RouteConfig>;

// Exact keys are preserved (not widened to string):
routes.home.path; // ✅ Autocomplete knows 'home' and 'dashboard' exist
// routes.unknownRoute; // ❌ Error: Property 'unknownRoute' does not exist
```

### `as const satisfies` (The Ultimate Config Pattern)

Combines strict schema validation with deep immutability and exact literal inference:

```ts
interface NavigationItem {
  title: string;
  url: string;
  badge?: number;
}

const NAV_MENU = {
  dashboard: { title: 'Dashboard', url: '/dash' },
  inbox: { title: 'Inbox', url: '/inbox', badge: 5 },
} as const satisfies Record<string, NavigationItem>;

// Result:
// 1. Validated against Record<string, NavigationItem>
// 2. All keys ('dashboard', 'inbox') preserved
// 3. All properties are readonly literals: NAV_MENU.inbox.badge is `readonly 5`
```

### Branded / Nominal Types

TypeScript uses structural typing. When you want nominal/distinct types for domain safety (e.g. preventing mixing `UserId` and `OrderId`, or validating `SanitizedHtml`), use the **Branded Types** pattern:

```ts
// Declare a Brand helper
type Brand<K, T> = K & { readonly __brand: T };

type UserId = Brand<string, 'UserId'>;
type OrderId = Brand<string, 'OrderId'>;

function createUserId(id: string): UserId {
  return id as UserId;
}

function fetchUserOrders(userId: UserId) {
  // ...
}

const userId = createUserId('usr_123');
const orderId = 'ord_999' as OrderId;

fetchUserOrders(userId); // ✅ OK
// fetchUserOrders(orderId); // ❌ Error: Type '"OrderId"' is not assignable to type '"UserId"'
```

---

## 12. Function Types & Overloads

### Call Signature

```ts
type Handler = (event: MouseEvent) => void;
```

### Function Overloads

Useful when the return type dynamically changes based on the arguments supplied.

```ts
function parse(value: string): string;
function parse(value: number): number;
function parse(value: string | number) {
  return value;
}
```

---

## 13. React + TypeScript Integration

### Props typing

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  label: string;
}

export function Button({ variant = 'primary', label, ...rest }: ButtonProps) {
  return <button {...rest}>{label}</button>;
}
```

### Children typing

```tsx
interface ContainerProps {
  children: React.ReactNode;
}
```

### Event typing

```tsx
const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setValue(event.target.value);
};
```

### Ref typing

```tsx
const inputRef = useRef<HTMLInputElement>(null);
```

---

## 14. Type Variance (Covariance, Contravariance, Bivariance & Invariance)

Variance describes how subtyping of complex types (e.g. lists, functions) relates to subtyping of their component types.

- **Covariance (`A` behaves like `B` if `A extends B`)**: Read-only properties and function return types are covariant.
  ```ts
  type Getter<T> = () => T;
  let getDog: Getter<Dog> = () => ({ breed: 'Labrador' });
  let getAnimal: Getter<Animal> = getDog; // Safe (Covariant)
  ```
- **Contravariance (`B` behaves like `A` if `A extends B`)**: Function parameters are contravariant. Parameters must accept _more general_ values.
  ```ts
  type Handler<T> = (val: T) => void;
  let handleAnimal: Handler<Animal> = (a: Animal) => console.log(a.name);
  let handleDog: Handler<Dog> = handleAnimal; // Safe (Contravariant)
  ```
- **Bivariance**: Function parameters can behave both covariantly and contravariant. In TypeScript, method parameters are bivariant by default (unless `strictFunctionTypes` is enabled) to support standard array/object prototype assignments.
- **Invariance**: Mutable properties/arrays are invariant. They can neither be safely read from nor written to with broader or narrower types.
  ```ts
  let dogs: Dog[] = [];
  let animals: Animal[] = dogs; // Error in strict mode! (Preventing pushing Cat into dogs array)
  ```

---

## 15. Declaration Files & Module Augmentation

### Declaration Files (`.d.ts`)

#### What are they?

Declaration files are files containing **only type definitions** with zero executable JavaScript output. They end in the `.d.ts` extension.

#### Why do we use them?

1.  **Type Erasure compatibility:** Since TypeScript types disappear at runtime, `.d.ts` files allow shipping package type descriptors independently from the compiled `.js` files.
2.  **Describe JS Codebases:** They allow you to add type support to legacy JavaScript libraries without rewriting the code in TypeScript.
3.  **Non-TS Asset Declarations:** They instruct the compiler how to handle imports of non-JS files (e.g. importing `.css` modules or images).
    ```ts
    // custom-assets.d.ts
    declare module '*.png' {
      const content: string;
      export default content;
    }
    ```

### Module Augmentation

Extends types from external modules (libraries) that are loaded via imports.

```ts
// global.d.ts or types/index.d.ts
import 'react-router-dom';

declare module 'react-router-dom' {
  export interface FutureConfig {
    v7_startTransition?: boolean; // Augmenting existing library configurations
  }
}
```

### Global Augmentation

Add utilities directly to the global/window namespaces.

```ts
declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: any;
  }
}
export {}; // Ensure file is treated as a module
```

---

## 16. Compiler Options Worth Knowing (`tsconfig.json`)

Always enable strict modes in production configurations:

- **`strict`**: Enforces all strict type-checking flags automatically (`noImplicitAny`, `strictNullChecks`, etc.). Enabling this is the baseline for any type-safe project.
- **`noImplicitAny`**: Raises an error if a variable's type falls back to `any` implicitly because the compiler cannot infer it. Prevents accidental escape hatches.
- **`strictNullChecks`**: Makes `null` and `undefined` distinct types that must be explicitly checked. Without this, `null` can be assigned to `string` or `number` variables, leading to runtime crashes.
- **`exactOptionalPropertyTypes`**: Ensures that optional properties (`age?: number`) cannot be explicitly assigned `undefined` (e.g., `user.age = undefined` is blocked) unless the type is explicitly unioned with `undefined` (`age?: number | undefined`).
- **`noUncheckedIndexedAccess`**: Adds `| undefined` automatically to lookup elements retrieved from objects/arrays via indexes. Forces safety when accessing elements dynamically.
  ```ts
  const array: string[] = ['apple'];
  const item = array[5]; // Inferred as: string | undefined (instead of string)
  ```
- **`noImplicitOverride`**: Ensures class methods that override a base class method are explicitly marked using the `override` keyword, preventing accidental method overrides.
- **`isolatedModules`**: Enforces compiling each file as an independent module. Essential when using modern transpilers (Vite, esbuild, Babel) that compile files one by one and do not perform cross-file type checks during transpilation.
- **`skipLibCheck`**: Skips type checking of `.d.ts` declaration files (including `node_modules`). Massively speeds up build and hot-reload times while trusting library type definitions.

### Recommended `tsconfig.json` Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```
