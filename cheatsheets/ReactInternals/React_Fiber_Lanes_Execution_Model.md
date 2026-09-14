# React Fiber Internals: Lanes, Execution Lifecycles & Architecture Mental Model

A comprehensive reference and cheat sheet covering **React Fiber Lanes**, **Priority Scheduling**, **Lane Starvation & Bitmasks**, **End-to-End Request-to-Pixels Lifecycles**, **The 6-Layer Architecture**, **Performance Diagnostics**, and **Staff-Level React Internals**.

---

## 1. React Fiber Lanes & Priority Scheduling

### What is a Lane?
A **Lane** is a priority bucket used by React to track, schedule, and prioritize updates. Rather than treating updates as a simple FIFO queue, React assigns bitwise lane flags to differentiate urgent user actions from non-urgent background work.

```
Update
  ↓
Assigned a Lane
  ↓
React Scheduler
  ↓
Process higher-priority lanes first
```

### Lane Priority Hierarchy
```
High Priority
├── SyncLane              → Urgent synchronous updates (e.g., controlled input, flushSync)
├── InputContinuousLane   → High-frequency interactive updates (e.g., mousemove, typing)
├── DefaultLane           → Normal component updates (e.g., network responses, timers)
└── TransitionLanes       → Interruptible, low-priority transitions (e.g., startTransition, useDeferredValue)
                         ↓
Low Priority
```

---

## 2. Lane Starvation & Prevention

### What is Lane Starvation?
**Lane starvation** occurs when low-priority updates (e.g., `TransitionLanes`) are indefinitely postponed because high-priority work (e.g., `InputContinuousLane` from continuous typing) keeps arriving at a rate faster than the renderer can clear the queue.

#### Starvation Scenario Example:
```
Transition update triggered
  ↓
TransitionLane marked pending
  ↓
User continues rapid typing
  ↓
InputContinuousLane queued continuously
  ↓
More high-priority work arrives
  ↓
TransitionLane keeps getting postponed
```

```
High priority:  █ █ █ █ █ █ █ █ (Processed immediately)
Low priority:   ─ ─ ─ ─ ─ ─ ─ ─ (Starved / Postponed)
```

### Anti-Starvation Mechanism (Expiration Times)
React does **not** allow high-priority work to win forever. 
1. When work is scheduled on a Lane, React assigns an **expiration timestamp** to that lane.
2. If a low-priority lane remains uncollected past its expiration threshold, React marks it as an **Expired Lane** (`expiredLanes`).
3. Expired lanes bypass concurrency, get elevated to synchronous priority, and are processed forcibly in the next render pass to prevent starvation.

---

## 3. Lane Bitmasks & Entanglement ("Lane Panel")

### Bitmask Representation
Internally, React represents priority lanes as **32-bit bitmasks**. Each lane corresponds to a specific bit position, allowing ultrafast bitwise operations (`|`, `&`, `~`) to check, merge, and clear pending work across the entire Fiber tree.

```
00000001 (0x01) → SyncLane
00000100 (0x04) → DefaultLane
00100000 (0x20) → TransitionLane
```

### Combining Lanes via Bitwise OR
When multiple updates occur across different priorities, React combines them into single bitmask flags on the `FiberRoot`:

```c
pendingLanes = SyncLane | DefaultLane | TransitionLane;
// pendingLanes = 00000001 | 00000100 | 00100000 = 00100101
```

### Fiber Root Tracking Bitmasks
React tracks the state of all work on the `FiberRoot` node using 5 primary bitmask fields:

```
                 React Root (FiberRootNode)
                             │
        ┌────────────────────┼────────────────────┐
        ↓                    ↓                    ↓
    Sync Lane           Default Lane          Transition
     urgent                normal            interruptible
     update                update                work
```

- **`pendingLanes`**: Bitmask of all lanes that have scheduled work waiting to be processed.
- **`suspendedLanes`**: Bitmask of lanes blocked by async resources (e.g., Suspense data fetching).
- **`pingedLanes`**: Bitmask of suspended lanes whose async dependencies have resolved and are ready to retry.
- **`expiredLanes`**: Bitmask of lanes that exceeded their expiration timeout and must run synchronously.
- **`entangledLanes`**: Bitmask of lanes that must be rendered together (e.g., updates inside the same transition or context provider).

