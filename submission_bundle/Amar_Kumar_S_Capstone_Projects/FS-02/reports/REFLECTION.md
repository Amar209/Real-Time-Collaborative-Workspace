# Capstone Engineering Reflection
## Project FS-02: Real-Time Collaborative Workspace
**Intern Name**: Amar Kumar S  
**Specialization**: Full-Stack Development  
**Submission Folder**: `Amar_Kumar_S_Capstone_Projects/FS-02/`

---

## 1. Executive Summary & Personal Ownership
During this capstone, I owned the end-to-end design, implementation, testing, and deployment of a full-stack real-time collaborative workspace. I was responsible for:
* Architecting the monorepo structure separating the Next.js client from the WebSocket sync server.
* Integrating the **Yjs CRDT** data structures with **TipTap (ProseMirror)** to eliminate concurrency conflicts without server locks.
* Implementing live multiplayer presence (remote cursor carets, selection highlights, active user avatars).
* Building the Redis Pub/Sub scaling adapter for multi-instance WebSocket synchronization.
* Designing the Prisma database schema and implementing authentication, permissions, comments, and version snapshots.
* Creating an automated stress-testing testbed with Project Gutenberg literature to validate convergence and latency under heavy concurrency.

---

## 2. Key Learnings & Technical Revelations

### Understanding Distributed State: CRDTs vs. Operational Transformation
Before this project, I viewed real-time collaboration as simply "broadcasting WebSocket messages on keypress." Through implementing Yjs, I learned why naive message broadcasting fails in distributed systems due to network jitter, out-of-order packets, and simultaneous typing. 

Studying how Yjs represents documents as a doubly-linked list of items with unique `(clientID, clock)` coordinates gave me a profound appreciation for mathematical convergence. The fact that CRDT operations are commutative and associative means that network ordering issues disappear entirely—the system always converges to the identical document state.

### Ephemeral State vs. Persistent State
A crucial architectural decision was separating **ephemeral presence** from **persistent document data**:
* Document edits belong in the persistent CRDT state vector and must be backed up to the database.
* Cursors, carets, and online avatars belong in the lightweight `y-protocols/awareness` dictionary. Transmitting presence via ephemeral in-memory broadcasts saved thousands of unnecessary database writes and eliminated latency bottlenecks.

### Real-World Scaling with Redis Pub/Sub
Single-node applications cannot scale to enterprise workloads. By implementing a Redis Pub/Sub adapter, I experienced firsthand how decoupled WebSocket server instances can seamlessly communicate across a shared message bus, enabling horizontal scaling without clients losing synchronization.

---

## 3. Major Obstacles Encountered & Solutions

| Obstacle | Root Cause | Solution Implemented |
| :--- | :--- | :--- |
| **Duplicate WebSocket Connections** | React Strict Mode in development double-mounts effects, creating ghost cursors. | Disabled React Strict Mode for the editor view and implemented clean provider teardown in `useEffect` cleanup. |
| **High Database Load During Rapid Typing** | Writing to the database on every single keystroke causes I/O thrashing. | Designed a debounced binary persistence layer that buffers changes in-memory and flushes compressed `Uint8Array` state vectors every 2 seconds. |
| **Database Environment Flexibility** | Evaluators or developer machines may not have local PostgreSQL or Redis installed. | Created a unified Prisma schema supporting zero-setup local SQLite fallback and production PostgreSQL, alongside an in-memory Redis fallback. |

---

## 4. Conclusion & Professional Impact
This project transformed my understanding of full-stack engineering from basic CRUD applications to complex, event-driven distributed systems. Successfully building a Notion/Figma-grade multiplayer collaborative tool equipped me with the technical depth and problem-solving mindset necessary for top-tier engineering roles.
