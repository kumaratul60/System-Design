# Communication Strategies

Effective communication is the backbone of any distributed system. This guide covers how components—from browsers to databases—talk to each other, the protocols they use, and how to choose the right pattern for your use case.

---

## 1. Unidirectional vs. Bidirectional Communication

Before diving into protocols, understand the flow of data:

| Feature        | Unidirectional                               | Bidirectional (Full-Duplex)                |
| :------------- | :------------------------------------------- | :----------------------------------------- |
| **Data Flow**  | One way at a time (usually Client → Server). | Both directions simultaneously.            |
| **Initiation** | Client always starts the request.            | Either party can send data once connected. |
| **Examples**   | Standard HTTP, SSE (Server-Sent Events).     | WebSockets, gRPC (Bi-di streaming).        |
| **Efficiency** | High overhead for frequent updates.          | Low overhead; persistent connection.       |

---

## 2. Server-Client Interaction: The Ecosystem

### A. Frontend to Backend (The Public API)

The frontend (Browser/Mobile) interacts with the backend using these primary techniques:

1.  **REST (Representational State Transfer):** The standard. Uses HTTP methods (GET, POST, etc.). Statless and cacheable.
2.  **GraphQL:** Allows the frontend to ask for exactly what it needs. Reduces over-fetching.
3.  **WebSockets:** For real-time updates (Chat, Stock tickers).

### B. Backend to Backend (Service-to-Service)

Communication within the data center often requires higher performance:

1.  **gRPC:** High-performance, binary protocol using Protocol Buffers. Ideal for internal microservices.
2.  **Message Queues (Asynchronous):** Using Kafka or RabbitMQ. The "Fire and Forget" model.
3.  **Service Mesh:** Tools like Istio manage communication, retries, and security between services.

### C. Backend to Database

1.  **TCP/IP Connections:** Most DBs (Postgres, MySQL) use persistent TCP connections.
2.  **Connection Pooling:** Backends maintain a "pool" of open connections to avoid the high cost of creating a new connection for every query.

---

## 3. Deep Dive: Polling, Webhooks, SSE, and WebSockets

### Short Polling

Client sends requests at regular intervals (e.g., every 5 seconds) to check for updates.

- **When to use:** Small-scale apps where real-time isn't critical.
- **Pitfall:** High server load and network waste if data hasn't changed.

### Long Polling

The client requests data, and the server **holds the request open** until new data is available or a timeout occurs.

- **When to use:** When you need "near" real-time but cannot use WebSockets.
- **Example:** Early versions of Uber (checking driver location).

### Webhooks (Reverse APIs)

The server pushes data to a predefined URL on the client when an event happens.

- **When to use:** Server-to-Server notifications.
- **Example:** Stripe notifying your backend that a payment was successful.

### Server-Sent Events (SSE)

A unidirectional persistent connection where the server pushes updates to the client.

- **When to use:** News feeds, stock tickers, or social media notifications.
- **Advantage:** Uses standard HTTP; automatic reconnection.

### WebSockets

A persistent, full-duplex connection over a single TCP socket.

- **The Protocol:** Starts as an HTTP request with an `Upgrade` header. Once the "handshake" is done, it switches to the binary WebSocket protocol.

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

- **Use WebSockets** for highly interactive apps like whiteboards or multiplayer games.
- **Use SSE** if you only need the server to push data (it’s lighter than WebSockets).
- **Use Webhooks** for third-party integrations (GitHub, PayPal).
- **Implement Heartbeats:** Send "ping/pong" messages in WebSockets to ensure the connection is still alive.

### ❌ Don'ts

- **Don't use Short Polling** for mobile apps; it kills the battery.
- **Don't use WebSockets** if you need to cache responses (HTTP is better for caching).
- **Don't forget Load Balancing:** WebSockets are stateful; your load balancer needs "Sticky Sessions" or a shared state (like Redis) to work correctly.

### ⚠️ Pitfalls

- **Zombie Connections:** WebSockets can stay open on the server even if the client has crashed, leading to memory leaks.
- **Firewall Blocking:** Some strict corporate firewalls block non-HTTP traffic (though WS usually bypasses this via port 80/443).

---

## 6. Security & Headers

Communication security relies on more than just encryption:

1.  **TLS/SSL (HTTPS/WSS):** Always encrypt data in transit. Use `wss://` instead of `ws://`.
2.  **Authentication Headers:**
    - `Authorization: Bearer <token>`: Standard for REST/gRPC.
    - **WebSocket Auth:** Since the handshake is HTTP, use tokens in the URL or a cookie during the initial request.
3.  **CORS (Cross-Origin Resource Sharing):**
    - `Access-Control-Allow-Origin`: Prevents unauthorized websites from making requests to your API.
4.  **Important Headers:**
    - `Upgrade: websocket`: Essential for initiating WS.
    - `Connection: Upgrade`: Tells the server to switch protocols.
    - `Strict-Transport-Security (HSTS)`: Forces the browser to use HTTPS.

---

## 7. Real-World Examples

### Example 1: Food Delivery App (DoorDash/UberEats)

- **Frontend to Backend:** REST to place the order.
- **Backend to Driver:** **WebSockets** to track the driver's GPS in real-time on the map.
- **Payment:** **Webhooks** from Stripe to confirm the user paid.

### Example 2: Financial Trading Platform

- **Price Updates:** **SSE** (Server-Sent Events) to push the latest stock prices to thousands of users simultaneously.
- **Trade Execution:** **gRPC** for ultra-fast communication between the frontend server and the matching engine.

### Example 3: Chat Application (WhatsApp/Slack)

- **Message Delivery:** **WebSockets** for instant, two-way messaging.
- **Offline Messages:** **Push Notifications** (unidirectional) when the app is closed.
