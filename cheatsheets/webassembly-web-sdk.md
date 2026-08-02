# WebAssembly (WASM) + Web SDK

> Goal: understand the concepts, architecture, trade-offs, APIs, and interview-level decisions needed for Senior/Staff Frontend engineering.

---

# 1. WebAssembly (WASM)

## 1.1 What is WebAssembly?

**WebAssembly (WASM)** is a compact binary instruction format that lets code written in languages such as **Rust, C, and C++** run efficiently inside browsers and other runtimes.

It is **not a replacement for JavaScript**. A common architecture is:

```text
React / UI / DOM
      ↓
JavaScript / TypeScript
      ↓
CPU-heavy operation
      ↓
WebAssembly
```

Use JavaScript for application/UI logic and WASM where computational performance matters.

---

## 1.2 Why does WASM exist?

JavaScript is excellent for web applications, but some workloads are computationally expensive:

- Image/video processing
- Compression/decompression
- Cryptography
- Games and physics engines
- CAD/design software
- PDF processing
- Audio processing
- Large data transformations
- Language runtimes/editors
- Existing C/C++/Rust libraries

WASM allows these workloads to run in a portable, sandboxed environment without rewriting everything in JavaScript.

---

## 1.3 Mental Model

```text
Rust / C / C++
      │
      │ compile
      ▼
   app.wasm
      │
      ▼
Browser WASM Runtime
      │
      ├── Linear Memory
      ├── Functions
      ├── Imports
      └── Exports
      │
      ▼
JavaScript / Application
```

---

## 1.4 WASM Module

A `.wasm` file represents a WebAssembly module.

A module can expose functions to JavaScript:

```text
WASM Module
├── exported functions
├── imported functions
├── memory
├── tables
└── globals
```

JavaScript can instantiate the module and call exported functions.

```js
const result = await WebAssembly.instantiateStreaming(fetch('/processor.wasm'));

const { process } = result.instance.exports;
process();
```

---

## 1.5 Important Browser APIs

### `WebAssembly.instantiate()`

Instantiate WASM from already downloaded bytes.

```js
const response = await fetch('/module.wasm');
const bytes = await response.arrayBuffer();

const result = await WebAssembly.instantiate(bytes);
```

### `WebAssembly.instantiateStreaming()`

Compile/instantiate while the response is streaming.

```js
const result = await WebAssembly.instantiateStreaming(fetch('/module.wasm'));
```

Prefer this when the server serves WASM with the correct MIME type.

---

# 2. WASM Memory

## 2.1 Linear Memory

WASM does not directly operate on normal JavaScript objects.

It exposes a continuous block of memory called **linear memory**.

```text
WebAssembly.Memory

0x0000
│
├── numbers
├── strings encoded as bytes
├── arrays
├── structs
├── buffers
│
▼
0xFFFF
```

JavaScript can access it through `ArrayBuffer` / typed arrays.

```js
const memory = instance.exports.memory;
const bytes = new Uint8Array(memory.buffer);
```

### 2.3 The Memory Grow Trap (Typed Array Invalidation)

WASM linear memory can grow dynamically via `memory.grow()` (allocating in pages of 64KB).

- **The Hazard**: When WASM memory grows, the underlying `ArrayBuffer` might need to be relocated to a new memory address space. This immediately **detaches and invalidates** any existing JavaScript TypedArray views (e.g. `Uint8Array`) referencing the old buffer.
- **The Fix**: Always re-read and re-instantiate your typed array views after any WASM operation that might cause memory allocations:

  ```javascript
  // ❌ Bug-prone: View becomes detached if WASM grows memory internally
  const bytes = new Uint8Array(instance.exports.memory.buffer);
  instance.exports.allocateMemoryBlock(); // Grows memory
  console.log(bytes[0]); // TypeError: Cannot perform operation on a detached ArrayBuffer

  // ✅ Safe: Re-resolve the buffer
  instance.exports.allocateMemoryBlock();
  const bytesSafe = new Uint8Array(instance.exports.memory.buffer);
  ```

---

## 2.2 JS ↔ WASM Boundary

A major performance concept:

```text
JavaScript
   │
   │ conversion / copying
   ▼
WASM Memory
   │
   │ computation
   ▼
WASM
```

Crossing the JS/WASM boundary repeatedly can be expensive.

### Bad

```text
JS → WASM → JS → WASM → JS → WASM
```

### Better

```text
JS
 ↓
WASM processes large batch
 ↓
JS
```

**Staff-level takeaway:** benchmark the entire operation, not only WASM execution time.

---

# 3. WASM Performance

## WASM may help when

- CPU-bound workload
- Tight computational loops
- Large binary transformations
- Existing optimized native library
- SIMD can be used
- Predictable low-level memory access matters

## JavaScript may be better when

