# Network & Asset Optimization

Optimizing the delivery and size of resources to minimize latency and bandwidth.

## Network Optimization Mental Model

This model illustrates how different optimization techniques apply at various stages of the network lifecycle.

```mermaid
graph TD
    User([User Action]) --> DNS[DNS Resolution]
    DNS -- "dns-prefetch" --> Conn[Connection: TCP/TLS]
    Conn -- "preconnect" --> Req[Request Sent]

    subgraph "Server Side"
    Req --> EH[103 Early Hints]
    EH --> Proc[Processing]
    Proc --> Resp[Response Generation]
    end

    Resp -- "Avoid Redirects / Compression (Brotli) / Cache-Control" --> Body[Response Body]

    subgraph "Client Rendering"
    Body --> SW[Service Worker Cache]
    SW --> Parse[HTML Parsing]
    Parse -- "Minimize Requests / Fetch Priority" --> Assets[Asset Discovery]
    Assets -- "Critical Rendering Path" --> Paint[Visual Completion]
    end
```

---

## Network & Assets Mindmap

```mermaid
mindmap
  root((Network & Assets))
    Networking
      HTTP/1.1 vs HTTP/2 vs HTTP/3
      Avoid Redirection
      Early Hints (103)
      Compression (Brotli/Gzip)
    Caching
      Browser Cache (Cache-Control)
      Service Worker Caching
      CDNs & Edge Caching
    Resource Hinting
      dns-prefetch
      preconnect
      preload
      prefetch
      Fetch Priority
    Rendering
      Critical Rendering Path
      Minimize HTTP requests
```

---

## 🚀 Core Optimization Strategies

### 1. Critical Rendering Path (CRP)

The sequence of steps the browser goes through to convert HTML, CSS, and JavaScript into pixels on the screen.

- **Optimization:** Prioritize critical CSS and JS to unblock the first paint.
- **Goal:** Minimize the number of "render-blocking" resources.

### 2. Minimize HTTP Requests

Reducing the overhead of multiple requests, especially in high-latency environments.

- **Strategies:** Image sprites, code splitting (balancing chunk size vs. count), and utilizing HTTP/2+ multiplexing.

### 3. Avoid Redirection

Redirections (`301`, `302`) trigger additional round-trips before the browser can even begin downloading the actual content.

- **Impact:** Each redirect can add hundreds of milliseconds of latency, especially on mobile networks.

### 4. Fetch Priority

Using the `fetchpriority` attribute (e.g., `high`, `low`, `auto`) to hint to the browser which resources (like the LCP image) should be prioritized over others.

---

## 🌐 Modern Networking Protocols

### 1. HTTP/1.1 vs HTTP/2 vs HTTP/3

| Feature                   | HTTP/1.1         | HTTP/2           | HTTP/3                 |
| :------------------------ | :--------------- | :--------------- | :--------------------- |
| **Transport**             | TCP              | TCP              | UDP (QUIC)             |
| **Multiplexing**          | No (Limited)     | Yes (HTTP Level) | Yes (Connection Level) |
| **Head-of-Line Blocking** | Yes (Connection) | Yes (TCP Level)  | No                     |
| **Compression**           | Header: None     | Header: HPACK    | Header: QPACK          |

### 2. HTTP/2 (Multiplexing)

H/2 solved the "Head-of-Line Blocking" at the HTTP level by allowing multiple requests over a single TCP connection.

- **Binary Framing:** Data is sent in binary frames instead of plain text, making it more efficient to parse.
- **Multiplexing:** Multiple requests and responses can be in flight simultaneously over a single connection.
- **Server Push:** Allows the server to send resources to the client before they are requested (Now largely deprecated in favor of `103 Early Hints`).

### 3. HTTP/3 (QUIC - UDP based)

H/3 solves "Head-of-Line Blocking" at the **TCP level** by using the QUIC protocol.

- **UDP Transition:** Uses QUIC instead of TCP. If one packet is lost, it only blocks _that_ specific stream, not the entire connection.
- **0-RTT Handshake:** Combines the transport and cryptographic handshakes, allowing for faster connection establishment for returning users.
- **Connection Migration:** Allows connections to stay active even if the user switches networks (e.g., from Wi-Fi to 4G).

---

## 💡 Resource Hints: Guiding the Browser

| Hint                | Purpose                                        | When to use?                                          |
| :------------------ | :--------------------------------------------- | :---------------------------------------------------- |
| **`dns-prefetch`**  | Resolves domain name early.                    | For third-party domains used later.                   |
| **`preconnect`**    | DNS + TCP + TLS handshake.                     | For high-priority third-party origins (CDN, API).     |
| **`preload`**       | Fetches high-priority resource _now_.          | For critical LCP images, fonts, and early CSS.        |
| **`prefetch`**      | Fetches low-priority resource for _next_ page. | For predicting the user's next navigation.            |
| **`fetchpriority`** | Adjusts relative priority of a resource.       | Prioritize LCP image; Deprioritize off-screen images. |

