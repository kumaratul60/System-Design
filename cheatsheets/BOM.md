# Browser Object Model (BOM): Advanced Architecture & Reference

The **Browser Object Model (BOM)** is a set of APIs exposed by the browser to interact with the environment surrounding the web page. While the DOM models the document structure, the BOM models window dimensions, navigation history, geolocation tracking, device specs, and cross-tab communication.

```
                  ┌────────────────────────────────────────┐
                  │                 Window                 │
                  └────┬──────┬─────────┬─────────┬────┬───┘
                       │      │         │         │    │
         ┌─────────────┘      │         │         │    └─────────────┐
   ┌─────▼────┐         ┌─────▼────┐  ┌─▼──┐  ┌───▼───┐         ┌────▼─────┐
   │ Document │         │ History  │  │Screen││Location│         │Navigator │
   │  (DOM)   │         │  (BOM)   │  │(BOM) ││ (BOM)  │         │  (BOM)   │
   └──────────┘         └──────────┘  └────┘  └───────┘         └──────────┘
```

---

## 1. Window Object: Global Host Context

The `window` object represents the browser window hosting the DOM document. It is the global object for client-side JavaScript execution.

### 1.1 Cross-Origin Window Messaging (`postMessage`)

Direct script references between windows from different origins (e.g. iframes, child tabs opened via `window.open`) are blocked by the **Same-Origin Policy**.

- **Solution:** Use `window.postMessage` to send serialized payloads safely across origins.

> [!CAUTION]
> Failing to validate `event.origin` when receiving messages allows malicious sites hosting your page inside an iframe to execute arbitrary code (XSS).

```javascript
// A. Emitter Window (Main Page)
const iframeElement = document.getElementById('sandbox-iframe');

// Send data only if target matches the origin exactly
iframeElement.contentWindow.postMessage({ action: 'syncState', payload: { userId: 99 } }, 'https://secure-sandbox.com');
```

```javascript
// B. Receiver Window (https://secure-sandbox.com)
window.addEventListener('message', (event) => {
  // CRITICAL: Always validate the sender's origin
  if (event.origin !== 'https://trusted-parent.com') {
    console.warn('Blocked unauthorized message from:', event.origin);
    return;
  }

  const { action, payload } = event.data;
  if (action === 'syncState') {
    handleStateSync(payload);
  }
});
```

---

## 2. History API & Client-Side SPA Routing

Single Page Application (SPA) routers use the History API to transition URLs without causing full-page document reloads.

### 2.1 State Pushes and Browser Back Navigation

- `history.pushState(state, title, url)`: Creates a new entry in the session history stack.
- `history.replaceState(state, title, url)`: Modifies the current history entry without pushing a new state.
- `popstate` event: Fires when the active history entry changes due to browser actions (like clicking the browser Back/Forward buttons).

```javascript
// Register a listener to handle back/forward navigation
window.addEventListener('popstate', (event) => {
  // Retrieve the state object associated with the history entry
  const state = event.state;
  if (state && state.route) {
    renderRoute(state.route, false); // Render route without pushing new state
  }
});

function navigateTo(route) {
  // Save route state and change URL synchronously without reloading page
  history.pushState({ route }, '', route);
  renderRoute(route, true);
}
```

### 2.2 Manual Scroll Restoration

By default, the browser remembers and restores scroll positions when navigating history. For SPAs where content is loaded dynamically, this default behavior can cause the page to scroll to random positions.

- **Solution:** Change `history.scrollRestoration` to `manual`.

```javascript
if ('scrollRestoration' in history) {
  // Disable default browser scroll restoration
  history.scrollRestoration = 'manual';
}
```

---

## 3. Location: URL Manipulation & Search Parsing

The `location` object represents the current URL of the active document.

### 3.1 `location.href` vs. `location.replace()`

- `location.href = '/path'`: Navigates to a new page, pushing the current page into history. The back button will return to this page.
- `location.replace('/path')`: Navigates to a new page, replacing the current page in history. The back button will skip this page. **Essential for post-login redirects.**

### 3.2 Modern URL & Search Parameter Parsing

Avoid parsing query parameters (`location.search`) using complex regex. Use the native `URL` and `URLSearchParams` APIs instead.

```javascript
// URL: https://app.com/search?q=js+perf&sort=desc#results

const url = new URL(window.location.href);

console.log(url.pathname); // "/search"
console.log(url.hash); // "#results"

// Parse Query Parameters
const params = new URLSearchParams(url.search);
const query = params.get('q'); // "js perf"
const sortOrder = params.get('sort') || 'asc'; // "desc"

// Modify parameters in memory
params.set('page', '2');
const updatedUrl = `${url.pathname}?${params.toString()}`;
// history.pushState({}, '', updatedUrl);
```