- DOM manipulation dominates
- Workload is small
- Frequent JS ↔ WASM calls are required
- Data conversion costs exceed computation savings
- Network/startup cost matters more than computation

### Important

```text
WASM ≠ automatically faster than JavaScript
```

Always profile first.

---

# 4. WASM + Web Workers

WASM executes on the calling thread unless moved elsewhere.

Running expensive WASM on the main thread can still freeze the UI.

```text
Main Thread
│
├── React
├── DOM
├── User interactions
│
└── Web Worker
       │
       └── WASM
             │
             └── CPU-heavy processing
```

Typical architecture:

```js
const worker = new Worker('/worker.js');
worker.postMessage(data);
```

Worker:

```js
const wasm = await WebAssembly.instantiateStreaming(fetch('/processor.wasm'));

self.onmessage = ({ data }) => {
  const result = wasm.instance.exports.process(data);
  self.postMessage(result);
};
```

Use Workers for **responsiveness**; use WASM for appropriate **computation**.

---

# 5. Advanced WASM Topics

Learn after the fundamentals.

## SIMD

Single Instruction, Multiple Data allows one CPU instruction to process multiple values.

Useful for:

- Image processing
- Audio
- Video
- Mathematical operations

## 5.2 Threads & Cross-Origin Isolation (COOP/COEP)

WASM multithreading relies on sharing memory buffers (`SharedArrayBuffer`) across Web Workers.

- **Security Lock**: Due to CPU side-channel attacks (like Spectre), modern browsers block `SharedArrayBuffer` by default.
- **The Solution**: The server hosting the client application must send cross-origin isolation HTTP headers:
  ```http
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
  ```
- Without these headers, attempting to instantiate a multithreaded WASM module utilizing SharedArrayBuffer will crash.

## 5.3 WasmGC (WASM Garbage Collection)

Traditional WASM (Rust/C) requires manual memory management. Modern WASM supports **WasmGC**, allowing garbage-collected languages (like Dart/Flutter, Kotlin, Java) to compile to WASM and directly leverage the browser's native Garbage Collector. This reduces bundle sizes and eliminates JS GC wrapping overhead.

## WASI

**WebAssembly System Interface** extends WASM beyond browser-only execution.

Mental model:

```text
WebAssembly
├── Browser
├── Server
├── Edge runtimes
└── Other WASM runtimes
```

For frontend interviews, know what WASI is; deep expertise is usually unnecessary.

---

# 6. WASM Tooling

## Rust

Common ecosystem:

```text
Rust
 ↓
wasm-bindgen
 ↓
wasm-pack
 ↓
WASM + JS bindings
```

## C/C++

Common ecosystem:

```text
C / C++
   ↓
Emscripten
   ↓
WASM + JS glue
```

---

# 7. WASM Decision Framework

Before introducing WASM, ask:

```text
Is this operation CPU-bound?
        │
       No ──► Don't use WASM for performance
        │
       Yes
        ▼
Can optimized JS solve it?
        │
       Yes ──► Benchmark JS first
        │
       No / insufficient
        ▼
Would Worker improve responsiveness?
        │
       Yes ──► Consider Worker
        ▼
Is computation large enough to justify WASM boundary/startup cost?
        │
       Yes
        ▼
Consider WASM (+ Worker)
```

---

# 8. Web SDK

## 8.1 What is a Web SDK?

A **Web SDK** is a reusable client-side library exposing a stable API that other applications/websites integrate.

Examples of SDK categories:

- Payments
- Authentication
- Analytics
- Monitoring
- Video conferencing
- Chat/support
- Feature flags
- Identity verification
- Proctoring/interviewing

An SDK is more than an npm package. It is a **public platform contract** consumed by applications you may not control.

## 8.2 The Snippet Loader Pattern (Asynchronous Queueing)

To prevent blocking the host page's initial load, SDKs are often distributed via a tiny HTML loader snippet. This snippet sets up a mock command queue to capture API calls before the full SDK script is asynchronously downloaded:

```html
<script>
  (function (w, d, s, q, src) {
    w[q] = w[q] || []; // Define the command queue
    w[q].push = function () {
      // Intercept calls and record commands
      w[q].push.apply(w[q], arguments);
    };
    var el = d.createElement(s);
    el.async = true;
    el.src = src;
    var first = d.getElementsByTagName(s)[0];
    first.parentNode.insertBefore(el, first);
  })(window, document, 'script', '_companySdkQueue', 'https://cdn.example.com/sdk.js');

  // Usage: Executed immediately; commands are queued until sdk.js executes them
  _companySdkQueue.push('init', { apiKey: 'xyz' });
  _companySdkQueue.push('track', 'PageView');
</script>
```

---

# 9. Web SDK Mental Model

