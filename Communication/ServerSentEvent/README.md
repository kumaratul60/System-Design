# Server-Sent Events (SSE)

Server-Sent Events (SSE) is a standard designed to allow a web server to push real-time updates to a web browser over a standard HTTP connection.

## TL;DR: The Essentials

- **Direction:** Unidirectional (Server -> Client).
- **Protocol:** Standard HTTP (text/event-stream).
- **Connection:** Persistent, long-lived.
- **Browser Support:** Native via EventSource API.
- **Recovery:** Automatic reconnection built-in.

---

### The Real-time Landscape

1.  **Short Polling:** Client asks "Any new data?" every X seconds. (Inefficient, high latency).
2.  **Long Polling:** Client asks "Any new data?"; server waits until data exists before answering. (Better than short polling, but still high connection overhead).
3.  **Server-Sent Events (SSE):** Client connects once; server pushes data indefinitely.
4.  **WebSockets:** A fully two-way (bidirectional), persistent socket connection.

---

### Core Characteristics

1.  **Long-Lived Connection:** The initial connection remains open indefinitely.
2.  **Unidirectional Communication:** Data flows only from Server to Client.
3.  **Single Standard HTTP Connection:** Runs over standard HTTP (port 80/443).
4.  **Connection: keep-alive:** Relies on the HTTP connection staying open.
5.  **Text-Based Stream:** Data is sent as plain text (UTF-8). Not suited for raw binary.
6.  **Automatic Reconnection:** Browser attempts to reconnect if the connection drops.

---

### Implementation Challenges and Technical FAQ

#### 1. Browser Connection Limits

- **The Limit:** Browsers (Chrome, Firefox, etc.) can only setup **6-8 simultaneous HTTP connections** per domain.
- **The Problem:** If you open 6 tabs of the same app using SSE over HTTP/1.1, the 7th tab will hang because the limit is reached.
- **The Solution:** Use **HTTP/2**. Under HTTP/2, multiple streams are multiplexed over a single TCP connection, effectively removing this per-tab limit.

#### 2. Browser Compatibility

- **Modern Browsers:** Full native support via the `EventSource` API.
- **Older Browsers:** Internet Explorer does not support SSE natively. You must use a "Polyfill" (a JavaScript library that mimics the behavior) to support older environments.

#### 3. Timeouts and Reconnection

- **Connection Timeout:** Servers or Proxies (like Nginx) often kill idle connections after 30-60 seconds.
- **Heartbeats:** To prevent timeouts, the server should send a "comment" or "heartbeat" (e.g., `:heartbeat\n\n`) every 15-20 seconds to keep the line active.
- **Retry Timeout:** The server can send a `retry: [ms]` field to tell the browser exactly how long to wait before attempting a reconnect after a failure.

#### 4. Background Tab Behavior

- **Throttling:** Modern browsers often throttle JavaScript execution in background tabs to save battery.
- **SSE Resilience:** While timers (setTimeout) might slow down, the SSE socket usually remains open. However, if the browser suspends the tab entirely, the connection will drop and trigger the automatic reconnection logic once the tab is focused again.

#### 5. Infrastructure: Load Balancers and Proxies

- **Buffering:** Proxies (Nginx, Cloudflare) often buffer responses to be efficient. For SSE, this is fatal because it delays the "real-time" data.
  - _Fix:_ Set header `X-Accel-Buffering: no` for Nginx.
- **Sticky Connections (Session Affinity):**
  - _What are they?_ A mechanism where a load balancer ensures a specific client always talks to the same server instance.
  - _Why needed?_ If the server keeps local state for a client's stream (like a message cursor), a reconnection to a _different_ server might cause data loss unless you use a shared backend (like Redis).

#### 6. Resource Utilization

- **CPU Leverage:** While SSE is lighter than WebSockets for the server (standard HTTP), keeping thousands of connections open still consumes memory and CPU on the server.
- **Broadcasting:** To efficiently send data to 10,000+ clients, the server shouldn't loop through every connection. Instead, use a **Pub/Sub** system (like Redis or RabbitMQ) to broadcast the message to all worker nodes simultaneously.

#### 7. Testing SSE

- **Tools:** Standard browser DevTools (Network tab) can inspect SSE streams. Look for the "EventStream" sub-tab in the request details.
- **Manual Testing:** You can use `curl -N http://localhost:3000/events` to see the raw text stream in your terminal.

---

## Senior/Staff Level "Grill" Questions

### Q1: Why is SSE often better for "Battery Life" on mobile than WebSockets?

> **Answer:** Mobile operating systems are highly optimized for HTTP.
>
> - **The Reason:** SSE is just a "hanging" HTTP GET request. The mobile OS can "batch" this with other HTTP requests to keep the cellular radio in a low-power state. WebSockets, being a raw TCP stream, often force the radio to stay in a "High Power" state to maintain the socket, draining the battery significantly faster.

### Q2: How do you handle "Proxy Buffering" (Nginx/Cloudflare) breaking your real-time SSE?

> **Answer:** Many proxies buffer responses to be efficient. For SSE, this is fatal because the data won't reach the client until the buffer is full.
>
> - **The Solution:** You must send specific headers to tell the proxy NOT to buffer:
>   1. `X-Accel-Buffering: no` (for Nginx).
>   2. `Cache-Control: no-transform` (prevents CDNs from compressing/modifying the stream).

### Q3: What happens to an SSE connection when the user switches from WiFi to 4G?

> **Answer:** Since SSE is tied to a specific TCP connection (IP/Port 4-tuple), the connection will break.
>
> - **Recovery:** The browser's native `EventSource` will automatically detect the drop and attempt to reconnect.
> - **The "Staff" Nuance:** To prevent data loss during the reconnect, the server should send a **`Last-Event-ID`**. When the client reconnects, it sends this ID in the `Last-Event-ID` header, allowing the server to "replay" missed messages from its buffer (usually Redis).

### Q4: Can you use SSE for "Binary Data"?

> **Answer:** No, the SSE spec defines the data format as UTF-8 text.
>
> - **The Workaround:** You must **Base64 encode** your binary data.
> - **The Trade-off:** Base64 increases the data size by ~33%, which can be a significant performance hit for large assets. For binary-heavy real-time needs, WebSockets or WebTransport are superior.

---

### Decision Matrix: When to Use SSE

| Feature            | SSE                | WebSockets         | Long Polling     |
| :----------------- | :----------------- | :----------------- | :--------------- |
| **Direction**      | Server -> Client   | Bi-directional     | Server -> Client |
| **Complexity**     | Low                | High               | Medium           |
| **Reconnection**   | Native / Automatic | Manual Code Needed | Periodic         |
| **Binary Support** | No (UTF-8 only)    | Yes                | Yes              |

---

### Pitfalls & Limitations Summary

- **Unidirectional:** Client cannot send data back over the same stream.
- **Proxy Buffering:** Requires specific server headers to prevent lag.
- **UTF-8 Only:** Requires Base64 for binary, increasing size by ~33%.
- **HTTP/1.1 Cap:** Limited to 6 tabs without HTTP/2.
