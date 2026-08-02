# TypeScript API & Pattern Cheat Sheet

A comprehensive reference for TypeScript configuration, operators, utility types, compile-time systems, and integration with React.

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

## 3. Type vs. Interface Decision Matrix

- Use **`interface`** for:
  - Object structures & open/extensible library models.
  - _Declaration merging allows extending global types:_ Merging keys onto interfaces (e.g. `Window`).
- Use **`type`** for:
  - Best for declaring unions, intersections, primitives, tuples, mapped, or conditional types.
  - Union types, primitive aliases, tuple maps, complex logic.
- For standard component props, both work. Pick one and be consistent.

### Project Conventions

- **Objects/models**: `interface`
- **Everything else**: `type`
- Many modern TypeScript codebases use `type` almost everywhere because it's more expressive, while others prefer `interface` for object models. Both are valid; consistency within a project is more important than the choice itself.

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

## 5. Type Assertions vs. Type Guards

### Assertion (`as`)

Tells the compiler to override its checks and trust your manual assertion. It performs **zero runtime validation** and can easily hide runtime bugs.

```ts
const user = rawData as User; // Compiles fine, but could crash at runtime if shape is wrong
```

_Staff rule: Validate at trust boundaries (APIs, LocalStorage). Assertions should never be used to silence genuine compiler type uncertainty._

### Type Guard (`is`)

Uses runtime validation code that the compiler trusts to narrow down types within a block.

```ts
if (isUser(data)) {
  console.log(data.name); // Safe, type is narrowed to User
}
```

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

## 7. `any` vs `unknown` vs `never` vs `void`

### `any`

Completely disables type checking for that variable, propagating unsafe types to the rest of the application.

```ts
let value: any;
value.foo.bar(); // compiles, but crashes at runtime
```

**Rule:** Only use `any` at boundary escape hatches, and cast/narrow it to a safe type as quickly as possible.

### `unknown`

The type-safe top-type. Any value can be assigned to `unknown`, but you **must validate/narrow** it before using it.

```ts
function parse(value: unknown) {
  if (typeof value === 'string') {
    return value.toUpperCase(); // Safe, narrowed to string
  }
}
```

_Always prefer `unknown` over `any` for API responses or untrusted inputs._

### `never`

Represents values that cannot exist or code paths that never complete (like functions that throw errors or run infinite loops).

```ts
function fail(msg: string): never {
  throw new Error(msg);
}
```

_Excellent for compile-time exhaustive checks:_

```ts
function assertNever(value: never): never {
  throw new Error(`Unexpected matched value: ${value}`);
}
```

### `void`

Represents a function that does not return a useful value (returns `undefined` or has no return statement).

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

### Function Signature Extraction

```ts
type FnArgs = Parameters<typeof myFunc>;
type FnResult = ReturnType<typeof myFunc>;
type AsyncResult = Awaited<ReturnType<typeof asyncFunc>>;
```

---

## 9. Generics & Constraints

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
```

---

## 11. Type Inference & Operators

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

### `as const` (Locks Values)

Narrows literal types to their exact values and adds `readonly` recursively to objects/arrays.

```ts
const obj = {
  role: 'admin',
} as const;

// Inferred Type:
// {
//   readonly role: "admin";
// }
```

### `satisfies`

Checks that a value conforms to a shape without losing its exact narrow type.

```ts
const routes = {
  home: '/',
  users: '/users',
} satisfies Record<string, string>;
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
