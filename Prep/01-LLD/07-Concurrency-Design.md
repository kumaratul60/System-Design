# ⚡ Concurrency Design & Synchronization Primitives

> **🎯 Target Audience:** Senior / Staff / Principal Engineers
> **Focus:** Multithreading, Async Event Loops, Lock Primitives, Lock-Free Concurrency, and Thread-Safe Machine Coding.
> **Existing Repo Tags:** 🔗 [See existing LLD Advanced Concurrency](file:///Users/atulkumarawasthi/projects/SystemDesign/LLD/LLD.md#advanced-concurrency--thread-safety)

---

## 🧠 1. Concurrency Mental Model (Browser & Node.js vs Multithreaded OS)

```mermaid
flowchart TD
    subgraph Multi-Threaded Model (Java / Go / C++)
        T1[Thread 1] -->|Locks / Mutex| SharedMem[(Shared Memory Heap)]
        T2[Thread 2] -->|Locks / Mutex| SharedMem
    end

    subgraph Event Loop Model (Browser / Node.js)
        JS[Single Main JS Thread] --> TaskQ[Task Queue / Microtask Queue]
        Workers[Web Workers / Worker Threads] -->|postMessage / Structured Clone| JS
        SharedArrayBuffer[SharedArrayBuffer + Atomics] <--> JS
        SharedArrayBuffer <--> Workers
    end
```

---

## 🔒 2. Synchronization Primitives

| Primitive                    | Mechanism                                           | Primary Use Case                                   |
| :--------------------------- | :-------------------------------------------------- | :------------------------------------------------- |
| **Mutex (Mutual Exclusion)** | Exclusive lock (only 1 thread can hold at any time) | Protecting shared mutable critical sections        |
| **Semaphore**                | Counting lock (permits $N$ threads concurrently)    | Rate limiting, connection pool resource management |
| **Read-Write Lock**          | Multiple readers OR single writer                   | Read-heavy shared state (e.g. routing tables)      |
| **CAS (Compare-And-Swap)**   | Atomic CPU instruction (`cmpxchg`)                  | Lock-free data structures (e.g., AtomicInteger)    |

---

## 🛠️ 3. Producer-Consumer Pattern (Async Queue in TypeScript)

```typescript
export class AsyncProducerConsumerQueue<T> {
  private queue: T[] = [];
  private capacity: number;
  private waitingConsumers: Array<(item: T) => void> = [];

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  async produce(item: T): Promise<void> {
    while (this.queue.length >= this.capacity) {
      // Backpressure: wait for next tick
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    if (this.waitingConsumers.length > 0) {
      const consumer = this.waitingConsumers.shift()!;
      consumer(item);
    } else {
      this.queue.push(item);
    }
  }

  async consume(): Promise<T> {
    if (this.queue.length > 0) {
      return this.queue.shift()!;
    }

    return new Promise<T>((resolve) => {
      this.waitingConsumers.push(resolve);
    });
  }
}
```

---

## 🧪 4. Lock-Free Atomic Operations using `SharedArrayBuffer` & `Atomics`

```typescript
// Shared memory between main thread and Web Workers
const buffer = new SharedArrayBuffer(4); // 4 bytes for 32-bit int
const intArray = new Int32Array(buffer);

// Thread-safe atomic increment without Mutex locks
export function safeIncrement(): number {
  return Atomics.add(intArray, 0, 1); // Returns old value atomically
}

export function compareAndSwap(expected: number, newValue: number): boolean {
  const oldVal = Atomics.compareExchange(intArray, 0, expected, newValue);
  return oldVal === expected;
}
```

---

## ❓ Collapsed Q&A Self-Testing Bank

<details>
<summary>❓ 1. What is a Race Condition and how do you detect it in JavaScript single-threaded code?</summary>

**Answer:**
Even though JS executes code on a single thread, race conditions occur across asynchronous yield points (`await`, `Promises`, `setTimeout`). If two async operations read shared state before either writes back, data corruption happens. Fixes include lock primitives (e.g. async-mutex), task queues, or optimistic concurrency tokens.

</details>

<details>
<summary>❓ 2. How does Lock-Free Compare-And-Swap (CAS) prevent deadlocks?</summary>

**Answer:**
Traditional locks block threads, creating potential cyclic dependency deadlocks (Thread A holds Lock 1 waiting for Lock 2; Thread B holds Lock 2 waiting for Lock 1). CAS is an atomic CPU hardware instruction that attempts an update directly; if another thread updated first, it simply retries without ever blocking or putting the thread to sleep, eliminating deadlocks completely.

</details>