```text
Customer Application
React / Vue / Angular / Vanilla JS
              │
              ▼
         Public SDK API
              │
    ┌─────────┼──────────┐
    │         │          │
   Auth     Events     Config
    │         │          │
    └─────────┼──────────┘
              ▼
           SDK Core
              │
   ┌──────────┼───────────┐
   │          │           │
 HTTP      Storage    Telemetry
   │          │           │
 Retry      Cache      Logging
   │
   ▼
Backend APIs
```

---

# 10. Public SDK API Design

Good SDK APIs should be:

- Small
- Predictable
- Typed
- Stable
- Framework-independent where possible
- Backward-compatible
- Easy to initialize
- Easy to destroy/clean up

Example:

```ts
const sdk = createSDK({
  apiKey: '...',
  environment: 'production',
});

await sdk.initialize();

const session = await sdk.createSession();

sdk.on('session.completed', handler);

sdk.destroy();
```

Avoid leaking internal implementation details into the public API.

---

# 11. SDK Core vs Framework Wrappers

Prefer separating core business logic from React.

```text
@company/sdk-core
       │
       ├── API Client
       ├── Authentication
       ├── Events
       ├── Storage
       ├── Configuration
       └── Telemetry
              │
       ┌──────┴───────┐
       │              │
       ▼              ▼
@company/react     Vanilla JS
```

React wrapper:

```ts
const { session, start } = useCompanySDK();
```

Core SDK:

```ts
const sdk = createSDK(config);
await sdk.start();
```

This prevents the SDK from becoming tightly coupled to one framework.

---

# 12. SDK Initialization & Lifecycle

Design explicit lifecycle states.

```text
Created
   ↓
Initializing
   ↓
Ready
   ↓
Running
   ↓
Destroyed
```

Consider:

- What happens if `initialize()` runs twice?
- Can multiple SDK instances exist?
- What happens before initialization finishes?
- Can initialization fail?
- Can the SDK retry?
- How are listeners/timers/workers cleaned up?

Prefer predictable/idempotent behavior.

---

# 13. Singleton vs Multiple Instances

## Singleton

```ts
SDK.initialize(config);
SDK.start();
```

Simple but makes multiple configurations/tenants harder.

## Instance-based

```ts
const sdkA = createSDK(configA);
const sdkB = createSDK(configB);
```

Usually more flexible, testable, and isolated.

---

# 14. Event Architecture

SDKs commonly need events.

```ts
sdk.on('connected', handler);
sdk.on('error', handler);
sdk.on('completed', handler);
```

Mental model:

```text
Internal SDK
    │
    ▼
Event Bus
    │
 ┌──┼─────────┐
 ▼  ▼         ▼
UI Analytics Consumer
```

Important concerns:

- Typed events
- Unsubscribe API
- Listener cleanup
- Avoid memory leaks
- Avoid exposing internal events unnecessarily

```ts
const unsubscribe = sdk.on('completed', handler);
unsubscribe();
```

---

# 15. Networking Layer

Do not scatter raw `fetch()` calls throughout an SDK.

```text
Feature
  ↓
API Client
  ↓
Request middleware
  ↓
Auth
  ↓
Retry / Timeout
  ↓
fetch
```

API client should handle:

- Base URL
- Authentication
- Headers
- Serialization
- Timeouts
- Cancellation
- Retries
- Error normalization
- Telemetry

---

# 16. AbortController

SDK operations should often support cancellation.

```ts
const controller = new AbortController();

fetch(url, {
  signal: controller.signal,
});

controller.abort();
```

Useful for:

- Component unmount
- User cancellation
- Timeouts
- Replaced requests
- SDK destruction

---

# 17. Retry Strategy

Do not blindly retry every failure.

```text
Request failed
      │
      ├── 400 ──► usually don't retry
      ├── 401 ──► refresh/re-auth if supported
      ├── 429 ──► retry with backoff / Retry-After
      └── 5xx ──► potentially retry
```

Use **exponential backoff + jitter** for retryable failures.

```text
1s → 2s → 4s → 8s
```

Jitter prevents many clients from retrying simultaneously.

---

# 18. SDK Error Design

Avoid returning arbitrary internal errors.

Create a stable taxonomy:

```ts
class SDKError extends Error {
  code: string;
  retryable: boolean;
}
```

Example codes:

```text
INITIALIZATION_FAILED
AUTHENTICATION_FAILED
NETWORK_ERROR
TIMEOUT
INVALID_CONFIG
PERMISSION_DENIED
SESSION_EXPIRED
```

Consumers should be able to make decisions based on stable error codes.

---

# 19. Storage

Possible browser storage:

```text
Cookies
localStorage
sessionStorage
IndexedDB
Memory
```

Choose based on requirements.

