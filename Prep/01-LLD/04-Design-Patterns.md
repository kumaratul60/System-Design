# 🎨 Low-Level Design Patterns (High-ROI for Principal / Staff Engineers)

> **🎯 Target Audience:** Senior / Staff / Principal Engineers
> **Focus:** Creational, Structural, and Behavioral patterns that yield the highest return on investment in Frontend & Full-Stack System Architecture.
> **Existing Repo Tags:** 🔗 [See existing Design Patterns Guide](file:///Users/atulkumarawasthi/projects/SystemDesign/Questions/Detailed/Design_Patterns.md) | 🔗 [See LLD Core Showcase](file:///Users/atulkumarawasthi/projects/SystemDesign/LLD/LLD.md) | 🔗 [Design Patterns GitHub Repo](https://github.com/kumaratul60/design-patterns)

---

## 🎨 Design Patterns Overview

As you gain more experience with object-oriented design, you will notice that many design problems appear again and again. Design patterns provide proven approaches to solving these recurring problems.

There are 23 classic Gang of Four (GoF) patterns, but for low-level design interviews, you only need to focus on the ones used most often.

### 🌟 10 High-Frequency Patterns to Master:

1. 📖 [Strategy](https://algomaster.io/learn/lld/strategy) — Use it when the same task can be performed in different ways, such as processing payments through a card, UPI, or digital wallet.
2. 📖 [Observer](https://algomaster.io/learn/lld/observer) — Use it when a change in one object needs to notify several others, such as sending updates when an order status changes.
3. 📖 [State](https://algomaster.io/learn/lld/state) — Use it when an object’s behavior depends on its current state, such as an order moving from created to paid to delivered.
4. 📖 [Facade](https://algomaster.io/learn/lld/facade) — Use it to hide a complex subsystem behind a simpler interface.
5. 📖 [Factory Method](https://algomaster.io/learn/lld/factory-method) — Use it when the type of object you create depends on the input, such as creating different types of vehicles.
6. 📖 [Composite](https://algomaster.io/learn/lld/composite) — Use it to represent tree-like structures, such as files and folders.
7. 📖 [Decorator](https://algomaster.io/learn/lld/decorator) — Use it to add new behavior to an object without changing its original class.
8. 📖 [Command](https://algomaster.io/learn/lld/command) — Use it when actions need to be represented as objects, such as implementing undo and redo.
9. 📖 [Chain of Responsibility](https://algomaster.io/learn/lld/chain-of-responsibility) — Use it when a request needs to pass through multiple handlers, such as an approval workflow.
10. 📖 [Template Method](https://algomaster.io/learn/lld/template-method) — Use it when several workflows follow the same overall structure but differ in a few individual steps.

> **💡 Principal Rule:** The most important thing is not to force a design pattern into every solution. Use one only when it genuinely makes the design cleaner, more flexible, or easier to extend.

---

## 📐 Pattern Selection Decision Flowchart

```mermaid
flowchart TD
    Start[Design Need Identified] --> Choice{What type of problem?}

    Choice -->|Object Creation| Creational[Creational Patterns]
    Choice -->|Class/Object Composition| Structural[Structural Patterns]
    Choice -->|Communication/Responsibility| Behavioral[Behavioral Patterns]

    Creational --> C1{Need configurable creation?}
    C1 -->|Yes, abstract family| Factory[Factory / Abstract Factory]
    C1 -->|Single global instance| Singleton[Singleton (Use with Caution)]
    C1 -->|Complex step-by-step build| Builder[Builder Pattern]

    Structural --> S1{Need interface conversion or extension?}
    S1 -->|Incompatible Interfaces| Adapter[Adapter Pattern]
    S1 -->|Add behavior dynamically| Decorator[Decorator / HOC]
    S1 -->|Simplify complex subsystem| Facade[Facade Pattern]

    Behavioral --> B1{Need flexible behavior or event handling?}
    B1 -->|Swap algorithms dynamically| Strategy[Strategy Pattern ⭐]
    B1 -->|Publish/Subscribe to state| Observer[Observer / Event Emitter ⭐]
    B1 -->|Encapsulate action as object| Command[Command / Action Pattern]
    B1 -->|Sequential handler pipeline| CoR[Chain of Responsibility]
```

---

## 🏗️ 1. Creational Patterns

### 🏭 Factory Pattern (Factory Method & Abstract Factory)

- **Intent:** Define an interface for creating objects, allowing subclasses or factory functions to alter the type of objects that will be created without coupling client code to concrete classes.
- **Frontend Real-World Use Case:** Dynamic Component Renderer (e.g., CMS rendering different widget types: `HeaderWidget`, `CarouselWidget`, `FormWidget` based on JSON configuration), dynamic API Client generator (REST vs GraphQL transport).

#### TypeScript Example

```typescript
interface Widget {
  render(): string;
}

class HeaderWidget implements Widget {
  render() {
    return '<h1>Header Component</h1>';
  }
}

class CarouselWidget implements Widget {
  render() {
    return "<div class='carousel'>Carousel Component</div>";
  }
}

class UnknownWidget implements Widget {
  render() {
    return '<div>Fallback Widget</div>';
  }
}

// Factory
export class WidgetFactory {
  private static registry = new Map<string, new () => Widget>([
    ['header', HeaderWidget],
    ['carousel', CarouselWidget],
  ]);

  static register(type: string, widgetClass: new () => Widget) {
    this.registry.set(type, widgetClass);
  }

  static createWidget(type: string): Widget {
    const WidgetClass = this.registry.get(type);
    if (!WidgetClass) return new UnknownWidget();
    return new WidgetClass();
  }
}
```

- **Pitfalls:** Over-abstraction when simple `if/else` or object lookup suffices.
- **Principal-Level Signal:** Demonstrates OCP (Open/Closed Principle) by allowing new widget registration at runtime without modifying `createWidget`.

---

### 🔒 Singleton Pattern

- **Intent:** Ensure a class has only one instance and provide a global point of access to it.
- **Frontend Real-World Use Case:** Telemetry / Logger instance, Global Event Bus, WebSocket Connection Manager, Client-side Feature Flag Service.

#### TypeScript Example (Thread-Safe & Module-Scoped Pattern)

```typescript
export class TelemetryService {
  private static instance: TelemetryService | null = null;
  private queue: Array<Record<string, unknown>> = [];

  private constructor() {
    // Private constructor prevents direct instantiations via `new`
  }

  public static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  public track(event: string, payload: Record<string, unknown>): void {
    this.queue.push({ event, payload, timestamp: Date.now() });
    if (this.queue.length >= 10) this.flush();
  }

  private flush(): void {
    // Flush telemetry batch to server
    this.queue = [];
  }
}
```

> ⚠️ **Principal-Level Warning on Singleton:**
> Singletons introduce hidden global dependencies, make unit testing difficult (shared mutable state across tests), and break parallel execution. In modern JS/TS, module-scoped exports (`export const telemetry = new TelemetryService()`) or Dependency Injection (DI containers) are strongly preferred over classic class Singletons.

---

## 🛠️ 2. Structural Patterns

### 🔌 Adapter Pattern

- **Intent:** Convert the interface of a class into another interface that clients expect. Adapter lets classes work together that couldn't otherwise because of incompatible interfaces.
- **Frontend Real-World Use Case:** Normalizing legacy API responses or third-party SDK responses (e.g., Stripe vs Paypal payment object schemas) into a unified UI Data Contract.

#### TypeScript Example

```typescript
// Legacy / Third-Party External Payload
interface ExternalUserAPI {
  usr_first_name: string;
  usr_last_name: string;
  usr_dob_epoch: number;
}

// Unified Domain Model used by Frontend App
interface UserProfile {
  fullName: string;
  age: number;
}

export class UserApiAdapter {
  static adapt(externalUser: ExternalUserAPI): UserProfile {
    const age = Math.floor((Date.now() - externalUser.usr_dob_epoch) / (365.25 * 24 * 60 * 60 * 1000));
    return {
      fullName: `${externalUser.usr_first_name} ${externalUser.usr_last_name}`,
      age,
    };
  }
}
```

---

### 🎨 Decorator Pattern

- **Intent:** Attach additional responsibilities to an object dynamically. Decorators provide a flexible alternative to subclassing for extending functionality.
- **Frontend Real-World Use Case:** Higher-Order Components (HOCs) in React (`withAuth`, `withAnalytics`), API Fetcher with automatic retry & logging decorators.

#### TypeScript Example

```typescript
interface DataFetcher {
  fetchData(url: string): Promise<unknown>;
}

class BasicFetcher implements DataFetcher {
  async fetchData(url: string): Promise<unknown> {
    const res = await fetch(url);
    return res.json();
  }
}

// Decorator adding Logging & Metrics
class LoggingFetcherDecorator implements DataFetcher {
  constructor(private wrapped: DataFetcher) {}

  async fetchData(url: string): Promise<unknown> {
    const start = performance.now();
    try {
      const data = await this.wrapped.fetchData(url);
      console.log(`[HTTP SUCCESS] ${url} took ${(performance.now() - start).toFixed(2)}ms`);
      return data;
    } catch (err) {
      console.error(`[HTTP ERROR] ${url}`, err);
      throw err;
    }
  }
}
```

---

## ⚡ 3. Behavioral Patterns

### 🎯 Strategy Pattern ⭐ (Must-Know)

- **Intent:** Define a family of algorithms, encapsulate each one, and make them interchangeable. Strategy lets the algorithm vary independently from clients that use it.
- **Frontend Real-World Use Case:** Client-side Form Validation strategies (Email validation, Credit Card validation, Password strength), Sorting/Filtering algorithms, Rendering strategies.

#### TypeScript Example

```typescript
interface ValidationStrategy {
  validate(value: string): { isValid: boolean; error?: string };
}

export class EmailValidationStrategy implements ValidationStrategy {
  validate(value: string) {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    return { isValid, error: isValid ? undefined : 'Invalid email format' };
  }
}

export class MinLengthStrategy implements ValidationStrategy {
  constructor(private minLen: number) {}
  validate(value: string) {
    const isValid = value.length >= this.minLen;
    return { isValid, error: isValid ? undefined : `Minimum length is ${this.minLen}` };
  }
}

export class FormValidator {
  private strategies: Map<string, ValidationStrategy[]> = new Map();

  addRule(field: string, strategy: ValidationStrategy) {
    const existing = this.strategies.get(field) || [];
    this.strategies.set(field, [...existing, strategy]);
  }

  validateField(field: string, value: string) {
    const rules = this.strategies.get(field) || [];
    for (const rule of rules) {
      const result = rule.validate(value);
      if (!result.isValid) return result;
    }
    return { isValid: true };
  }
}
```

---

### 👁️ Observer Pattern ⭐ (Must-Know)

- **Intent:** Define a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically.
- **Frontend Real-World Use Case:** Event Emitter, Reactive State Managers (Zustand, RxJS, Redux subscribers), DOM Event listeners.

#### TypeScript Example (Custom Event Bus)

```typescript
type Listener<T> = (data: T) => void;

export class EventEmitter<Events extends Record<string, unknown>> {
  private listeners: { [K in keyof Events]?: Array<Listener<Events[K]>> } = {};

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event]!.push(listener);

    // Return cleanup unsubscribe function (prevents memory leaks!)
    return () => {
      this.listeners[event] = this.listeners[event]!.filter((l) => l !== listener);
    };
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach((fn) => fn(data));
    }
  }
}
```

---

## 📊 Summary Comparison Table of High-ROI Patterns

| Pattern       | Category   | Primary Use Case in FE/Fullstack                            | Tradeoff / Pitfall                                        |
| :------------ | :--------- | :---------------------------------------------------------- | :-------------------------------------------------------- |
| **Factory**   | Creational | Dynamic object/component creation from config               | Can add unnecessary classes if direct instantiation works |
| **Singleton** | Creational | Shared infrastructure service (Logger, Telemetry)           | Hard to test; global mutable state risks                  |
| **Adapter**   | Structural | Data transformation between 3rd party API & UI              | Adds conversion overhead                                  |
| **Decorator** | Structural | Wrapping components or fetchers with cross-cutting features | Deep wrapping stacks make stack traces harder to debug    |
| **Strategy**  | Behavioral | Swappable algorithms (Validation, Sorting, Payment)         | Increases total number of classes/files                   |
| **Observer**  | Behavioral | Event dispatching, state updates, real-time UI updates      | Unhandled unsubscriptions cause severe memory leaks       |
| **Command**   | Behavioral | Undo/Redo actions, queued task executions                   | Requires state snapshotting management                    |

---

## ❓ Collapsed Q&A Self-Testing Bank

<details>
<summary>❓ 1. Why is Strategy Pattern preferred over large switch/if-else blocks in UI forms?</summary>

**Answer:**
Switch/if-else blocks violate the **Open/Closed Principle (OCP)**. Every time a new validation or business rule is added, you must edit existing code, increasing regression risk. The Strategy Pattern encapsulates each rule into an isolated, unit-testable class/function, allowing new strategies to be added without modifying existing code.

</details>

<details>
<summary>❓ 2. How do you prevent memory leaks when implementing the Observer pattern in React/JavaScript?</summary>

**Answer:**
Memory leaks happen when subscribers retain references to handlers or components that have been unmounted, preventing Garbage Collection. Fixes include:

1. Always returning an **unsubscribe function** from `.subscribe()` / `.on()` and invoking it in `useEffect` cleanup.
2. Using `WeakMap` or `WeakSet` for listener storage where appropriate.
3. Utilizing `AbortController` signal handlers in modern DOM `addEventListener`.
</details>

<details>
<summary>❓ 3. How does the Adapter Pattern differ from the Facade Pattern?</summary>

**Answer:**

- **Adapter:** Focuses on _interface compatibility_. It converts an existing incompatible interface into an interface expected by the client without changing underlying logic.
- **Facade:** Focuses on _simplification_. It provides a higher-level unified interface over a complex collection of subsystems (e.g. wrapping 5 microservice calls into one clean method call).
</details>
