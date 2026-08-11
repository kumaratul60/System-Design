# 🎯 Master System Design & LLD Problem Bank

> **Target Role:** Principal / Staff Architect / Senior LLD & HLD Engineers
> **Framework:** Standardized 9-Step Breakdown (FR, NFR & Scale Estimates, Tech Stack Justifications, Visual UML Diagrams, OOP & SOLID Mapping, Design Patterns Selection, Production Code Blueprints, Trade-offs & Bottlenecks, and Collapsed Grill Q&A).
> **Navigation:** ⬅️ [Back to Master Index](../README.md) | 📅 [8-Week Roadmap](../ROADMAP.md) | 🔍 [Domain Search Architecture Guide](./DOMAIN-SEARCH-COMPARISON.md)

---

## ⚖️ LLD vs HLD Architectural Comparison Matrix

| Area / Dimension    | 🏗️ Low-Level Design (LLD)                 | 🌐 High-Level Design (HLD)                       |
| :------------------ | :---------------------------------------- | :----------------------------------------------- |
| **Scope**           | **Code** & Module Internals               | **System** & Network Boundaries                  |
| **Level**           | **Micro** (Classes, Methods, Interfaces)  | **Macro** (Services, Databases, Queues)          |
| **Output**          | **Classes, APIs**, UML, State Machines    | **Architecture Diagrams**, Protocols, Specs      |
| **Concern**         | **Maintainability**, Extensibility, SOLID | **Scalability**, Availability ($99.999\%$), SLAs |
| **Example**         | `class Cache<K, V>`, `interface Strategy` | **Redis Cluster**, Sharded Postgres, Kafka       |
| **Key Metrics**     | Cyclomatic complexity, Test coverage      | QPS (Queries/Sec), $P_{99}$ Latency, Storage RAM |
| **Target Audience** | Software Engineers, Peer Developers       | Staff/Principal Architects, Security & SRE Leads |

---

## 🧭 Category 1: 🎮 Games & Puzzles (4 Master Problems)

👉 **[View Games & Puzzles Category Index](./Games%20&%20Puzzles/README.md)**

|  #  | Problem Blueprint                   |  Level   | Key System & LLD Challenges                                                                  |                                Master Blueprint Link                                 |
| :-: | :---------------------------------- | :------: | :------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------: |
|  1  | 📖 **Design Tic Tac Toe**           |  `Easy`  | $O(1)$ Turn & Win Verification, Strategy Pattern, Command Undo/Redo                          |      [01-Design-Tic-Tac-Toe.md](./Games%20&%20Puzzles/01-Design-Tic-Tac-Toe.md)      |
|  2  | 📖 **Design Snake and Ladder Game** |  `Easy`  | Graph Cycle Detection (Snake/Ladder Validation), Dice Strategy, Sequential Turn Queue        | [02-Design-Snake-and-Ladder.md](./Games%20&%20Puzzles/02-Design-Snake-and-Ladder.md) |
|  3  | 📖 **Design Minesweeper Game**      | `Medium` | Deferred Safe First Click, BFS/DFS Zero-Neighbor Cascade Reveal, Grid State Machine          |      [03-Design-Minesweeper.md](./Games%20&%20Puzzles/03-Design-Minesweeper.md)      |
|  4  | 📖 **Design Chess Game**            |  `Hard`  | Polymorphic Piece Movement Rules, Check/Checkmate/Stalemate Detection, Castling & En Passant |       [04-Design-Chess-Game.md](./Games%20&%20Puzzles/04-Design-Chess-Game.md)       |

---

## 🧭 Category 2: 🌿 Data Structures & Search (11 Master Problems)

👉 **[View Data Structures & Search Category Index](./Data%20Structures%20&%20Search/README.md)**