| Storage        | Good For                              |
| -------------- | ------------------------------------- |
| Memory         | temporary sensitive/runtime state     |
| sessionStorage | tab/session state                     |
| localStorage   | small persistent non-sensitive values |
| IndexedDB      | larger structured/offline data        |
| Cookies        | server/browser session scenarios      |

Never store secrets just because storage is convenient.

## 19.2 Storage Partitioning & Third-Party Restrictions

Modern browser privacy protections (Safari ITP, Chrome Privacy Sandbox) restrict cross-site storage access.

- **ITP / Partitioning**: If your SDK is hosted inside an iframe on `client.com` but runs from `sdk.com`, the browser **partitions** the `localStorage` and `cookies` of `sdk.com`. The SDK will not be able to read its own storage from `other-site.com`, making cross-site tracking or shared auth sessions impossible.
- **The Fix**: Perform authentication redirects to the SDK's primary domain (`auth.sdk.com`) to establish first-party context, or rely on token exchange via server-to-server endpoints.

---

# 20. Offline SDK Architecture

```text
Application
    ↓
SDK
    ↓
Local Queue / IndexedDB
    ↓
Connectivity restored
    ↓
Sync Engine
    ↓
Backend
```

Important concepts:

- Queueing
- Retry
- Idempotency
- Conflict handling
- Checkpoints
- Deduplication
- Network detection

---

# 21. iframe Isolation

For untrusted/complex third-party embedding, an iframe can isolate the SDK UI.

```text
Customer Website
      │
      ├── SDK loader
      │
      └── iframe
             │
             └── Your Application
```

Benefits:

- CSS isolation
- DOM isolation
- Independent deployment
- Reduced host-page interference
- Security boundaries

Trade-offs:

- Communication complexity
- Sizing
- Accessibility
- Authentication/session handling
- Browser restrictions

---

# 22. `postMessage`

Host ↔ iframe communication commonly uses `window.postMessage()`.

```text
Host
 │
 │ postMessage
 ▼
iframe
 │
 │ postMessage
 ▼
Host
```

Sender:

```js
iframe.contentWindow.postMessage({ type: 'START_SESSION' }, 'https://sdk.example.com');
```

Receiver:

```js
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://customer.example.com') return;

  // validate event.data before using it
});
```

## Security rule

Never blindly trust:

```js
event.data;
```

Validate:

```text
origin
message type
payload schema
expected sender
```

Avoid `'*'` as target origin when a specific trusted origin is known.

---

# 23. Web SDK Security

Know these areas:

```text
SDK Security
├── XSS
├── CORS
├── CSP
├── iframe sandbox
├── postMessage validation
├── token handling
├── origin validation
├── dependency security
├── input validation
└── supply-chain security
```

Important principle:

> Anything shipped to the browser must be treated as visible to the user.

Never embed backend secrets in an SDK bundle.

---

# 24. Bundling & Distribution

A browser SDK may need several outputs.

```text
Source TypeScript
      ↓
Build
      ↓
├── ESM
├── CJS (when ecosystem requires it)
├── CDN/browser bundle
├── Type declarations
└── Source maps
```

Understand:

- ESM
- CJS
- UMD/IIFE legacy distribution
- `package.json` exports
- Tree shaking
- `sideEffects`
- Code splitting
- Peer dependencies
- Source maps
- Minification

Modern libraries should generally prioritize ESM.

---

# 25. Bundle Size

SDK bundle size matters because **your code becomes someone else's dependency**.

```text
Customer App
   │
   ├── Their code
   ├── Their dependencies
   └── Your SDK ← don't make this huge
```

Strategies:

- Tree-shakable exports
- Lazy-load optional features
- Avoid large dependencies
- Prefer platform/browser APIs
- Set bundle budgets
- Analyze bundle output in CI

---

# 26. Versioning

Once customers depend on an SDK, its API is a contract.

Use semantic versioning intentionally:

```text
MAJOR.MINOR.PATCH

2.4.1
│ │ │
│ │ └── bug fix
│ └──── backward-compatible feature
└────── breaking change
```

Staff-level concerns:

- Backward compatibility
- Deprecation periods
- Migration guides
- Feature detection
- Server ↔ old SDK compatibility
- Rollout strategy

---

# 27. Telemetry & Observability

An SDK runs on machines and websites you don't control.

You need visibility into failures.

```text
SDK
 │
 ├── logs
 ├── metrics
 ├── traces/request IDs
 ├── version
 ├── environment
 └── error reports
       ↓
Telemetry Backend
```

Be careful with privacy and sensitive data.

Useful telemetry:

- SDK version
- Initialization duration
- API latency
- Error code
- Browser/version
- Feature used
- Retry count

---

# 28. SDK Compatibility

Your SDK may execute in:

```text
Chrome
Firefox
Safari
Edge
Mobile browsers
React apps
Vue apps
Angular apps
Legacy websites
SSR applications
```

Consider:

- Browser support matrix
- Feature detection
- Polyfills
- SSR (`window` may not exist)
- CSP
- Third-party cookie restrictions
- Mobile browser behavior

Avoid executing browser-only code during module import if SSR consumers may import the package.

---

# 29. SDK Testing Strategy

```text
Unit Tests
    ↓
Integration Tests
    ↓
Browser Tests
    ↓
Framework Integration Tests
    ↓
Example/Sandbox Applications
```

Test against representative hosts:

```text
Vanilla HTML
React
Next.js
Vue
Angular
iframe integration
CDN script
```

Also test bad environments: blocked storage, slow network, CSP restrictions, retries, duplicate initialization, destruction/reinitialization.

---

# 30. Web SDK + Worker + WASM Architecture

These concepts become powerful together.

Example: browser-based image/document processor.

```text
Customer Application
       │
       ▼
     Web SDK
       │
       ▼
    Web Worker
       │
       ▼
      WASM
       │
       ▼
Image / Document Processing
```

Why?

```text
SDK       → stable public API
Worker    → keeps main thread responsive
WASM      → efficient CPU-heavy processing
```

This is an excellent Staff Frontend architecture pattern.

---

# 31. Third-Party SDK System Design

## System Design Interview Prompt

> _"Design a browser SDK that any customer can embed into their website."_

### 📋 Requirements Breakdown

```text
Functional (FRs)
├── Initialize SDK with credentials
├── Authenticate guest/user session
├── Render/mount embeddable UI features
├── Communicate payload results back to Host
├── Expose public event hooks (listeners)
└── Cleanly destroy/release resources

Non-Functional (NFRs)
├── Strict Security (prevent host script tampering, secure tokens)
├── Low Payload Footprint (minimal bundle weight)
├── Low Rendering Latency (no layout shifts, smooth load)
├── High Observability (track initialization and runtime failures)
├── Framework Agnostic (runs on React, Vue, Vanilla, etc.)
└── Cross-Browser and SSR Compatibility
```

### 🏗️ Storage & Communication Architecture

```text
Customer App (Host Page)
     │
     ▼
Public SDK API Wrapper
     │
     ├─────────────────────────────┐
     ▼                             ▼
SDK Core class (JS Logic)     Iframe UI (Isolated App)
     │                             │
     │     postMessage channels    │
     │◄───────────────────────────►│ (CSS / DOM Sandboxed)
     │
     ├── API Client / Fetch
     ├── Auth Tokens Store
     ├── Event Dispatcher
     ├── Session Storage Cache
     ├── Jittered Retry Engine
     └── Telemetry / Error boundary
             │
             ▼
      HTTPS Backend Gateway
```

- **Trade-off (Direct DOM vs Iframe)**:
  - _Direct DOM/Shadow DOM:_ Faster load times and fluid sizing, but host stylesheet leaks contaminate styling, and compromised hosts can hijack fields.
  - _Iframe:_ Full styling isolation and strict security boundaries, but introduces communication latencies (`postMessage`) and sizing complexity.

---

# 32. Staff-Level Questions & Detailed Answers

## WASM Questions

### 1. Why WASM instead of optimized JavaScript?

```text
JS:   Source (.js) ──► Parse (AST) ──► Bytecode ──► JIT Profile ──► Native Code (De-opt loops)
WASM: Binary (.wasm) ─────────────────► Native Code (Predictable compilation)
```

- **💡 Problem Solved**: Unpredictable JIT compilation loops, garbage collection freezes, and runtime type deoptimizations.
- **⚙️ When to Use & Use Cases**: Heavy mathematical processing (PDF parsing, crypto, compression) and running legacy native C++/Rust libraries inside browser runtimes.
- **⚠️ Pitfalls & Gotchas**: Heavy upfront binary downloads and initial module instantiation latency.

### 2. When can WASM make performance worse?

```text
❌ Slow WASM Loop: JS ──[Copy Bytes]──► WASM ──[Process (1ms)]──► JS (Call loop 1,000x = Slow)
✅ Fast WASM Loop: JS ──[Copy Block]──► WASM ──[Batch Process (1ms)]──► JS (1 Boundary call = Fast)
```

- **💡 Problem Solved**: Boundary cross transitions overhead and serialization copy overhead.
- **⚙️ When to Use & Use Cases**: Highly intensive loops where computational work exceeds the copy costs.
- **⚠️ Pitfalls & Gotchas**: Calling small, individual WASM functions in high-frequency JS loops. Always batch data transfers.

### 3. What is linear memory?