---

## 4. Key Mental Models & Conceptual Separations

### The State Update Pipeline
```
setState()
   ↓
Assign Priority
   ↓
Assign Lane
   ↓
Update Fiber pendingLanes
   ↓
Scheduler picks next highest lane
   ↓
Render Phase (beginWork / reconciliation)
   ↓
Commit Phase (DOM mutation / effects)
```

### What a Lane is NOT
- ❌ **Lane ≠ CPU Thread**: React operates single-threaded on the JS main thread (or Web Worker). Lanes are software abstractions for scheduling priority.
- ❌ **Lane ≠ Web Worker**: Lanes do not parallelize execution across multi-core CPUs.
- ❌ **Lane ≠ Component**: Lanes attach to state updates and Fiber roots, not isolated visual components.

### The 4 Structural Separations
Understanding React performance requires cleanly separating these four distinct abstractions:

```
React Element  ──►  Fiber Node  ──►  DOM Node  ──►  Pixels
 (Description)     (Work/State)     (Host Tree)    (Screen Paint)
```

1. **React Element**: Light, immutable JS object describing UI at a single point in time (`{ type: 'div', props: ... }`).
2. **Fiber**: Mutable, persistent node in React's work tree containing component state, hooks queue, DOM references, and lane masks.
3. **DOM**: Browser host tree node constructed and updated by React during the commit phase.
4. **Pixels**: Visual pixels rendered on screen by the browser layout engine after rasterization.

---

## 5. Full-Stack End-to-End Lifecycles (Request to Pixels)

### A. SSR / Streaming / React Server Components (RSC) Lifecycle

```
USER REQUEST
     │
     ▼
DNS Resolution
     │
     ▼
TCP Handshake / TLS Negotiation
     │
     ▼
HTTP Request sent to server
     │
     ▼
SERVER EXECUTION
     ├── Routing & Authentication
     ├── Data Fetching (DB / Microservices)
     ├── React Server Components (RSC / Flight payload generation)
     └── SSR HTML Stream Rendering
            │
            ▼
      React Elements
            │
            ▼
      Server HTML Render
            │
            ▼
       HTML Stream
            │
            ▼
          TTFB (Time to First Byte)
            │
            ▼
BROWSER PROCESSING
     ├── Parse HTML
     ├── Preload Scanner (Discover CSS, JS, Fonts)
     ├── Fetch & Apply CSS (CSSOM)
     ├── Fetch JS Bundles
     └── Construct DOM
            │
            ▼
       First Paint / FCP
            │
            ▼
      JavaScript Execution
            │
            ▼
      React Runtime Starts
            │
            ▼
      hydrateRoot()
            │
            ▼
      Build Fiber Tree & Attach Host Nodes
            │
            ▼
       HYDRATION PHASE
            │
     ┌──────┴──────┐
     ▼             ▼
 beginWork    completeWork
     │             │
     └──────┬──────┘
            ▼
       Commit Phase
            │
            ▼
    Bind Event Handlers
            │
            ▼
    Interactive UI (TTI / INP ready)
```

---

### B. Client-Side SPA Navigation Lifecycle

```
USER CLICK / INTERACTION
   │
   ▼
Client-Side Router Intercepts
   │
   ▼
history.pushState()
   │
   ▼
React State Update (e.g., setState / useTransition)
   │
   ▼
UpdateQueue updated on Target Fiber
   │
   ▼
Lane assigned (e.g., TransitionLane)
   │
   ▼
Scheduler schedules performConcurrentWorkOnRoot
   │
   ▼
RENDER PHASE (Interruptible)
   ├── beginWork (Traverse down, evaluate props/hooks)
   ├── reconciliation (Diff elements vs Fiber alternate)
   ├── bailout (Skip unchanged subtrees via memo/sCU)
   └── completeWork (Bubble flags, create/collect host instances)
   │
   ▼
finishedWork (Completed Work-In-Progress Fiber Tree)
   │
   ▼
COMMIT PHASE (Synchronous & Uninterruptible)
   ├── Mutation Phase (Apply DOM updates, detachment)
   ├── Layout Phase (Run useLayoutEffect, update refs)
   └── Passive Phase (Schedule/run useEffect cleanups & callbacks)
   │
   ▼
DOM UPDATED
   │
   ▼
BROWSER RENDERING ENGINE PIPELINE
   ├── Recalculate Style (CSSOM + DOM = Render Tree)
   ├── Layout / Reflow (Compute geometry & bounding boxes)
   ├── Paint (Record draw calls into layers)
   └── Composite (GPU composites layers into final frame)
   │
   ▼
PIXELS DISPLAYED ON SCREEN
```