|  #  | Problem Blueprint                              |  Level   | Key System & LLD Challenges                                                                 |                                                     Master Blueprint Link                                                     |
| :-: | :--------------------------------------------- | :------: | :------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------: |
|  1  | 📖 **Design LRU Cache**                        |  `Easy`  | $O(1)$ Hash + Doubly LinkedList Eviction, Lock Partitioning, TTL Expiration                 |                       [01-Design-LRU-Cache.md](./Data%20Structures%20&%20Search/01-Design-LRU-Cache.md)                       |
|  2  | 📖 **Design Bloom Filter**                     |  `Easy`  | Bit Vector Allocation, Kirsch-Mitzenmacher Hashing, 0% False Negatives                      |                    [02-Design-Bloom-Filter.md](./Data%20Structures%20&%20Search/02-Design-Bloom-Filter.md)                    |
|  3  | 📖 **Design Search Autocomplete System**       |  `Easy`  | Trie (Prefix Tree), Pre-computed Top-K Suggestion Nodes, Sub-20ms Keystroke Latency         |             [03-Design-Search-Autocomplete.md](./Data%20Structures%20&%20Search/03-Design-Search-Autocomplete.md)             |
|  4  | 📖 **Design Simple Search Engine**             | `Medium` | Inverted Index Posting Lists, TF-IDF Relevance Ranking, Tokenization & Stemming             |            [04-Design-Simple-Search-Engine.md](./Data%20Structures%20&%20Search/04-Design-Simple-Search-Engine.md)            |
|  5  | 📖 **Design LFU Cache**                        |  `Hard`  | $O(1)$ Min-Frequency Hash Map + Doubly LinkedList Eviction Buckets                          |                       [05-Design-LFU-Cache.md](./Data%20Structures%20&%20Search/05-Design-LFU-Cache.md)                       |
|  6  | 📖 **Design Trie with Fuzzy Search**           | `Medium` | Wildcard `.` Search & Levenshtein Edit Distance Backtracking                                |               [06-Design-Trie-Fuzzy-Search.md](./Data%20Structures%20&%20Search/06-Design-Trie-Fuzzy-Search.md)               |
|  7  | 📖 **Design Streaming Median Finder**          |  `Hard`  | Two-Heap Balance Strategy (MaxHeap Lower, MinHeap Upper), $O(1)$ Median Lookup              |         [07-Design-Streaming-Median-Finder.md](./Data%20Structures%20&%20Search/07-Design-Streaming-Median-Finder.md)         |
|  8  | 📖 **Design Consistent Hash Ring**             | `Medium` | Virtual Nodes Distribution, Binary Search Ring Token Lookup, Minimal Resharding             |            [08-Design-Consistent-Hash-Ring.md](./Data%20Structures%20&%20Search/08-Design-Consistent-Hash-Ring.md)            |
|  9  | 📖 **Design Segment Tree & BIT**               |  `Hard`  | Range Minimum/Sum Queries, $O(\log N)$ Point Updates & Range Aggregations                   |                [09-Design-Segment-Tree-BIT.md](./Data%20Structures%20&%20Search/09-Design-Segment-Tree-BIT.md)                |
| 10  | 📖 **Design Skiplist Data Structure**          | `Medium` | Probabilistic Multi-level Tower LinkedList, $O(\log N)$ Operations Without Tree Rebalancing |                        [10-Design-Skiplist.md](./Data%20Structures%20&%20Search/10-Design-Skiplist.md)                        |
| 11  | 📖 **Design Concurrent Lock-Free Ring Buffer** |  `Hard`  | Atomic CAS Sequence Pointers, Memory Barriers, LMAX Disruptor Pattern                       | [11-Design-Concurrent-Lockfree-Ring-Buffer.md](./Data%20Structures%20&%20Search/11-Design-Concurrent-Lockfree-Ring-Buffer.md) |

---

## 🧭 Category 3: 🤖 Managing States (5 Master Problems)

👉 **[View Managing States Category Index](./Managing%20States/README.md)**