- **💡 Problem Solved**: Secure isolation. WASM cannot access DOM elements or JS heap objects directly, ensuring strict sandbox memory access bounds.
- **⚙️ When to Use & Use Cases**: Moving large blocks of raw bytes (like pixels or audio) between JS and WASM contexts.

```javascript
const memory = new WebAssembly.Memory({ initial: 1 }); // 64KB page
const view = new Uint8Array(memory.buffer);
const encoder = new TextEncoder();
view.set(encoder.encode('input-payload'), 0);
instance.exports.parse_string(0, 13); // Pass offset (0) and length (13)
```

- **⚠️ Pitfalls & Gotchas**: Memory grow detachment. Growing memory invalidates all existing JS typed arrays referencing the old buffer. Re-instantiate typed arrays post-growth.

### 4. What does JS ↔ WASM boundary overhead mean?

- **💡 Problem Solved**: Latencies when the browser engine (e.g. V8) context-switches execution states between the JS runtime and WASM environment.
- **⚙️ When to Use & Use Cases**: Minimize boundary transitions by marshaling flat, contiguous binary layouts (Protobufs / FlatBuffers) in single transaction steps.
- **⚠️ Pitfalls & Gotchas**: Accessing WASM memory properties repeatedly via getters.

### 5. Why combine Web Workers and WASM?

```text
Main Thread: [UI updates, click handlers, React renders (Smooth 60fps)]
                    │ (postMessage data)
                    ▼
Web Worker:  [WASM Instantiation ──► Sync heavy execution ──► return message]
```

- **💡 Problem Solved**: Main-thread freezing. WASM executes synchronously and blocks browser paints. Moving it offloads CPU work.
- **⚙️ When to Use & Use Cases**: Video filters, heavy database processing (WASM SQLite), or audio encoding background threads.
- **⚠️ Pitfalls & Gotchas**: Workers serialization copy cost. For massive data transfers, use Transferable Objects or SharedArrayBuffer.

### 6. Is WASM a JavaScript replacement?

- **💡 Problem Solved**: Accessing low-level CPU efficiency on the web without dropping the dynamic capabilities of the JS DOM ecosystem.
- **⚙️ When to Use & Use Cases**: Keep JS for API fetching, routing, DOM layouts, and events; use WASM strictly for computational math.
- **⚠️ Pitfalls & Gotchas**: Writing heavy DOM wrappers inside C++/Rust compiled engines.

### 7. How would you measure whether WASM is worth introducing?

- **💡 Problem Solved**: Avoids premature optimization.
- **⚙️ When to Use & Use Cases**: Map both JS and WASM performance curves across scaling data payloads.

```text
Latency (ms)
    │        / JS (Trivial load is fast, but spikes exponentially at scale)
    │       /
    │      /   <--- Crossover point (WASM becomes faster here)
    │     /
    │  ──/──────── WASM (Flatter slope due to predictable native speed)
    │   /
    └─────────────────────── Data Payload Size
```

- **⚠️ Pitfalls & Gotchas**: Evaluating performance only on high-end developer workstations. Always profile on average mobile devices under real-world connections.

### 8. What are SIMD, threads, SharedArrayBuffer, and WASI?
*   **Definitions**:
    *   **SIMD (Single Instruction Multiple Data)**: Execution vectors (128-bit) that perform a single mathematical operation across multiple data points concurrently (ideal for video filters).
    *   **Threads**: Parallel execution lines running inside workers, enabling true multi-core processing.
    *   **SharedArrayBuffer**: A shared byte array accessible directly across different threads without message copying serialization.
    *   **WASI (WebAssembly System Interface)**: A standardized API namespace exposing system utilities (file systems, network sockets) allowing WASM to run outside the browser (e.g. backend environments).
*   **💡 Problem Solved**: Hardware-level acceleration (vector instructions, multi-core processing) and host-agnostic system integrations.
*   **⚙️ When to Use & Use Cases**: Real-time image processing, cryptography, and server-side sandboxed runtimes.
*   **⚠️ Pitfalls & Gotchas**: Browser blocking of `SharedArrayBuffer` due to Spectre vulnerability. You must configure cross-origin isolation headers (COOP/COEP) on your web servers.

---

## Web SDK Questions

### 1. How would you design a framework-agnostic SDK?

- **💡 Problem Solved**: SDK code duplication, high maintenance overhead across frameworks.
- **⚙️ When to Use & Use Cases**: Creating libraries loaded by arbitrary customer pages.

```typescript
// Core Engine (Vanilla)
export class SDKCore {
  private listeners: Set<Function> = new Set();
  public subscribe(cb: Function) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
}

// React Adapter Wrapper
export function useSDKState(sdkInstance: SDKCore) {
  const [state, setState] = useState(() => sdkInstance.getState());
  useEffect(() => sdkInstance.subscribe(setState), [sdkInstance]);
  return state;
}
```

