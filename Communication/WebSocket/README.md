# WebSockets: The Complete Architectural Guide

A persistent, full-duplex communication protocol over a single TCP connection for real-time, bi-directional messaging.

---

## 1. Core Building Blocks

- **Full-Duplex vs. Half-Duplex:**
  - **Full-Duplex:** Both sides send/receive simultaneously (WebSocket).
  - **Half-Duplex:** One side at a time (e.g., HTTP request/response or Walkie-Talkie).
- **TCP Connection:**
  - connection oriented
  - Reliable, ordered, error-checked byte stream.
  - **The Catch:** TCP has no message boundaries; WebSocket adds **Framing** on top.
- **Bi-directional:** Client ↔ Server can push anytime without a request/response lock.
- **Serialization / Deserialization:**
  - Convert Objects ↔ Bytes.
  - **JSON:** Simple, human-readable, but larger.
  - **Protobuf/MessagePack:** Compact, faster, binary-based.
  - _Pitfall:_ Schema drift/versioning can break clients.
- **Packet Switching:** Data split into packets and routed independently. TCP reorders them so you see a clean stream.
- **ws:// vs wss://:** `ws` is plaintext; `wss` is TLS encrypted. **Always use wss:// in production.**
- **HTTP Upgrade (101):**
  - Starts as HTTP: `Upgrade: websocket` + `Connection: Upgrade`.
  - Server replies `101 Switching Protocols` → the socket becomes WebSocket.
- **Framing:**
  - Large messages split into chunks (frames).
  - Includes opcodes (text/binary), masking (client→server), and control frames (ping/pong).

---

## 2. The Lifecycle & Handshake

WebSockets start as a standard HTTP request to ensure compatibility with existing infrastructure.

```mermaid
sequenceDiagram
    participant Client
    participant Server
    Note over Client,Server: 1. Handshake (HTTP)
    Client->>Server: GET /chat (Upgrade: websocket)
    Server->>Client: 101 Switching Protocols
    Note over Client,Server: 2. Open Connection (TCP)
    loop Bi-directional Data
        Client->>Server: Binary/Text Frame
        Server->>Client: Binary/Text Frame
    end
    Note over Client,Server: 3. Heartbeats
    Server->>Client: Ping
    Client->>Server: Pong
    Note over Client,Server: 4. Close
    Client->>Server: Close Frame
```

**Lifecycle States:**

- **Handshake:** HTTP Upgrade request → 101 Switching Protocols.
- **Open:** Connection established and ready for data.
- **Message Exchange:** Bi-directional event-driven communication.
- **Heartbeats:** Periodic Ping/Pong to keep the connection alive.
- **Close:** Graceful (closing frame) or abrupt (network failure).

---

## 3. Minimal Flow (Code)

**Server (Node.js/ws)**

```javascript
import { WebSocketServer } from 'ws';
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', (data) => ws.send(data)); // Echo
  const hb = setInterval(() => {
    if (ws.readyState === ws.OPEN) ws.ping();
  }, 30000);
  ws.on('close', () => clearInterval(hb));
});
```

**Client**

```javascript
const ws = new WebSocket('wss://your-domain');
ws.onopen = () => ws.send(JSON.stringify({ type: 'ping' }));
ws.onmessage = (e) => console.log(JSON.parse(e.data));
ws.onclose = () => {
  /* Implement exponential backoff here */
};
```

---

## 4. Architecture Patterns

- **Simple (Single Node):** Connections held in-memory. Only for prototypes.
- **Scaled (Multi-Node):**
  - **Sticky Sessions:** Load balancer ensures client → same node.
  - **Pub/Sub (Redis/NATS/Kafka):** Nodes sync via a message bus to broadcast across the cluster.
- **Gateway Layer:** Dedicated WS gateway (Node/Go) that handles connections and talks to microservices via a message bus.

---

## 5. Key Challenges & Fixes

- **Resource Usage:** Every socket = RAM + File Descriptor. Tune `ulimit` and use lightweight servers (Go/uWebSockets.js).
- **Connection Limits:** Browsers limit per-origin sockets; Servers limited by OS. Use subdomains if sharding is needed.
- **Load Balancers:** Must support `Upgrade` header. (e.g., NGINX: `proxy_set_header Upgrade $http_upgrade`).
- **Authentication:** Done during handshake (Cookies/JWT). _Note:_ Validate per-message on the server if logic is complex.
- **Firewalls:** Some block `ws://`. Use `wss://` on Port 443 to bypass.
- **Connection Drops:** Use **Exponential Backoff** for reconnections and **Last Event ID** to resume missed state.
- **Testing:** Use tools like `wscat`, `websocat`, or Browser DevTools → WS tab.
- **Compatibility:** Version your messages: `{ "v": 2, "type": "update" }`.

---

## 6. Common Pitfalls

- **Huge JSON blobs:** Causes latency spikes.
- **No Backpressure:** Sending data faster than the client can read → memory leaks.
- **Zombie Connections:** Missing heartbeats lead to resource exhaustion.
- **Blind Broadcasting:** Sending to 100k users at once → CPU spikes. Use room/channel partitioning.
- **Broken State:** Assuming message order across different shards.

---

## 7. Use Cases: When to use?

- **Financial Trading:** Sub-second stock/crypto price updates.
- **Online Gaming:** Syncing player movements and game state instantly.
- **Collaborative Tools:** Real-time cursor tracking or typing indicators (Google Docs/Figma).
- **Live Analytics:** Dashboards showing active users or server health.

