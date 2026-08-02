# Clean Code & Architectural Design Patterns

A master reference guide for writing clean, scalable, maintainable, and testable code in modern full-stack and frontend environments.

---

## 1. The Core Clean Code Rules

### 1. Separation of Concerns (SOC)

- ☑ Break down a complex program into smaller, cohesive units.
- ☑ Each unit should focus on a specific task or behavior.

### 2. Document Your Code (DYC)

- ☑ Write code for your future self and other developers.
- ☑ Explain complex code sections with comments and documentation.

### 3. Don't Repeat Yourself (DRY)

- ☑ Don't waste time writing the same logic again.
- ☑ Instead, use functions, modules, and existing well-tested libraries.

### 4. Keep It Simple, Stupid (KISS)

- ☑ Simple is hard, but always better.
- ☑ Readable, straightforward code is superior to clever, obscure code.

### 5. Test Driven Development (TDD)

- ☑ Write a failing test first.
- ☑ Write code to make the test pass.
- ☑ Then clean up and refactor the code without changing its runtime behavior.

### 6. You Ain't Gonna Need It (YAGNI)

- ☑ Build only essential features.
- ☑ Don't build speculative features you think you might need later.

> **Leave the codebase cleaner than you found it.**

---

## 2. The Debugging Mindset

For almost every performance or system problem, think in this order:

1.  **Reproduce** the issue reliably.
2.  **Measure** the baseline behaviors.
3.  **Isolate** the specific code or execution layer.
4.  **Identify** the exact bottleneck.
5.  **Fix** the core root cause.
6.  **Measure again** to verify the fix works.
7.  **Monitor** the metrics in production.

- **Avoid the Common Trap**: Never jump straight from _"it's slow"_ to _"let's add Redis"_ or _"let's use React.memo"_. Senior engineers are expected to measure first, optimize second.

---

## 3. Redundancy vs Abstraction

> **"A little redundancy is better than a complex abstraction."**

- Premature abstraction couples unrelated features. If two blocks of code look similar but evolve independently under different business rules, keep them duplicate to prevent coupling.

---

## 4. SOLID Principles in TypeScript

### 1. Single Responsibility Principle (SRP)

- _A class or module should have one, and only one, reason to change._
- **Refactor**: Delegate calculations to pure functions, state management to custom hooks, and layout rendering to presentational components.

### 2. Open/Closed Principle (OCP)

- _Software entities should be open for extension, but closed for modification._

```typescript
// ❌ Bad (Must modify this file for every new type)
function renderWidget(type: 'chart' | 'list') {
  if (type === 'chart') return <ChartWidget />;
  if (type === 'list') return <ListWidget />;
}

// ✅ Good (Open for extension via registering components)
const widgetRegistry: Record<string, React.ComponentType> = {
  chart: ChartWidget,
  list: ListWidget,
};

function renderWidget(type: string) {
  const Widget = widgetRegistry[type];
  return Widget ? <Widget /> : <FallbackWidget />;
}
```

### 3. Liskov Substitution Principle (LSP)

- _Subtypes must be substitutable for their base types without altering correctness._

### 4. Interface Segregation Principle (ISP)

- _Clients should not be forced to depend on interfaces they do not use._

```typescript
// ❌ Bad (Forcing components to depend on massive data objects)
interface User {
  id: string;
  name: string;
  email: string;
  billingAddress: string;
  permissions: string[];
}
function UserBadge({ user }: { user: User }) {
  return <span>{user.name}</span>;
}

// ✅ Good (Component depends only on the specific sub-interface shape)
interface Nameable {
  name: string;
}
function UserBadge({ user }: { user: Nameable }) {
  return <span>{user.name}</span>;
}
```

### 5. Dependency Inversion Principle (DIP)

- _High-level modules should not depend on low-level modules. Both should depend on abstractions._

---

## 5. Refactoring Code Smells

### 1. Long Function Parameters

```typescript
// ❌ Bad
function createUser(name: string, email: string, role: string, isActive: boolean, age?: number) {}

// ✅ Good
interface UserConfig {
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  age?: number;
}
function createUser({ name, email, role, isActive, age }: UserConfig) {}
```

### 2. Deep Nesting & Arrow Code

```typescript
// ❌ Bad
function processPayment(payment: Payment) {
  if (payment.isValid) {
    if (payment.amount > 0) {
      if (payment.status === 'pending') {
        executeTransaction(payment);
      }
    }
  }
}

// ✅ Good
function processPayment(payment: Payment) {
  if (!payment.isValid) return;
  if (payment.amount <= 0) return;
  if (payment.status !== 'pending') return;

  executeTransaction(payment);
}
```

---

## 6. Separation of Concerns in UI Architectures

```text
  ┌──────────────────────────────────────────────────────────┐
  │                    UI Render Layer                       │
  │     (Pure layout, React Components, tailwind styles)     │
  └──────────────────────────┬───────────────────────────────┘
                             ▼
  ┌──────────────────────────────────────────────────────────┐
  │                   Adapter Hooks Layer                    │
  │     (useState, context selectors, data subscriptions)    │
  └──────────────────────────┬───────────────────────────────┘
                             ▼
  ┌──────────────────────────────────────────────────────────┐
  │                    Core Logic Engine                     │
  │    (Plain TS classes, state events, network HTTP APIs)   │
  └──────────────────────────────────────────────────────────┘
```

1.  **Core Logic Engine (Platform-Independent)**: Pure JavaScript/TypeScript classes containing validation, state calculations, math engines, and network clients. Absolutely no React/Vue lifecycle dependencies.
2.  **Adapter Hooks Layer (Reactivity Link)**: Thin hooks that fetch instance properties and map events onto React `useState` hooks to trigger visual renders.
3.  **UI Render Layer (Pure Components)**: Focuses purely on accessibility (`aria`), layout margins, and CSS styles.

---

## 7. Clean Async Guidelines

### 1. Concurrent State Updates

```typescript
// ❌ Bug-prone: Value can be stale during fast repeated clicks
setCount(count + 1);

// ✅ Safe: Relies on the verified current state
setCount((prev) => prev + 1);
```

### 2. Guard Async Results against Component Unmounts

```typescript
useEffect(() => {
  const controller = new AbortController();

  async function fetchData() {
    try {
      const response = await fetch('/api/data', { signal: controller.signal });
      const data = await response.json();
      setData(data);
    } catch (err) {
      if (err.name !== 'AbortError') handleErrors(err);
    }
  }

  fetchData();
  return () => controller.abort(); // Cancel request on unmount
}, []);
```