|  #  | Problem Blueprint                    |  Level   | Key System & LLD Challenges                                                              |                                     Master Blueprint Link                                      |
| :-: | :----------------------------------- | :------: | :--------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------: |
|  1  | 📖 **Design ATM**                    | `Medium` | Finite State Machine, Chain of Responsibility (Note Dispenser), Hardware Locks           |                    [01-Design-ATM.md](./Managing%20States/01-Design-ATM.md)                    |
|  2  | 📖 **Design Vending Machine**        | `Medium` | State Pattern (HasCoin, SoldOut), Inventory Rack Allocation, Greedy Balance Return       |        [02-Design-Vending-Machine.md](./Managing%20States/02-Design-Vending-Machine.md)        |
|  3  | 📖 **Design Elevator System**        | `Medium` | LOOK / SCAN Seek Dispatching, Directional Car State Machine, Observer Indicators         |        [03-Design-Elevator-System.md](./Managing%20States/03-Design-Elevator-System.md)        |
|  4  | 📖 **Design Traffic Control System** | `Medium` | 4-Way Intersection Signal States, Emergency Vehicle Sensor Overrides, Pedestrian Timers  | [04-Design-Traffic-Control-System.md](./Managing%20States/04-Design-Traffic-Control-System.md) |
|  5  | 📖 **Design Coffee Vending Machine** |  `Hard`  | Decorator Pattern Customization, Multi-boiler State Machine, Ingredient Threshold Alerts | [05-Design-Coffee-Vending-Machine.md](./Managing%20States/05-Design-Coffee-Vending-Machine.md) |

---

## 🧭 Category 4: 🏢 Management Systems (5 Master Problems)

👉 **[View Management Systems Category Index](./Management%20Systems/README.md)**

|  #  | Problem Blueprint                          |  Level   | Key System & LLD Challenges                                                               |                                             Master Blueprint Link                                             |
| :-: | :----------------------------------------- | :------: | :---------------------------------------------------------------------------------------- | :-----------------------------------------------------------------------------------------------------------: |
|  1  | 📖 **Design Parking Lot**                  |  `Easy`  | Multi-level Spot Allocation Strategy, Vehicle Size Polymorphism, Dynamic Billing          |                  [01-Design-Parking-Lot.md](./Management%20Systems/01-Design-Parking-Lot.md)                  |
|  2  | 📖 **Design Task Management System**       |  `Easy`  | Priority Queue Filters, Kanban State Machine, Audit Activity Stream                       |       [02-Design-Task-Management-System.md](./Management%20Systems/02-Design-Task-Management-System.md)       |
|  3  | 📖 **Design Inventory Management System**  | `Medium` | SKU Reorder Thresholds, Multi-Warehouse Stock Allocation, Low-Stock Observers             |  [03-Design-Inventory-Management-System.md](./Management%20Systems/03-Design-Inventory-Management-System.md)  |
|  4  | 📖 **Design Library Management System**    | `Medium` | Book ISBN Indexing, Member Overdue Fine Strategy, Reservation FIFO Queues                 |    [04-Design-Library-Management-System.md](./Management%20Systems/04-Design-Library-Management-System.md)    |
|  5  | 📖 **Design Restaurant Management System** |  `Hard`  | Kitchen Order Ticket (KOT) State Machine, Table Reservation Engine, Decorator Customizers | [05-Design-Restaurant-Management-System.md](./Management%20Systems/05-Design-Restaurant-Management-System.md) |

---

## 🧭 Category 5: 💬 Communication & Messaging (3 Master Problems)

👉 **[View Communication & Messaging Category Index](./Communication%20&%20Messaging/README.md)**