---

### C. Suspense Execution Flow

```
Profile Component Begins Rendering
        │
        ▼
   Data / Resource Access (e.g., use() or Suspense resource)
        │
        ├── Data Ready? ──► Render Profile Component UI
        │
        ▼ (Data NOT Ready)
     SUSPEND (Throws Promise / Suspense exception)
        │
        ▼
React Catches Suspense Exception & Unwinds Fiber Tree
        │
        ▼
Mark Target Lane in suspendedLanes bitmask
        │
        ▼
Find Nearest Parent <Suspense> Boundary
        │
        ▼
Render Fallback Subtree (<Loading />)
        │
        ▼
Commit Fallback to DOM (Show Spinner)
        │
        ▼
Data Resolves / Promise Fulfills
        │
        ▼
Ping Scheduler → Mark Target Lane in pingedLanes bitmask
        │
        ▼
Retry Suspended Work (Re-render Profile Component)
        │
        ▼
Render Profile Component Successfully
        │
        ▼
Commit Profile UI to DOM (Replace Fallback)
```

---

## 8. JS Engine, Browser Runtime & React Interoperability

### A. JS Event Loop & React Time-Slicing Scheduler
React's concurrent scheduler runs on the browser's single-threaded JavaScript runtime (V8, JavaScriptCore, SpiderMonkey). To prevent long rendering tasks (>50ms) from blocking user input or frame rates (60fps / 120fps), React implements **Time-Slicing**:

```
JS Event Loop Main Thread
 ┌──────────────────────────────────────────────────────────────────┐
 │ Macrotask (React Render Chunk ~5ms)                              │
 └──────────────────────────────────────────────────────────────────┘
   │
   ▼
 Yield control to Browser (Process User Input / Recalculate Style / Paint Frame)
   │
   ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │ Next Macrotask (MessageChannel trigger → Resume React Render)   │
 └──────────────────────────────────────────────────────────────────┘
```

- **5ms Frame Slice**: React processes work units (`beginWork`) until a 5ms frame slice expires (`shouldYield() === true`).
- **Why `MessageChannel`?**: React uses `MessageChannel` (a macrotask) to schedule the next work chunk rather than `setTimeout(fn, 0)` (which suffers from a 4ms browser nesting clamp penalty) or `requestAnimationFrame` (which executes before paint, making it unfit for background scheduling).

---

### B. React Double Buffering Architecture
To prevent visual tearing and ensure zero partial DOM renders, React maintains **two Fiber trees in memory**:

```
           FiberRootNode
                 │
           current pointer
                 │
                 ▼
        Current Fiber Tree  ◄══════ alternate pointer ══════►  Work-In-Progress (WIP) Tree
     (Visible on Screen)                                        (Draft being rendered)
                 │                                                        │
                 ▼                                                        ▼
         Host DOM Nodes                                         Completed & Ready
                                                                          │
                                                                          ▼
                                                                  SWAP POINTER (Commit)
                                                                 root.current = WIP Tree
```

1. **`current` Tree**: Represents the state and components currently rendered on screen.
2. **`workInProgress` (WIP) Tree**: Draft tree constructed asynchronously during the Render phase.
3. **`alternate` Pointer**: Links each `current` Fiber node to its corresponding `WIP` Fiber node (`current.alternate === wip`).
4. **Instantaneous Pointer Swap**: At the end of the Commit phase, React updates `root.current = wip`, instantaneously replacing the screen state with zero visual flicker.

---

### C. Synthetic Event System & Event Delegation
React does **not** attach event listeners to individual DOM elements. Instead, it uses **Root Event Delegation**:

```
User Action (e.g., Click on <button>)
        │
        ▼
Browser Native Event Bubbles up to Container (#root)
        │
        ▼
React Root Synthetic Event Listener Intercepts
        │
        ▼
Map Native Event ──► SyntheticEvent Wrapper
        │
        ▼
Lookup Fiber Tree for Event Handlers (Capture & Bubble)
        │
        ▼
Map Event Priority ──► React Lane Allocation
        ├── Discrete Event (click, keydown) ──────► SyncLane (0x01)
        ├── Continuous Event (mousemove, scroll) ─► InputContinuousLane (0x04)
        └── Passive Event (custom events) ────────► DefaultLane (0x10)
```

- **Event Delegation**: Single listener attached to `#root` (React 17+), preventing memory overhead from thousands of direct DOM listeners.
- **Two-Phase Dispatch**: React traverses the Fiber tree upward from the target Fiber node, manually triggering `onClickCapture` handlers during propagation down and `onClick` handlers during bubbling up.

---

### D. Browser Layout Thrashing & Forced Synchronous Reflows
Understanding how React interacts with the Browser Layout Engine is critical to avoiding frame drops:

```
JavaScript DOM Mutation (Commit Mutation Phase)
        │
        ▼
JavaScript reads Layout geometry (e.g., element.offsetHeight in useLayoutEffect)
        │
        ▼
FORCED SYNCHRONOUS REFLOW (Layout Thrashing!)
(Browser is forced to calculate geometry inline on JS main thread)
```

- **Cause**: Reading layout properties (`offsetHeight`, `getBoundingClientRect`, `scrollTop`) immediately after modifying DOM styles before the browser can batch layout calculations naturally.
- **React Fix**: Perform all read operations *before* writing to DOM, or isolate measurement logic in `useLayoutEffect` carefully without recursive state mutation loops.

---

### E. Automatic Batching Mechanics (React 18+)
React 18 automatically batches multiple state updates into a single re-render pass, regardless of execution context:

```javascript
// Pre-React 18: 2 separate re-renders inside promises/timers
// React 18+: Automatically batched into 1 single Lane update & render pass
fetchData().then(() => {
  setCount(c => c + 1); // Queued in Lane
  setFlag(true);        // Queued in same Lane
  // React flushes both in 1 single render pass at end of microtask
});
```

- **How it Works**: State setters queue updates on the Fiber's `updateQueue` and mark the lane bitmask. React schedules a microtask to evaluate and merge all updates for that lane into a single render execution.
- **Bypassing Batching**: Calling `flushSync(() => setState())` immediately interrupts batching, flushing DOM mutations synchronously.

---

### F. Fiber Memory Architecture & V8 Optimization
A single `FiberNode` is a plain C++ / V8 JavaScript object structured as follows:

```typescript
type FiberNode = {
  // Structure & Tree Pointers
  tag: WorkTag,            // Type of component (Function, Class, HostRoot, HostComponent)
  key: null | string,      // Unique key for reconciliation
  type: any,               // Component function / DOM tag name ('div')
  stateNode: any,          // Reference to real DOM node or Class instance
  return: Fiber | null,    // Parent Fiber
  child: Fiber | null,     // First Child Fiber
  sibling: Fiber | null,   // Next Sibling Fiber
  index: number,           // Child index in list

  // State & Work Queues
  memoizedState: any,      // Linked list of hooks state (for Function Components)
  updateQueue: any,        // Queue of pending state updates & side effects
  memoizedProps: any,      // Props used during previous render pass
  pendingProps: any,       // Incoming new props

  // Priority & Concurrency
  lanes: Lanes,            // Pending work priority bitmask on this Fiber
  childLanes: Lanes,       // Pending work priority bitmask across sub-tree
  alternate: Fiber | null, // Pointer to current/WIP paired Fiber node
};
```

- **Hook Storage**: Hooks (`useState`, `useEffect`) form a singly-linked list attached directly to `fiber.memoizedState`.
- **V8 Hidden Classes**: Fiber objects are instantiated with consistent shape definitions to ensure V8 maintains Fast Properties and Inline Caches (IC) for sub-millisecond attribute accesses.

---

## 9. The 6-Layer Architecture & Performance Diagnostics