- **⚠️ Pitfalls & Gotchas**: Accessing DOM global properties (`window`, `document`) on module level imports, which crashes SSR (Next.js) servers.

### 2. Singleton vs multiple SDK instances?

- **💡 Problem Solved**: Config clashes. Singletons prevent page developers from loading multiple workspaces, workspaces keys, or sandbox tests concurrently.
- **⚙️ When to Use & Use Cases**: Instantiate classes (`new CompanySDK()`) to isolate storage, state, and listeners.
- **⚠️ Pitfalls & Gotchas**: Singletons leak configurations and mock states across test runner suites, making unit testing fragile.

### 3. How do you safely embed UI into arbitrary customer websites?

- **💡 Problem Solved**: Styling pollution and XSS script leaks. Global page styles contaminate DOM designs, and malicious host scripts can inject actions into widget fields.
- **⚙️ When to Use & Use Cases**: Embeddable widgets (checkout fields, support chats).
- **⚠️ Pitfalls & Gotchas**: Shadow DOM isolates styles but shares JS security scopes (XSS risk). Use **Iframes** for maximum security (e.g., payment inputs).

### 4. iframe vs direct DOM rendering?

- **💡 Problem Solved**: Resolves the trade-off between style/security isolation and layout responsiveness.
- **⚙️ When to Use & Use Cases**: Use iframes for security (payments, logins) and independent CDN deployments. Use DOM/Shadow DOM for highly responsive inline page integrations.
- **⚠️ Pitfalls & Gotchas**: Iframes do not resize automatically; you must use `ResizeObserver` and `postMessage` dimensions communication.

### 5. How do you secure `postMessage` communication?

- **💡 Problem Solved**: Interception of variables and malicious frame actions spoofing.
- **⚙️ When to Use & Use Cases**: All message channels between parent pages and embedded frames.

```javascript
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://trusted-provider.com') return; // Origin validation
  if (event.data.type !== 'PAYMENT_SUCCESS') return; // Schema validation
  handleSuccess(event.data.payload);
});
```

- **⚠️ Pitfalls & Gotchas**: Supplying target origin `"*"` in postMessage calls (allows credentials leaks on redirects).

### 6. How do you version an SDK without breaking customers?

- **💡 Problem Solved**: Client-backend endpoint compatibility drift.
- **⚙️ When to Use & Use Cases**: Deploying continuous SDK features and bugfixes.
- **⚠️ Pitfalls & Gotchas**: Caching updates. Serve major version paths (e.g., `v1/sdk.js` with short TTLs for rolling bug fixes, and pinned versions like `v1.2.3/sdk.js` for locked setups).

### 7. How do you reduce SDK bundle size?

- **💡 Problem Solved**: Bloated bundle files degrading customer LCP performance metrics.
- **⚙️ When to Use & Use Cases**: Target package size < 10KB (gzipped).
- **⚠️ Pitfalls & Gotchas**: Importing heavy packages like Axios. Write lightweight fetch helpers using native fetch.

### 8. How do you debug failures occurring on customer websites?

- **💡 Problem Solved**: Stack trace and crash visibility on systems you do not own.
- **⚙️ When to Use & Use Cases**: Target error reporting by isolating stack traces containing strictly your SDK script source name.
- **⚠️ Pitfalls & Gotchas**: Violating GDPR/HIPAA. Never log personally identifiable information (PII) or form inputs.

### 9. How do retries, timeout, cancellation, and idempotency work?

- **💡 Problem Solved**: Double-charge actions during dropouts and backend service cascades.
- **⚙️ When to Use & Use Cases**: Critical backend mutations and checkouts. Use Jittered backoff retries and attach unique idempotency keys (`X-Idempotency-Key`).
- **⚠️ Pitfalls & Gotchas**: Infinite retries. Set strict maximum retry counts (e.g., 3 attempts) and use `AbortController` to terminate lagging calls.

### 10. How do you support React + Vue + Vanilla without duplicating business logic?

- **💡 Problem Solved**: Tripled dev cycles and mismatched behaviors across framework wrappers.
- **⚙️ When to Use & Use Cases**: General UI library packages.
- **⚠️ Pitfalls & Gotchas**: Exposing React-specific state hooks directly inside the vanilla SDK core class.

### 11. How do you support SSR consumers?

- **💡 Problem Solved**: Next.js compile build failures.
- **⚙️ When to Use & Use Cases**: Libraries built for modern frameworks.

```typescript
export class SDK {
  public init() {
    if (typeof window === 'undefined') return; // Safe fallback for Node/Server compilation
    this.storage = window.localStorage;
  }
}
```

- **⚠️ Pitfalls & Gotchas**: Accessing DOM global parameters at file import scopes.

### 12. How do you roll out breaking backend changes while old SDK versions still exist?