|  #  | Problem Blueprint                 |  Level   | Key System & LLD Challenges                                                                 |                                        Master Blueprint Link                                         |
| :-: | :-------------------------------- | :------: | :------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------: |
|  1  | 📖 **Design Notification System** |  `Easy`  | Multi-Channel Gateway (Email/SMS/Push), Template Renderer, Provider Fallback Strategy       | [01-Design-Notification-System.md](./Communication%20&%20Messaging/01-Design-Notification-System.md) |
|  2  | 📖 **Design Pub Sub System**      | `Medium` | Topic Broker, Consumer Group Offsets, Fan-out Message Queue                                 |      [02-Design-Pub-Sub-System.md](./Communication%20&%20Messaging/02-Design-Pub-Sub-System.md)      |
|  3  | 📖 **Design Chat Application**    | `Medium` | WebSocket Session Gateway, Message Delivery Receipts (Sent/Delivered/Read), Presence Engine |    [03-Design-Chat-Application.md](./Communication%20&%20Messaging/03-Design-Chat-Application.md)    |

---

## 🧭 Category 6: 💲 Financial & Payment Systems (3 Master Problems)

👉 **[View Financial & Payment Systems Category Index](./Financial%20&%20Payment%20Systems/README.md)**

|  #  | Problem Blueprint                   |  Level   | Key System & LLD Challenges                                                                |                                            Master Blueprint Link                                             |
| :-: | :---------------------------------- | :------: | :----------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------: |
|  1  | 📖 **Design Splitwise**             | `Medium` | Minimum Cash Flow Graph Simplification Algorithm, Equal/Exact/Percentage Split Strategies  |             [01-Design-Splitwise.md](./Financial%20&%20Payment%20Systems/01-Design-Splitwise.md)             |
|  2  | 📖 **Design Payment Gateway**       | `Medium` | Idempotency Keys, PSP Provider Routing, Saga Distributed Transaction Rollbacks             |       [02-Design-Payment-Gateway.md](./Financial%20&%20Payment%20Systems/02-Design-Payment-Gateway.md)       |
|  3  | 📖 **Design Online Stock Exchange** |  `Hard`  | Low-Latency Order Book Matching Engine (Bids Max-Heap, Asks Min-Heap), Limit/Market Orders | [03-Design-Online-Stock-Exchange.md](./Financial%20&%20Payment%20Systems/03-Design-Online-Stock-Exchange.md) |

---

## 🧭 Category 7: 🛍️ E-commerce & Booking Systems (9 Master Problems)

👉 **[View E-commerce & Booking Systems Category Index](./E-commerce%20&%20Booking%20Systems/README.md)**

|  #  | Problem Blueprint                          |  Level   | Key System & LLD Challenges                                                                        |                                                    Master Blueprint Link                                                    |
| :-: | :----------------------------------------- | :------: | :------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------: |
|  1  | 📖 **Design Amazon**                       |  `Hard`  | Catalog Search Index, Distributed Inventory Reservation, Saga Transaction Orchestrator             |                       [01-Design-Amazon.md](./E-commerce%20&%20Booking%20Systems/01-Design-Amazon.md)                       |
|  2  | 📖 **Design Movie Booking System**         |  `Hard`  | 10-Min Temporary Seat Lock in Redis, Seat Map Concurrency, Double-Booking Guard                    |         [02-Design-Movie-Booking-System.md](./E-commerce%20&%20Booking%20Systems/02-Design-Movie-Booking-System.md)         |
|  3  | 📖 **Design Online Auction System**        |  `Hard`  | Atomic Highest-Bid Processing, Proxy Bidding Engine, Live Price WebSocket Stream                   |        [03-Design-Online-Auction-System.md](./E-commerce%20&%20Booking%20Systems/03-Design-Online-Auction-System.md)        |
|  4  | 📖 **Design Online Food Delivery Service** |  `Hard`  | Geospatial Driver Matching (QuadTree/H3), Order State Machine, Dynamic ETA Route Estimation        | [04-Design-Online-Food-Delivery-Service.md](./E-commerce%20&%20Booking%20Systems/04-Design-Online-Food-Delivery-Service.md) |
|  5  | 📖 **Design Ride Hailing Service**         |  `Hard`  | Spatial Driver Indexing (Geohash), Dynamic Surge Pricing Strategy, Trip State Machine              |         [05-Design-Ride-Hailing-Service.md](./E-commerce%20&%20Booking%20Systems/05-Design-Ride-Hailing-Service.md)         |
|  6  | 📖 **Design Amazon Locker**                | `Medium` | Locker Size Matching Algorithm (S/M/L/XL), 6-Digit OTP Validation, 7-Day Expiration Return Trigger |                [06-Design-Amazon-Locker.md](./E-commerce%20&%20Booking%20Systems/06-Design-Amazon-Locker.md)                |
|  7  | 📖 **Design Shopping Cart**                | `Medium` | Decorator Pattern Coupon Discounts, Quantity Calculator, Guest to Auth Cart Merge                  |                [07-Design-Shopping-Cart.md](./E-commerce%20&%20Booking%20Systems/07-Design-Shopping-Cart.md)                |
|  8  | 📖 **Design Car Rental System**            |  `Hard`  | Date-Range Overlap Checker, Add-On Options Decorator (GPS/Child Seat), Damage Deposit Holds        |            [08-Design-Car-Rental-System.md](./E-commerce%20&%20Booking%20Systems/08-Design-Car-Rental-System.md)            |
|  9  | 📖 **Design Meeting Scheduler**            |  `Hard`  | Interval Tree Overlap Detection, Room Capacity Reservation, Recurrence Expansion                   |            [09-Design-Meeting-Scheduler.md](./E-commerce%20&%20Booking%20Systems/09-Design-Meeting-Scheduler.md)            |

