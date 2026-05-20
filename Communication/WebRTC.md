# WebRTC: Peer-to-Peer Real-Time Communication

WebRTC (Web Real-Time Communication) allows for direct, peer-to-peer (P2P) audio, video, and data streaming between browsers without needing an intermediary server for the actual data flow.

---

## 🗺️ WebRTC Architecture

```mermaid
sequenceDiagram
    participant Peer A
    participant SignalingServer
    participant Peer B
    participant STUN/TURN

    Note over Peer A,Peer B: 1. Signaling (Exchange Metadata)
    Peer A->>SignalingServer: Offer (SDP)
    SignalingServer->>Peer B: Offer (SDP)
    Peer B->>SignalingServer: Answer (SDP)
    SignalingServer->>Peer A: Answer (SDP)

    Note over Peer A,Peer B: 2. ICE Candidate Exchange
    Peer A->>STUN/TURN: Who am I? (IP Discovery)
    STUN/TURN-->>Peer A: Public IP:Port
    Peer A->>SignalingServer: Here are my ICE Candidates
    SignalingServer->>Peer B: Peer A's ICE Candidates

    Note over Peer A,Peer B: 3. Direct P2P Connection
    Peer A<-->>Peer B: DTLS/SCTP Data Stream
```

---

## 🏛️ Core Building Blocks

### 1. Signaling (The Handshake)

WebRTC does **not** specify a signaling protocol. You must use a separate channel (WebSockets, SSE, or REST) to exchange "Offers," "Answers," and "ICE Candidates."

### 2. SDP (Session Description Protocol)

A text format describing the media capabilities of a peer (e.g., "I support VP8 video and Opus audio").

### 3. ICE (Interactive Connectivity Establishment)

A framework for finding the best way for two peers to connect (Direct IP, mapped IP, or relay).

### 4. STUN & TURN Servers

- **STUN (Session Traversal Utilities for NAT):** Tells a peer its public IP address. (Used in 80% of cases).
- **TURN (Traversal Using Relays around NAT):** If a direct P2P connection fails (due to symmetric NAT/Firewalls), the data is relayed through a TURN server. **(Expensive, last resort).**

---

## 🔥 Senior/Staff Level "Grill" Questions

### Q1: Why is WebRTC "harder" to scale than WebSockets?

> **Answer:** WebSockets scale by adding more servers (horizontal scaling). WebRTC's complexity comes from **Signaling Overhead** and **Network Topology**.
>
> - **The Scaling Problem:** In a P2P mesh, if you have 10 users in a call, each user must upload their video 9 times (**Mesh Architecture**). This kills mobile battery and bandwidth.
> - **The Staff Solution:** Use an **SFU (Selective Forwarding Unit)**. Peers send video once to the server, and the server forwards it to others. This changes P2P to a "Star" topology but keeps the low-latency benefits.

### Q2: Explain the security model of WebRTC.

> **Answer:**
>
> 1. **Mandatory Encryption:** All WebRTC media/data is encrypted using **DTLS** (Datagram TLS) and **SRTP** (Secure Real-time Transport Protocol). You cannot disable it.
> 2. **Sandboxing:** WebRTC runs in the browser sandbox and requires explicit user permission to access camera/microphone.
> 3. **IP Leakage:** Because WebRTC needs your public IP to connect P2P, it can leak your real IP even behind a VPN. This is mitigated by using **mDNS** for local IPs.

### Q3: TCP vs UDP - Why does WebRTC use UDP?

> **Answer:** Real-time media (audio/video) prioritizes **Timeliness** over **Reliability**.
>
> - **The Problem with TCP:** If a packet is lost, TCP stops the entire stream to retransmit it (Head-of-Line Blocking), causing a "freeze" in the video.
> - **The UDP Advantage:** If a packet is lost, WebRTC just skips it. A tiny glitch in audio is better than a 2-second delay.

---

## 📈 Decision Matrix: WebRTC vs. WebSockets

| Feature      | WebSockets                          | WebRTC                               |
| :----------- | :---------------------------------- | :----------------------------------- |
| **Topology** | Client-Server                       | Peer-to-Peer (or SFU/MCU)            |
| **Protocol** | TCP                                 | UDP (usually)                        |
| **Best For** | Chat, Stock tickers, Notifications. | Video/Audio calls, P2P file sharing. |
| **Latency**  | Low (tens of ms)                    | Ultra-low (sub-ms P2P)               |