---

## Compression & Delivery

Optimizing payload size is critical for reducing transfer time and bandwidth usage.

### 1. Gzip vs. Brotli

| Feature             | Gzip (DEFLATE)                           | Brotli (br)                                |
| :------------------ | :--------------------------------------- | :----------------------------------------- |
| **Standard**        | Established (RFC 1952)                   | Modern (RFC 7932)                          |
| **Performance**     | Fast compression, standard ratio         | Superior compression ratio (15-25% better) |
| **Browser Support** | Universal                                | All modern browsers (requires HTTPS)       |
| **Best For**        | Legacy support, fast dynamic compression | Text assets (HTML, JS, CSS, SVG)           |

- **Brotli (br):** A modern compression algorithm that uses a dictionary of common web strings (HTML tags, common JS keywords). It is more CPU-intensive to compress at high levels but offers much smaller file sizes and fast decompression.
- **Gzip:** The industry standard for decades. While Brotli is superior for most web content, Gzip remains a critical fallback for older browsers and is often faster for on-the-fly compression of dynamic responses.

### 2. Implementation & Delivery

- **Negotiation:** The browser sends `Accept-Encoding: gzip, deflate, br`. The server responds with `Content-Encoding: br` if it supports Brotli, otherwise falls back to Gzip.
- **Static vs. Dynamic:**
  - **Static Assets:** Should be pre-compressed (e.g., at build time) using maximum Brotli compression (level 11).
  - **Dynamic Content:** Usually compressed on-the-fly at lower levels (e.g., Brotli level 4 or Gzip level 6) to balance CPU overhead and latency.
- **Edge Compression:** Modern CDNs (like Cloudflare) can automatically compress assets at the edge, serving Brotli to supported browsers even if the origin only supports Gzip.
- **Early Hints (103):** Allows the server to tell the browser about critical resources (CSS/JS) before the full HTML response is even generated.

---

## 💾 Caching Strategies

Caching is the most effective way to improve performance by avoiding the network entirely for subsequent requests.

### 1. HTTP Caching (Cache-Control)

Controlled via response headers to dictate how and for how long the browser and intermediate caches (CDNs) should store resources.

- **`max-age=N`:** Specifies the time in seconds the resource is considered fresh.
- **`immutable`:** Indicates the resource will never change. Used with hashed filenames (e.g., `style.a1b2.css`) to avoid revalidation.
- **`no-cache`:** Forces the browser to revalidate with the server (`ETag`) before using the cached version.
- **`no-store`:** Prevents any caching of the resource (useful for sensitive data).
- **`stale-while-revalidate`:** Allows the browser to use a stale resource while fetching a fresh one in the background.

### 2. Service Worker Caching

A programmable proxy between the browser and the network, allowing for fine-grained control over caching logic.

- **Pre-caching:** Downloading critical assets during the Service Worker installation phase.
- **Runtime Caching:** Intercepting network requests and applying strategies like:
  - **Cache First:** Use cache if available, fallback to network.
  - **Network First:** Try network, fallback to cache (ideal for dynamic data).
  - **Stale-While-Revalidate:** Serve from cache, update in background.
- **Offline Support:** Enables the application to function without an internet connection by serving cached shells and data.

---

## Key Topics Summary

- **Content Delivery Networks:** Reducing TTFB by moving data to the edge (PoPs).
- **Modern Image Pipelines:** Automatic conversion (AVIF/WebP) and dynamic resizing at the CDN Edge.
- **Resource Hints:** Strategically using `dns-prefetch`, `preconnect`, and `preload` to prioritize critical path resources.

---

## Senior/Staff Level "Grill" Questions

### Q1: What is "TCP Slow Start" and how does it affect initial page load?

> **Answer:** TCP doesn't send data at full speed immediately. It starts with a small "congestion window" (CWND, usually 10 segments or ~14KB) and doubles it for every successful acknowledgment. Keep "Above-the-fold" critical CSS under 14KB to fit in the first round-trip.

### Q2: Explain "Domain Sharding" and why it's an anti-pattern in HTTP/2+.

> **Answer:** In H/2 and H/3, this is harmful because it forces multiple DNS lookups and TLS handshakes, breaking the efficiency of multiplexing over a single connection.

### Q3: How do "103 Early Hints" differ from "HTTP/2 Server Push"?

> **Answer:** Server Push is often wasted bandwidth if the browser already had assets in cache. Early Hints lets the browser decide whether to fetch based on its own cache state.

### Q4: When would `preconnect` be "harmful" to performance?

> **Answer:** Every `preconnect` consumes CPU and memory for the handshake. If you preconnect to 10 different origins that aren't critical for the initial paint, you are "stealing" bandwidth and main-thread time from the resources that actually matter for LCP.