---

## 🧭 Category 8: ⚙️ Developer Tools & Infrastructure (8 Master Problems)

👉 **[View Developer Tools & Infrastructure Category Index](./Developer%20Tools%20&%20Infrastructure/README.md)**

|  #  | Problem Blueprint                                |  Level   | Key System & LLD Challenges                                                                  |                                                          Master Blueprint Link                                                          |
| :-: | :----------------------------------------------- | :------: | :------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------: |
|  1  | 📖 **Design URL Shortener**                      | `Medium` | Base62 Key Encoding, Key Generation Service (KGS), 301 vs 302 Redirection, Hot Cache         |                    [01-Design-URL-Shortener.md](./Developer%20Tools%20&%20Infrastructure/01-Design-URL-Shortener.md)                    |
|  2  | 📖 **Design Logging Framework**                  | `Medium` | Severity Log Level Filter, Chain of Responsibility Appenders, Async Non-blocking Ring Buffer |                [02-Design-Logging-Framework.md](./Developer%20Tools%20&%20Infrastructure/02-Design-Logging-Framework.md)                |
|  3  | 📖 **Design Rate Limiter**                       | `Medium` | Token Bucket & Sliding Window Log Algorithms, Sub-1ms Latency, Redis Lua Scripts             |                     [03-Design-Rate-Limiter.md](./Developer%20Tools%20&%20Infrastructure/03-Design-Rate-Limiter.md)                     |
|  4  | 📖 **Design In Memory File System**              |  `Hard`  | Composite Pattern (Directory Tree & Files), Path Traversal Parser, Unix VFS Methods          |            [04-Design-In-Memory-File-System.md](./Developer%20Tools%20&%20Infrastructure/04-Design-In-Memory-File-System.md)            |
|  5  | 📖 **Design Version Control System**             |  `Hard`  | Content-Addressable Object Store (Blob, Tree, Commit), DAG History, Branch Pointer Head      |           [05-Design-Version-Control-System.md](./Developer%20Tools%20&%20Infrastructure/05-Design-Version-Control-System.md)           |
|  6  | 📖 **Design Task Scheduler**                     |  `Hard`  | Min-Heap / DelayQueue Priority Queue, Cron Expression Parser, Worker Thread Pool Execution   |                   [06-Design-Task-Scheduler.md](./Developer%20Tools%20&%20Infrastructure/06-Design-Task-Scheduler.md)                   |
|  7  | 📖 **Design Google Docs / Collaborative Editor** |  `Hard`  | Operational Transformation (OT) vs CRDTs, WebSocket Character Synchronization, Vector Clocks | [07-Design-Google-Docs-Collaborative-Editor.md](./Developer%20Tools%20&%20Infrastructure/07-Design-Google-Docs-Collaborative-Editor.md) |
|  8  | 📖 **Design Distributed Key-Value Store**        |  `Hard`  | Consistent Hashing Ring, Tunable Quorum ($R + W > N$), Vector Clocks, Hinted Handoff         |      [08-Design-Distributed-Key-Value-Store.md](./Developer%20Tools%20&%20Infrastructure/08-Design-Distributed-Key-Value-Store.md)      |