---

## 4. Navigator: Hardware & Capability Detection

The `navigator` object provides information about the client browser, operating system, and hardware properties.

### 4.1 Adaptive Asset Loading

For high-performance web applications, you can detect the client's network connection and hardware memory limits to serve scaled down assets (e.g. low-res images, blocking heavy animations on low-memory devices).

```javascript
function loadAdaptiveAssets() {
  const dpr = window.devicePixelRatio || 1;
  const memoryGb = navigator.deviceMemory || 4; // RAM in GB
  const logicalCores = navigator.hardwareConcurrency || 4; // CPU cores

  // Connection details (Network Information API)
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isSlowNetwork = connection && (connection.effectiveType === '2g' || connection.effectiveType === '3g');

  if (memoryGb <= 2 || logicalCores < 4 || isSlowNetwork) {
    console.log('Low-performance device or slow connection detected. Activating performance saving mode.');
    disableHeavyEffects();
    fetchLowResolutionImages();
  } else {
    fetchHighResolutionImages(dpr);
  }
}
```

### 4.2 Clipboard & User Permissions

Modern asynchronous APIs require querying user permissions before triggering prompt overlays.

```javascript
async function copyToClipboardSafely(text) {
  try {
    // Check permission status first
    const permissionStatus = await navigator.permissions.query({ name: 'clipboard-write' });

    if (permissionStatus.state === 'granted' || permissionStatus.state === 'prompt') {
      await navigator.clipboard.writeText(text);
      console.log('Copied successfully!');
    }
  } catch (error) {
    console.error('Failed to write to clipboard:', error);
  }
}
```

---

## 5. Interview Hot Corners

### Q1: Why does `window.onLine` return false positives?

- **Answer:** `navigator.onLine` returns a boolean indicating whether the client browser is connected to a network. However, it does not verify whether that network has actual internet access (e.g., if the user is connected to a router but the WAN connection is offline, `navigator.onLine` returns `true`). Always pair this check with a quick `fetch` request or listen for offline events to confirm connectivity:
  ```javascript
  window.addEventListener('offline', () => showOfflineAlert());
  ```

### Q2: How do you listen to route changes in single-page apps (SPAs)?

- **Answer:** The `popstate` event only fires when the browser back/forward buttons are clicked or `history.back()` / `history.forward()` is called programmatically. It **does not** fire when `history.pushState()` or `history.replaceState()` is called. To listen to all route changes, SPA routers wrap the `pushState` and `replaceState` methods to trigger custom events:

  ```javascript
  const patchHistoryMethod = (type) => {
    const orig = history[type];
    return function () {
      const result = orig.apply(this, arguments);
      const event = new Event(type.toLowerCase());
      event.arguments = arguments;
      window.dispatchEvent(event);
      return result;
    };
  };
  history.pushState = patchHistoryMethod('pushState');

  // Now you can listen to custom state pushes:
  window.addEventListener('pushstate', () => console.log('Route updated!'));
  ```

---

## 6. Syntax Cheat Sheet & Core DOM Reference

This section consolidates primary Browser JavaScript APIs, traversal helpers, context bounds, event mechanisms, and scroll formulas.

### 6.1 Browser Host Objects

#### `window` (Browser Global Object)

- **APIs**: `window.alert()`, `window.location`, `window.localStorage`, `window.setTimeout()`, `window.setInterval()`
- **Use Cases**: Accessing platform APIs, browser tab parameters, timers, and storage bindings.

#### `document` (Document Object Model)

- **APIs**: `document.querySelector()`, `document.getElementById()`, `document.createElement()`, `document.title`
- **Use Cases**: Querying elements, modifying DOM node configurations, and altering document metadata.

#### `document.body` (Body Element Context)

- **APIs**: `document.body.classList.add()`, `document.body.style.overflow`, `document.body.appendChild()`
- **Use Cases**: Altering body/global CSS styles, rendering portal modals, and disabling viewport scroll chains.

#### `document.documentElement` (Root Element Context)

- **APIs**: `document.documentElement.scrollHeight`, `document.documentElement.clientHeight`
- **Use Cases**: Calculating scroll offset bounds and dynamic screen height ratios.

---

### 6.2 Context Binding: `this` Behavior

#### Object Method Call

```javascript
const user = {
  name: 'Deval',
  greet() {
    console.log(this.name); // Output: "Deval" (Refers to calling object)
  },
};
user.greet();
```

#### Standard Function Execution

```javascript
function test() {
  console.log(this);
}
test(); // Output: window (non-strict mode) or undefined (strict mode)
```

#### Arrow Functions