### The 6 Architectural Layers
```
┌──────────────────────────────────────────────────────────┐
│ 1. NETWORK                                               │
│ DNS → TCP/TLS → HTTP → TTFB                              │
├──────────────────────────────────────────────────────────┤
│ 2. SERVER                                                │
│ RSC → Data Fetching → React Server Render → HTML Stream  │
├──────────────────────────────────────────────────────────┤
│ 3. BROWSER HOST                                          │
│ HTML Parsing → DOM Construction → CSSOM → Resource Fetch │
├──────────────────────────────────────────────────────────┤
│ 4. REACT CORE RENDERER                                   │
│ Element → Fiber → Lanes → Scheduler → beginWork          │
│ → Reconciliation → Bailout → completeWork → Commit       │
├──────────────────────────────────────────────────────────┤
│ 5. ASYNC REACT & CONCURRENCY                             │
│ Suspense → Transitions → Interruption → Retry → Hydration│
├──────────────────────────────────────────────────────────┤
│ 6. BROWSER RENDERING ENGINE                              │
│ Recalc Style → Layout → Paint → Composite → Pixels       │
└──────────────────────────────────────────────────────────┘
```

### Core Web Vitals Mapping to Architecture
| Metric | Full Name | Primary Layer Responsible | Root Cause & Bottleneck Area |
| :--- | :--- | :--- | :--- |
| **TTFB** | Time to First Byte | **1. Network & 2. Server** | Slow server DB queries, un-streamed SSR, network latency |
| **FCP** | First Contentful Paint | **3. Browser Host** | Large CSS bundles, render-blocking scripts, unoptimized HTML |
| **LCP** | Largest Contentful Paint | **2. Server & 3. Browser** | Slow image loads, late resource discovery, heavy hero SSR rendering |
| **INP** | Interaction to Next Paint | **4. React Core & 6. Browser** | Long JS render tasks, heavy reconciliation, synchronous commit blocking main thread |
| **CLS** | Cumulative Layout Shift | **6. Browser Rendering** | Dynamic content insertions without layout sizing, late-loading web fonts |

### React Performance Diagnostics Map
```
Slow Render Phase            ──► Heavy beginWork / reconciliation loops
Too Much Scheduled Work       ──► Missing Lane priorities / un-transitioned state updates
Unnecessary Child Renders     ──► Failed bailouts / missing memoization (useMemo, React.memo)
Expensive Commit Phase        ──► Excessive synchronous DOM mutations / heavy useLayoutEffect
Slow Browser Rendering Pipeline──► Complex CSS layout, thrashing forced reflows during commit
Slow Initial Response         ──► Server-side blocking data fetching before TTFB
Slow Hydration                ──► Mismatch between Server HTML stream & Client Fiber tree
```

---

## 10. Fiber Unwind Phase & Advanced Internals

### The Unwind Phase (Error Boundaries & Suspense)
When rendering throws an Error or a Suspense Promise, React aborts standard downward tree traversal and enters the **Unwind Phase**:

```
                 beginWork
                    ↓
              Render Subtree
                    ↓
             ┌──────┴──────┐
             │             │
          Success        Error / Suspense Promise
             │             │
             ▼             ▼
      completeWork       UNWIND PHASE
             │             │
             │        Traverse upward searching for Boundary
             │             │
             │             ▼
             │     Find Nearest Error Boundary / Suspense Node
             │             │
             │             ▼
             │     Construct & Render Fallback Tree
             │             │
             └──────┬──────┘
                    ▼
               Commit Phase
```

---

### Top 10 Must-Know React Internal Mechanics

#### 1. Error Boundaries & Unwind
- Errors in `render`, lifecycle methods, or constructors cause React to unwind the Fiber stack.
- React searches upward for a Fiber node implementing `getDerivedStateFromError` or `componentDidCatch`.
- The boundary Fiber receives an update with the error, re-renders with the fallback UI, and clears the crashing subtree.

#### 2. Suspense Internals & Retry/Ping Lanes
- When a resource suspends, React catches the Promise, marks the lane in `suspendedLanes`, attaches a `.then()` listener, and renders the nearest `<Suspense>` fallback.
- When the Promise resolves, the listener pings the root (`pingedLanes`), instructing the Scheduler to queue a retry render pass.

#### 3. Context Propagation & Dependency Tracking
- When `ContextProvider` receives a new value, React reads `oldProps.value !== newProps.value`.
- Instead of re-rendering every child unconditionally, React traverses down the Fiber subtree, finds all consumers reading that context (tracked via `fiber.dependencies`), and marks their Lanes as pending.

