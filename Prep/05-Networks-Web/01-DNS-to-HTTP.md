# 🌐 The Complete Web Network Request Lifecycle (DNS to HTTP/3)

> **🎯 Target Audience:** Staff & Principal Engineers
> **Focus:** Full protocol execution path from URL bar entry to browser pixel paint: DNS, TCP, TLS 1.3, HTTP/2 & HTTP/3 QUIC, CDN, L4/L7 Load Balancers, and Latency Breakdown.
> **Existing Repo Tags:** 🔗 [See Networking Module](file:///Users/atulkumarawasthi/projects/SystemDesign/Networking/README.md) | 🔗 [See HTTP Headers](file:///Users/atulkumarawasthi/projects/SystemDesign/Web/Headers.md) | 🔗 [See Web Fundamentals](file:///Users/atulkumarawasthi/projects/SystemDesign/Web/web.md)

---

## ⚡ 1. End-to-End Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Browser as Browser Client
    participant DNS as Recursive DNS Resolver
    participant Edge as CDN / L7 Load Balancer
    participant Origin as Node.js / Express Server

    Note over Browser: User types https://example.com/api/data
    Browser->>DNS: 1. DNS Query (Is IP in Browser/OS Cache?)
    DNS-->>Browser: Returns IP: 104.16.123.45 (A / AAAA Record)

    Browser->>Edge: 2. TCP 3-Way Handshake (SYN -> SYN-ACK -> ACK)
    Browser->>Edge: 3. TLS 1.3 Handshake (ClientHello + Key Exchange)
    Edge-->>Browser: ServerHello + Certificate Verification (0-RTT / 1-RTT)

    Browser->>Edge: 4. HTTP/2 GET /api/data (Multiplexed Stream 1)
    Edge->>Origin: Forward Request over Keep-Alive Pool
    Origin-->>Edge: Returns JSON Response + ETags
    Edge-->>Browser: Streams Response Chunks + Gzip/Brotli Compression

    Note over Browser: Browser parses JSON, updates DOM, triggers Repaint
```

---

## 🔬 2. Protocol Evolution Matrix

| Layer        | Protocol      | Transport  | Key Feature                                                                                                          | Weakness / Tradeoff                                                 |
| :----------- | :------------ | :--------- | :------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------ |
| **HTTP/1.1** | Text-based    | TCP        | Persistent Keep-Alive connections                                                                                    | Head-of-Line (HOL) blocking at HTTP request level                   |
| **HTTP/2**   | Binary Frames | TCP        | Binary framing, Multiplexing over single TCP connection, Header compression (HPACK), Server Push                     | TCP-level Head-of-Line blocking (1 lost packet stalls all streams)  |
| **HTTP/3**   | Binary Frames | UDP (QUIC) | QUIC transport, zero HOL blocking, 0-RTT connection establishment, Connection migration across networks (WiFi to 5G) | Requires UDP support on network firewalls; high CPU load for crypto |

---

## ⚖️ 3. Load Balancing: L4 vs L7

```mermaid
graph TD
    Client[Incoming Traffic] --> L4[L4 Load Balancer: IP + TCP Port Level]
    L4 -->|High Throughput Packet Forwarding| L7[L7 Application Load Balancer: HTTP Level]
    L7 -->|Route by Path / Headers / Cookies| MicroA[Service A: /users]
    L7 -->|Route by Path / Headers / Cookies| MicroB[Service B: /checkout]
```

- **L4 (Transport Layer):** Operates at TCP/UDP level without decrypting TLS payload. Blazing fast, lower CPU overhead.
- **L7 (Application Layer):** Decrypts TLS to inspect HTTP headers, path routes (`/api/v1`), cookies, and request bodies. Enables smart routing, canary deployments, and rate limiting.

---

## ❓ Collapsed Q&A Self-Testing Bank

<details>
<summary>❓ 1. Why does HTTP/2 still suffer from Head-of-Line (HOL) blocking at the TCP layer?</summary>

**Answer:**
HTTP/2 multiplexes multiple logical streams over a single underlying TCP connection. However, TCP guarantees strict sequential byte delivery. If a single packet belonging to Stream A is lost on the network, the OS TCP stack pauses delivery of _all_ subsequent packets (including Streams B and C) until the lost packet is retransmitted. HTTP/3 solves this by switching to UDP via the QUIC protocol, where each stream is isolated.

</details>

<details>
<summary>❓ 2. What is TLS 1.3 0-RTT Resumption and what security risk does it introduce?</summary>

**Answer:**
TLS 1.3 allows clients that have previously connected to a server to send encrypted application data on the very first packet (`ClientHello`), eliminating connection handshake latency completely (0-RTT).
**Security Risk:** 0-RTT data is susceptible to **Replay Attacks** because an attacker can capture the initial packet and re-send it to the server. To mitigate this, servers must restrict 0-RTT to idempotent HTTP requests (`GET` only, never `POST`).

</details>