```javascript
const user = {
  name: 'Deval',
  greet() {
    const print = () => {
      console.log(this.name); // Inherits context from greet() -> user
    };
    print();
  },
};
```

> **Rule**: Arrow functions do NOT maintain their own `this` context binding; they inherit from their outer lexical execution context.

---

### 6.3 Event Propagation & Delegation

#### Event Target Properties

- `event.target`: The actual nested element that initiated/triggered the click event.
- `event.currentTarget`: The wrapper element containing the active event listener.

```html
<div id="parent">
  <button id="btn">Delete</button>
</div>
```

```javascript
parent.addEventListener('click', (e) => {
  console.log(e.target); // Output: button element (element clicked)
  console.log(e.currentTarget); // Output: parent div element (element listening)
});
```

#### Event Bubbling Execution Flow

Events bubble up from the target element through all its parent nodes to the root window:

```text
button ──► parent ──► body ──► document ──► window
```

#### Event Delegation Pattern

Listen for actions on a shared wrapper parent instead of adding individual event listeners to thousands of list nodes.

```javascript
table.addEventListener('click', (event) => {
  if (event.target.matches('.delete-btn')) {
    deleteRow(event.target);
  }
});
```

- **Benefits**: Reduces memory usage, manages dynamic DOM entries automatically, and scales cleanly.

---

### 6.4 Scroll & Viewport Formulas

#### Measurement APIs

- `window.scrollY` / `scrollX`: Active vertical/horizontal scroll pixel offsets.
- `window.innerHeight` / `innerWidth`: Viewport visible screen dimensions (viewport height/width).
- `document.documentElement.scrollHeight`: The entire height of the document page including hidden overflow portions.
- `document.documentElement.clientHeight`: The visible document height (excluding borders).

#### Detect Scroll to Bottom

```javascript
if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight) {
  console.log('User has scrolled to the absolute bottom of the document.');
}
```

#### Infinite Scroll Trigger

Trigger loading actions slightly before the user reaches the absolute bottom (e.g. 100px before):

```javascript
window.addEventListener('scroll', () => {
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 100) {
    loadMoreData();
  }
});
```

#### Scroll Percentage Formula

```javascript
const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
```

#### Programmatic Navigation Scroll

```javascript
// Smooth Scroll to Top
window.scrollTo({
  top: 0,
  behavior: 'smooth',
});

// Scroll to Target Node
element.scrollIntoView({
  behavior: 'smooth',
});
```

---

### 6.5 Sizing Metric Properties

- `clientHeight`: Visible height of the element including padding (excluding border and margins).
- `offsetHeight`: Visible height of the element including padding + border + scrollbars.
- `scrollHeight`: The full height of the element's scrollable overflow content.

```text
┌───────────────────────────────────────────────┐
│                    Margin                     │
│  ┌─────────────────────────────────────────┐  │
│  │                 Border                  │  │
│  │  ┌───────────────────────────────────┐  │  │
│  │  │              Padding              │  │  │
│  │  │  ┌─────────────────────────────┐  │  │  │
│  │  │  │                             │  │  │  │  ◄── clientHeight (Content + Padding)
│  │  │  │           Content           │  │  │  │
│  │  │  │                             │  │  │  │  ◄── offsetHeight (Content + Padding + Border)
│  │  │  └─────────────────────────────┘  │  │  │
│  │  └───────────────────────────────────┘  │  │
│  └─────────────────────────────────────────┘  │
└───────────────────────────────────────────────┘
```

---

### 6.6 Quick Comparison Tables

#### global vs document vs body

| Object          | Representation                   | Use Case                                           |
| :-------------- | :------------------------------- | :------------------------------------------------- |
| `window`        | The browser global host instance | Listen for resize events, timers, global variables |
| `document`      | The HTML tree representation     | DOM query operations, creating nodes               |
| `document.body` | The target `<body>` DOM node     | Layout styles overrides, mounting portals          |

#### target vs currentTarget

| Property              | Meaning                                  | Stability                                           |
| :-------------------- | :--------------------------------------- | :-------------------------------------------------- |
| `event.target`        | The element that originated the click    | Dynamic (varies depending on clicked child element) |
| `event.currentTarget` | The element registered with the listener | Static (always resolves to listener node)           |

#### Standard Functions vs Arrow Functions

| Characteristic             | Standard Function                    | Arrow Function                        |
| :------------------------- | :----------------------------------- | :------------------------------------ |
| **Bound Context (`this`)** | Resolves dynamically at call site    | Lexically inherited from parent scope |
| **New Constructor**        | Yes (can be instantiated with `new`) | No (throws execution error)           |
| **arguments object**       | Yes (contains all passed parameters) | No                                    |