#### 4. Ref Internals (`useRef`, Callback Refs)
- **Object Refs**: Plain mutable objects `{ current: value }`. React updates `ref.current` during the **Commit Layout phase**.
- **Callback Refs**: Attached in the commit phase when host node is mounted/updated, called with `null` during unmount before re-calling with the new node instance.

#### 5. Effect Lifecycle & Execution Order
Execution order during the Commit phase:
1. `useInsertionEffect` cleanups & callbacks (Fires synchronously *before* DOM mutations; used by CSS-in-JS libraries to inject style tags).
2. DOM Mutations applied to browser host tree.
3. `useLayoutEffect` cleanups & callbacks (Fires synchronously *after* DOM mutations, *before* browser paint).
4. Browser Paints visual frame to screen.
5. `useEffect` cleanups & callbacks (Fires asynchronously on passive lane *after* browser paint).

#### 6. Portals (`createPortal`)
- React Fiber hierarchy maintains the logical parent-child connection for context and event bubbling.
- Host DOM parent node is detached from the Fiber parent's DOM node and attached directly to the specified target DOM container.

#### 7. `flushSync`
- Bypasses React's batching and lane priority scheduling.
- Immediately forces pending updates in the callback to render synchronously and flushes the DOM mutations before returning, risking main-thread jank if overused.

#### 8. `useSyncExternalStore`
- Solves **tearing** (where different components read different states during concurrent rendering of external state stores like Redux/Zustand).
- Enforces synchronous consistency checks against external stores, falling back to synchronous rendering if store mutations occur mid-render.

#### 9. Selective Hydration & Streaming SSR
- React streams HTML chunks over HTTP.
- As scripts load, React selectively hydratable subtrees asynchronously.
- If a user clicks on an unhydrated component wrapped in `<Suspense>`, React elevates that subtree's hydration lane priority to hydrate it **on demand** before handling the user click.

#### 10. Offscreen / Activity API (`<Activity>`)
- Allows React to preserve state and Fiber nodes for hidden subtrees (e.g., hidden tabs, background screens).
- Subtrees are unmounted from the DOM but retained in memory; effects are cleaned up, and renders are deferred until marked visible again.

---

### Advanced & Modern React Concepts
- **React Server Components (RSC) / Flight Protocol**: Renders components exclusively on the server, serializing elements into a compact JSON-like binary stream (Flight format) sent to the client without shipping component JS code.
- **Server Actions**: Server-side functions invokable directly from client forms or event handlers with built-in progressive enhancement and automatic revalidation.
- **`useDeferredValue`**: Wraps a fast-changing state value to produce a deferred copy updated inside a lower-priority `TransitionLane`, keeping inputs responsive.
- **React Compiler Internals (Forget)**: Auto-memoization engine that statically analyzes JS semantics to automatically insert memoization primitives during build time, eliminating manual `useMemo` and `useCallback`.

---

## 11. Complete Unified React Architecture Diagram

```
                                  REACT ARCHITECTURE
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    ▼                                           ▼
             SERVER SIDE                                   CLIENT SIDE
                    │                                           │
       RSC / Flight Stream / SSR                           React Element
                    │                                           │
               HTML Stream                                      ▼
                    │                                      Fiber Node
                    │                                           │
                    │                                     Update Queue / Lane
                    │                                           │
                    │                                    React Scheduler
                    │                                           │
                    │                                 ┌─────────┴─────────┐
                    │                                 ▼                   ▼
                    │                            beginWork           completeWork
                    │                                 │                   │
                    │                             Reconcile             Flags
                    │                              Bailout           SubtreeFlags
                    │                                 └─────────┬─────────┘
                    │                                           ▼
                    │                                      finishedWork
                    │                                           │
                    │                                      COMMIT PHASE
                    │                                           │
                    │                                 ┌─────────┼─────────┐
                    │                                 ▼         ▼         ▼
                    │                              Mutation   Layout   Passive
                    │                                 │         │         │
                    └──────────► HTML Stream ◄────────┘         │     useEffect
                                       │                        │
                                       ▼                 useLayoutEffect
                               Browser Parsing                  │
                                       │                        ▼
                                    DOM Tree ◄──────────────────┘
                                       │
                                       ▼
                            Browser Rendering Engine
                                       │
                            Style → Layout → Paint
                                       │
                                   Composite
                                       │
                                    PIXELS
```