---

## 8. When NOT to use WebSockets

- **Simple CRUD:** Use standard REST/GraphQL.
- **Low Frequency:** Use Polling or Server-Sent Events (SSE) (cheaper/simpler).
- **Cacheable Data:** WebSockets cannot be cached by CDNs; use HTTP.

---

## Senior/Staff Level "Grill" Questions

### Q1: Why is Load Balancing "harder" for WebSockets than for REST?

> **Answer:** Standard HTTP is stateless; any server can handle any request. WebSockets are **stateful** and **long-lived**.
>
> - **The Problem:** A standard L4 Load Balancer might distribute connections evenly, but if one server stays up for 10 days and another for 1 hour, the older server will accumulate 10x more connections (**Sticky Connection Imbalance**).
> - **The Solution:** Use **L7 Load Balancers** (like Envoy or ALB) with **Connection Draining** and **Load-based rebalancing**. Also, implement client-side **Jittered Reconnection** to redistribute load after a server restart.

### Q2: How do you implement "Authentication" for WebSockets securely?

> **Answer:** The WebSocket RFC doesn't specify an auth mechanism.
>
> - **Standard Pattern:** Authenticate during the **HTTP Upgrade (Handshake)**. Send a JWT in a cookie (HttpOnly/Secure) or a query parameter (though query params leak in logs).
> - **Staff Tip:** For high-security systems, use a **Ticket-based System**. The client gets a short-lived, one-time-use "ticket" from a REST API, then sends that ticket in the WebSocket handshake. The ticket is immediately invalidated once the socket opens.

### Q3: Explain the "Pub/Sub Backplane" and why it's mandatory for scaled WebSockets.

> **Answer:** If User A is connected to Server 1 and User B to Server 2, how does Server 1 send a message to User B?
>
> - **The Architecture:** You need a central **Message Bus** (Redis Pub/Sub, NATS, or RabbitMQ). Every server subscribes to a channel. When a message is sent to User B, Server 1 publishes it to the bus. Server 2 receives it and pushes it down the specific TCP pipe it holds for User B.

### Q4: How do you handle "Head-of-Line Blocking" at the application level in WebSockets?

> **Answer:** While WebSockets are full-duplex, they run over a single TCP stream. If you send a 100MB file and a 1KB "Hi" message over the same socket, the "Hi" message is stuck behind the 100MB file.
>
> - **The Solution:**
>   1. **Message Chunking:** Break large messages into small frames.
>   2. **Priority Lanes:** Use multiple WebSocket connections (one for control, one for data).
>   3. **The Modern Fix:** Switch to **WebTransport (HTTP/3)**, which allows multiple independent streams over a single connection, eliminating stream-level HOL blocking.

---

## 10. Libraries: `ws` vs `Socket.io`

| Feature           | `ws` (Raw WebSockets)           | `Socket.io` (Abstraction Layer)          |
| :---------------- | :------------------------------ | :--------------------------------------- |
| **Protocol**      | Pure WebSocket (RFC 6455)       | Custom protocol (WS + Polling fallback)  |
| **Serialization** | Manual (`JSON.stringify/parse`) | Automatic (Pass objects directly)        |
| **Reconnection**  | Manual implementation required  | Automatic built-in (Exponential backoff) |
| **Events**        | Basic `on('message')`           | Custom named events (`on('chat')`)       |
| **Broadcast**     | Manual loop over `wss.clients`  | Built-in `io.emit()` or `Rooms`          |
| **Overhead**      | Minimal (High performance)      | Higher (Extra metadata per packet)       |

---

## 11. Which one to choose? (Interview Perspective)

### Use **`ws` (Raw)** when:

- **Performance at Scale:** Handling 100k+ concurrent connections with minimal RAM.
- **IoT & Mobile:** Low-power devices where every byte and CPU cycle counts.
- **Machine-to-Machine:** Internal microservices or high-frequency trading.
- **Standard Compliance:** When you need a "pure" implementation without a proprietary library.

#### Use **`Socket.io`** when:

- **User-Facing Apps:** Chat, Social Feeds, or Dashboards where UX is critical.
- **Reliability:** You need automatic reconnection and fallback to **Long Polling** if WS is blocked by firewalls.
- **Feature Richness:** You need **Rooms** (e.g., specific chat groups) or **Namespaces** out of the box.
- **Developer Speed:** You want to focus on business logic rather than low-level protocol handling.

---

## 12. Serialization & Deserialization (Data on the Wire)

Since computers send raw bytes over network cables/Wi-Fi, we must convert our high-level objects into a transmittable format.

1.  **Serialization (Sender Side):** Converting a JavaScript Object into a string or binary buffer.
    - _Example:_ `JSON.stringify({ text: "Hello" })` -> `"{\"text\":\"Hello\"}"`
2.  **Transmission:** The string is broken into packets and sent over the TCP pipe.
3.  **Deserialization (Receiver Side):** Converting the raw string/buffer back into a JavaScript Object.
    - _Example:_ `JSON.parse(data)` -> `{ text: "Hello" }`

**Socket.io** abstracts this away, doing the stringify/parse for you automatically.

---

## 12. Running the Examples

1.  **Raw WS:**
    - Run: `node server-ws.js`
    - Open `client-ws.html` in your browser.
2.  **Socket.io:**
    - Run: `node server-socketio.js`
    - Open `client-socketio.html` in your browser.
