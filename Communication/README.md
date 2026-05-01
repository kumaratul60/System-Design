# Communication Strategies

Effective communication is the backbone of any distributed system. This guide covers how components—from browsers to databases—talk to each other, the protocols they use, and how to choose the right pattern for your use case.

---

## 1. Unidirectional vs. Bidirectional Communication

Before diving into protocols, understand the flow of data:

| Feature        | Unidirectional                                 | Bidirectional (Full-Duplex)                |
| :------------- | :--------------------------------------------- | :----------------------------------------- |
| **Data Flow**  | One way at a time (usually Client → Server).   | Both directions simultaneously.            |
| **Initiation** | Client always starts the request.              | Either party can send data once connected. |
| **Examples**   | Standard HTTP, [SSE](#server-sent-events-sse). | [WebSockets](#websockets), gRPC.           |
| **Efficiency** | High overhead for frequent updates.            | Low overhead; persistent connection.       |

---

## 2. Server-Client Interaction: The Ecosystem

### A. Frontend to Backend (The Public API)

The frontend (Browser/Mobile) interacts with the backend using these primary techniques:

1.  **REST (Representational State Transfer):** The standard. Uses HTTP methods (GET, POST, etc.). Stateless and cacheable.
2.  **GraphQL:** Allows the frontend to ask for exactly what it needs. Reduces over-fetching.
3.  **[SSE (Server-Sent Events)](#server-sent-events-sse):** Efficient server-to-client streaming.
4.  **[WebSockets](#websockets):** For highly interactive, two-way communication.

---

## 3. Deep Dive: Techniques & Documentation

### [Short Polling](./ShortPolling/README.md)

Client sends requests at regular intervals (e.g., every 5 seconds) to check for updates.

- **When to use:** Small-scale apps where real-time isn't critical.
- **Detailed Guide:** [Short Polling README](./ShortPolling/README.md)

### [Long Polling](./LongPolling/README.md)

The client requests data, and the server **holds the request open** until new data is available.

- **When to use:** When you need "near" real-time but cannot use WebSockets.
- **Detailed Guide:** [Long Polling README](./LongPolling/README.md)

### [Server-Sent Events (SSE)](./ServerSentEvent/README.md)

A unidirectional persistent connection where the server pushes updates to the client.

- **Advantage:** Uses standard HTTP; automatic reconnection.
- **Detailed Guide:** [SSE README](./ServerSentEvent/README.md)

### [WebSockets](./WebSocket/README.md)

A persistent, full-duplex connection over a single TCP socket.

- **The Protocol:** Handshake starts as HTTP and "upgrades" to WS.
- **Detailed Guide:** [WebSocket README](./WebSocket/README.md)

### Webhooks (Reverse APIs)

The server pushes data to a predefined URL on the client when an event happens.

- **When to use:** Server-to-Server notifications (e.g., Stripe, GitHub).

---

## 4. Detailed Comparison Table

| Technique         | Protocol | Direction        | Real-time?   | Overhead |
| :---------------- | :------- | :--------------- | :----------- | :------- |
| **Short Polling** | HTTP     | Client -> Server | No           | High     |
| **Long Polling**  | HTTP     | Client -> Server | Near         | Medium   |
| **SSE**           | HTTP     | Server -> Client | Yes          | Low      |
| **WebSockets**    | WS       | Both             | Yes          | Lowest   |
| **Webhooks**      | HTTP     | Server -> Server | Event-driven | Low      |

---

## 5. Do's, Don'ts, and Pitfalls

### ✅ Do's

- **Use WebSockets** for highly interactive apps like whiteboards or games.
- **Use SSE** if you only need the server to push data (news feeds, tickers).
- **Implement Heartbeats:** Keep persistent connections (WS/SSE) alive.

### ❌ Don'ts

- **Don't use Short Polling** for mobile; it drains battery life.
- **Don't forget Sticky Sessions:** Stateful connections (WS/SSE) require session affinity.

### ⚠️ Pitfalls

- **HTTP/1.1 Connection Limits:** Browsers limit to ~6 per domain. Use **HTTP/2** to multiplex.
- **Proxy Buffering:** Nginx may buffer streams. Use `X-Accel-Buffering: no`.

---

## 6. Real-World Examples

### Example 1: Food Delivery App (DoorDash)

- **REST:** Place the order.
- **WebSockets:** Track driver GPS in real-time.
- **Webhooks:** Payment confirmation from Stripe.

### Example 2: Financial Platform

- **SSE:** Push latest stock prices to users.
- **gRPC:** Internal communication between backend services.