---

## 12. Staff / Principal Engineer Interview Q&A

### Q1: How does React's Lane priority system prevent high-priority updates from starving background transitions indefinitely?
**Answer:** 
React assigns an **expiration timestamp** to every lane when work is scheduled. If a low-priority lane (such as a `TransitionLane`) is repeatedly postponed because high-priority updates (like `InputContinuousLane` from typing) keep arriving, the low-priority lane eventually exceeds its expiration threshold. Once expired, React moves the lane into `expiredLanes` on the `FiberRoot`. The scheduler then treats expired lanes as synchronous, forcing React to execute them in the immediate next render pass regardless of incoming high-priority work.

---

### Q2: What is the technical difference between a React Element, a Fiber Node, a DOM Node, and visual Pixels?
**Answer:**
- **React Element**: A lightweight, immutable plain JavaScript object produced by `React.createElement` or JSX that serves as a blueprint describing what the UI should look like at a specific snapshot.
- **Fiber Node**: A persistent, mutable node in React's internal reconciler tree that tracks component state, hooks, pending lane bitmasks, work flags, and references to parent/child/sibling fibers.
- **DOM Node**: The actual browser host tree node (`HTMLElement`) created or modified by React during the commit phase.
- **Pixels**: The actual visual image rasterized and composited onto the monitor screen by the browser's rendering engine (Style → Layout → Paint → Composite pipeline).

---

### Q3: How does React's Double Buffering architecture guarantee zero visual flicker during asynchronous concurrent renders?
**Answer:**
React maintains two distinct Fiber trees in memory: the `current` tree (reflecting what is currently painted on screen) and the `workInProgress` (WIP) tree (where new updates are computed asynchronously). Throughout the interruptible Render phase, all calculations, hook executions, and diffing occur exclusively on the WIP tree without touching the real DOM. Once the WIP tree is fully constructed (`finishedWork`), React enters the synchronous Commit phase, applies DOM mutations, and atomically swaps `root.current = wip`. Because the swap is atomic and happens before the browser paint, users never see partial or flickering UI state.

---

### Q4: Why does the React Scheduler use `MessageChannel` for time-slicing instead of `setTimeout` or `requestAnimationFrame`?
**Answer:**
React needs a macrotask primitive to yield control back to the browser main thread every ~5ms so user inputs and paints can process. `setTimeout(fn, 0)` is unsuitable because browsers enforce a minimum 4ms clamping penalty when nested deeper than 5 levels. `requestAnimationFrame` is also unsuitable because it fires strictly *before* paint at frame boundaries, making it inefficient for scheduling interruptible, non-visual background rendering work. `MessageChannel` provides a lightweight macrotask postMessage queue that executes immediately after the current main-thread task finishes without clamping delays.

---

### Q5: How does Root Event Delegation work in React 17/18+ and how do synthetic events map to Lane priorities?
**Answer:**
React attaches a single set of native event listeners to the root DOM container (`#root`), rather than binding event listeners directly to individual DOM nodes. When an event fires, it bubbles to `#root`, where React intercepts it, wraps it in a unified `SyntheticEvent` object, and manually traverses the Fiber tree upward to execute Capture and Bubble phase event handlers. Based on the event type, React maps the event to a specific priority Lane: discrete interactions (e.g., `click`, `keydown`) map to `SyncLane`, continuous interactions (e.g., `mousemove`, `scroll`) map to `InputContinuousLane`, and custom/async events map to `DefaultLane`.

---

### Q6: How do `useInsertionEffect`, `useLayoutEffect`, and `useEffect` differ in their timing relative to DOM updates and browser paint?
**Answer:**
- **`useInsertionEffect`**: Runs synchronously **before** DOM mutations are applied. It is designed specifically for CSS-in-JS libraries to inject `<style>` tags into the DOM before layout calculation.
- **`useLayoutEffect`**: Runs synchronously **after** DOM mutations are applied, but **before** the browser paints the frame. It allows measuring element dimensions and applying immediate layout adjustments without visual flickering.
- **`useEffect`**: Runs asynchronously on a passive lane **after** DOM mutations are applied and **after** the browser has painted the frame to the screen, ensuring non-blocking execution for side effects like data fetching and analytics tracking.