- **💡 Problem Solved**: Client-backend endpoint compatibility drift.
- **⚙️ When to Use & Use Cases**: Releasing backend database schema changes.
- **⚠️ Pitfalls & Gotchas**: Removing outdated endpoints immediately. Keep legacy endpoints or write gateway-level mapping adapters translating old client requests to new APIs.
- **Implementation Flow**:
  - **Path/Header Versioning**: Host parallel API gateway paths or handle routing based on API version request headers (`Accept: application/vnd.company.v1+json`).
  - **Feature Flag Handshakes**: SDK instances fetch configuration mappings during load initialization. The server instructs the client which logic switches are active.
  - **Gateway Payload Mapping**: Write translation adaptors at the API gateway layer to map incoming outdated SDK body structures to updated backend endpoint schemas.

```text
Old SDK Client (v1) ──► GET /data (v1 schema) ──► [ Gateway Adapter Maps to v2 Schema ] ──► Backend Service (v2)
```

---

# 33. Recommended Learning Order

```text
1. Web SDK fundamentals
       ↓
2. Public API + lifecycle
       ↓
3. Networking + AbortController + retries
       ↓
4. Events + storage
       ↓
5. iframe + postMessage
       ↓
6. Security
       ↓
7. Packaging / ESM / tree shaking
       ↓
8. Versioning + observability
       ↓
9. Web Workers
       ↓
10. WASM fundamentals
       ↓
11. WASM memory + JS boundary
       ↓
12. WASM + Worker
       ↓
13. SIMD / Threads / WASI
```

Priority for Senior/Staff frontend:

| Topic                         | Priority Level | Why it Matters / Key Focus                                                     |
| :---------------------------- | :------------- | :----------------------------------------------------------------------------- |
| **Web SDK Architecture**      | Critical       | Core framework-agnostic modular logic and integration constraints.             |
| **Browser Internals**         | Critical       | Event loops, task queues, rendering pipeline, and memory behavior.             |
| **Public API Design**         | Critical       | Interface stability, developer experience, and semantic versioning contracts.  |
| **Web Workers**               | Critical       | Main-thread offloading to prevent frame drops and UI freezing.                 |
| **iframe + postMessage**      | Critical       | Sandbox containment, styling isolation, and secure origin boundaries.          |
| **Security (XSS, CORS, CSP)** | Critical       | Protecting customer applications from cross-origin breaches and token theft.   |
| **Packaging & Bundling**      | High           | Tree-shaking compatibility, ESM delivery, and optimization budgets.            |
| **Service Workers**           | High           | Offline capabilities, caching engines, and service lifecycle hooks.            |
| **WebAssembly Fundamentals**  | Medium         | Compile targets, linear memory, and binary streaming compilation.              |
| **WASM + Workers**            | Medium         | Parallel computing, worker messaging, and compute isolation.                   |
| **WASM SIMD & Threads**       | Low            | High-performance calculations (media/cryptography) targeting CPU optimization. |
| **Deep WASM Internals**       | Low            | Low-level rust-bindgen, emscripten compiler optimization flags.                |
| **WASI**                      | Low            | Non-browser system runtimes, server-side WASM sandboxes.                       |

---

# 34. One-Line Revision Cheat Sheet

```text
WASM          → efficient portable low-level computation
Linear Memory → WASM's contiguous memory buffer
Worker        → move work away from main/UI thread
SIMD          → process multiple values per CPU instruction
WASI          → system interface for WASM outside browser-only use cases

Web SDK       → stable public client-side platform API
SDK Core      → framework-independent business logic
React Wrapper → React-specific adapter/hooks/components
iframe        → UI/security/isolation boundary
postMessage   → cross-window/iframe communication
AbortController → cancellation
Backoff       → progressively delayed retries
Jitter        → randomize retry timing
Telemetry     → understand SDK behavior on customer environments
SemVer        → communicate compatibility through versions
Tree Shaking  → remove unused exports from consumer bundles
```

---

# 35. Final Mental Model

```text
                         CUSTOMER WEBSITE
                               │
                               ▼
                         ┌───────────┐
                         │  Web SDK  │
                         └─────┬─────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
          SDK Core          iframe          React Adapter
              │                │
       ┌──────┼──────┐    postMessage
       │      │      │
       ▼      ▼      ▼
      API   Events Storage
       │
       ├── Auth
       ├── Retry
       ├── Abort
       └── Telemetry

For CPU-heavy browser work:

Web SDK
   ↓
Web Worker
   ↓
WebAssembly
   ↓
CPU-heavy computation
```

The architectural principle to remember:

> **Use JavaScript/TypeScript for orchestration and UI, Workers for main-thread isolation, WASM for justified CPU-heavy computation, and a Web SDK to expose the capability through a stable consumer-facing contract.**