---

## 🧭 Category 9: 📱 Social & Content Platforms (7 Master Problems)

👉 **[View Social & Content Platforms Category Index](./Social%20&%20Content%20Platforms/README.md)**

|  #  | Problem Blueprint                         |  Level   | Key System Challenges                                                                              |                                          Master Guide Link                                          |
| :-: | :---------------------------------------- | :------: | :------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------: |
|  1  | 📖 **Design Stack Overflow**              | `Medium` | Q&A Voting, Reputation Engine, Search Indexing, Tagging                                            |    [01-Design-Stack-Overflow.md](./Social%20&%20Content%20Platforms/01-Design-Stack-Overflow.md)    |
|  2  | 📖 **Design a Social Network**            | `Medium` | News Feed Generation (Push vs Pull), Social Graph, Like/Comment Fan-out                            |    [02-Design-Social-Network.md](./Social%20&%20Content%20Platforms/02-Design-Social-Network.md)    |
|  3  | 📖 **Design Learning Platform**           | `Medium` | Video Chunk Streaming, Course Progress Tracking, Quiz Engine, Certificate Minting                  | [03-Design-Learning-Platform.md](./Social%20&%20Content%20Platforms/03-Design-Learning-Platform.md) |
|  4  | 📖 **Design Cricinfo**                    |  `Hard`  | Sub-second Live Ball-by-Ball Score Broadcasting, Websocket Fan-out, Thundering Herd                |          [04-Design-Cricinfo.md](./Social%20&%20Content%20Platforms/04-Design-Cricinfo.md)          |
|  5  | 📖 **Design LinkedIn**                    |  `Hard`  | 2nd/3rd Degree Connection Graph, Job Search Indexing, Feed Ranking                                 |          [05-Design-LinkedIn.md](./Social%20&%20Content%20Platforms/05-Design-LinkedIn.md)          |
|  6  | 📖 **Design Spotify**                     |  `Hard`  | Low-latency Audio Chunking/Caching, Offline PWA Playback, Collaborative Playlists                  |           [06-Design-Spotify.md](./Social%20&%20Content%20Platforms/06-Design-Spotify.md)           |
|  7  | 📖 **Design X (Twitter) & Trends Engine** |  `Hard`  | Hybrid Timeline Fan-out (Celebrity Push/Pull), Count-Min Sketch Heavy Hitters for Real-time Trends |  [07-Design-X-Twitter-Trends.md](./Social%20&%20Content%20Platforms/07-Design-X-Twitter-Trends.md)  |

---

## 📐 Standardized 9-Step Problem Breakdown Framework

Every problem blueprint strictly adheres to this 9-step architect breakdown:

```mermaid
flowchart TD
    Step1[1. Functional Requirements FR] --> Step2[2. Non-Functional Requirements NFR & Scale]
    Step2 --> Step3[3. Tech Stack & Architectural Justifications]
    Step3 --> Step4[4. Visual UML Diagrams: Class, Sequence & Component]
    Step4 --> Step5[5. OOP & SOLID Principles Mapping]
    Step5 --> Step6[6. Design Patterns Selection]
    Step6 --> Step7[7. Production Code Blueprints: FE & BE]
    Step7 --> Step8[8. Trade-offs, Edge Cases & Scale Bottlenecks]
    Step8 --> Step9[9. Collapsed Interviewer Grill Q&A]
```
