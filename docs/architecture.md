# Offline-First Architecture (Enterprise)

**Purpose:** Single-source reference for designing, building, and operating offline-first capabilities across web, mobile, and desktop surfaces at enterprise scale. Tailored for LithiumBuy Enterprise but vendor/framework agnostic.

---

## Objectives
- Preserve core workflows when disconnected; fail safe with no data loss.
- Deliver fast perceived performance with optimistic UX and background sync.
- Guarantee consistency and auditability through ordered, idempotent mutations.
- Reduce operational risk with clear observability, rollback, and support paths.

## Guiding Principles
- **Local-first UX:** Reads prefer local cache; writes enqueue locally first.
- **Deterministic sync:** All mutations are idempotent, ordered, and replayable.
- **Conflict transparency:** Detect, auto-resolve when safe, surface when not.
- **Progressive resilience:** Degrade gracefully (read-only, limited features) before failing.
- **Security-first:** Strong auth, encryption at rest/in-transit, least privilege even offline.

## Reference Architecture (Textual)
- **Client app (Web/PWA/Mobile/Desktop):**
  - Local data store (IndexedDB/SQLite/Room/CoreData) + normalized cache.
  - Service Worker (web) for request interception, offline shell, Background Sync/Periodic Sync.
  - Write-ahead log (WAL) / action queue with retry/backoff and dedupe.
  - Optimistic UI with rollback hooks; feature flags to toggle offline scope.
- **Peer/edge mesh (optional for field/branch use-cases):**
  - Local node registry with peer discovery (mDNS/Bluetooth/mesh SDK/relay).
  - Gossip or pub/sub for presence and intent metadata; constrain payloads to summaries + bloom filters for changed keys.
  - Opportunistic sync between peers using CRDT-friendly envelopes and signed ops; bounded history and rate limits to prevent battery/CPU drain.
  - Conflict policy aligns with primary sync rules; server remains source of truth, but peers shorten time-to-freshness when infra is distant.
- **Sync engine (shared logic where possible):**
  - Pull: `changes?since=<cursor>` delta feed; supports pagination and compression.
  - Push: batched mutation envelope with client id, operation id, logical timestamp, and checksum.
  - Ordering: vector/lamport clocks or per-collection monotonic counters.
  - Conflict handlers: strategy per domain (LWW, merge, CRDT, or manual review).
- **Backend services:**
  - Sync API + change-log store (append-only event log) and materialized views.
  - Idempotency keys per mutation; at-least-once processing with dedupe table.
  - Webhook or websocket fan-out for near-real-time invalidation (when online).
  - Audit: retention of raw events, conflict decisions, and replay tooling.
- **Observability & Ops:**
  - Metrics: queue depth, sync latency, conflict rate, retry count, drift age.
  - Traces: mutation id across client → sync API → domain services.
  - Alerts: stuck queues, token expiry bursts, >N% conflict rate, long drift.
  - Mesh-specific: peer discoverability rate, hop count distribution, battery/CPU budget, and mesh-to-origin convergence time.

## Core Components & Patterns
- **Local storage:** IndexedDB (web) via Dexie/RxDB/PouchDB; SQLite/Room (Android); Core Data/SQLite (iOS); filesystem/SQLite (desktop).
- **Caching:** App shell + static assets via service worker; runtime caching with stale-while-revalidate; versioned caches on deploy.
- **Action queue:** Persisted WAL of intents; includes schema version, client clock, and idempotency key; retries with jittered exponential backoff.
- **Sync protocol:**
  - **Push:** Batch multiple intents; require server ack with per-intent status.
  - **Pull:** Delta by `since` cursor and optional `compact=true` for snapshotting.
  - **Delta formats:** Patchset or CRDT ops to minimize payloads.
- **Conflict resolution:** Prefer deterministic rules; fall back to guided resolution in UI.
  - Simple: LWW with server clock.
  - Domain-aware merge (field-level precedence, totals recompute).
  - CRDTs (counters, sets, text) when concurrent edits are common.
  - Escalation path: mark record conflicted, surface task to user/support.
- **Identity & security:**
  - Short-lived access tokens with refresh; refresh guarded by device binding.
  - Client-side encryption for sensitive fields (WebCrypto + platform keystore).
  - Server-side RLS/ABAC enforced on sync endpoints; least-privilege scopes.
  - Sign/encrypt mutation envelopes; validate nonces to block replays.
- **Resilience:** Feature flag to disable/limit offline scope; circuit-breaker around sync API; local compaction to prevent storage bloat.
  - Mesh resilience: backoff between peer handshakes; cap concurrent peer sessions; encrypt channel keys per session; fall back to cloud when reachable.

## Platform Notes
- **Web/PWA:** Service Worker + Background Sync/Periodic Sync; IndexedDB via Dexie/RxDB; BroadcastChannel for multi-tab cache coherence; navigator.onLine fallbacks.
- **Mobile:** SQLite/Room (Android), Core Data/SQLite (iOS); background tasks for sync; reachability listeners; deferred deep links queued until online.
- **Desktop (Electron/Tauri):** SQLite/LevelDB; background sync via timers; ensure crash-safe WAL flush.
- **Edge/mesh (future):** Consider libp2p/Yjs/WebRTC for browser; Bluetooth/MDNS for mobile; DTN-style store-and-forward where links are intermittent.

## Web Implementation: React + Dexie (+ React Query)
- **Dexie schema/versioning:** Define DB with per-table primary keys, `updatedAt`, `version`, and soft-delete. Example:
  ```
  import Dexie, { Table } from 'dexie';
  class AppDB extends Dexie {
    todos!: Table<{ id: string; title: string; updatedAt: string; version: number; deleted?: boolean }>;
    wal!: Table<{ opId: string; kind: string; payload: any; createdAt: number; retries: number }>;
  }
  export const db = new AppDB('lbe');
  db.version(1).stores({
    todos: 'id, updatedAt, version, deleted',
    wal: 'opId, kind, createdAt'
  });
  ```
- **Local-first reads:** `useQuery` returns Dexie data first; set generous `staleTime`, background refetch to refresh Dexie and React Query caches.
- **Optimistic writes + WAL:** `useMutation` `onMutate` writes to Dexie and enqueues WAL entry; server sync later clears WAL on ack or increments `retries` with backoff and dedupe on `opId`.
- **Sync loop (simplified):**
  - Pull: `GET /changes?since=cursor`, apply in a Dexie transaction, advance cursor in meta table.
  - Push: batch WAL entries, `POST /mutations`, delete applied ops on success; keep failed ops with reason for UI surfacing.
  - Schedule via service worker `periodicSync` or app focus/online events; throttle to protect battery/CPU.
- **Service worker:** cache app shell + static assets; runtime cache API calls with network-timeout → fallback-to-cache; register background sync to flush WAL.
- **Multi-tab coherence:** BroadcastChannel to notify peers after Dexie writes; tabs invalidate React Query caches accordingly.
- **Error handling:** Map HTTP 409/412 to conflict UI; 401 triggers token refresh; 5xx triggers backoff and circuit-breaker.

## Implementation Checklist
- Data model has stable UUIDs, updated_at, version, and soft-delete markers.
- Define per-collection conflict policy and UX for surfaced conflicts.
- Implement WAL with persisted queue, idempotency keys, and retry policy.
- Optional mesh: peer discovery guarded by consent/policy; signed envelopes; bandwidth/battery budgets defined per platform; cap history shared peer-to-peer.
- Sync API exposes `GET /changes?since=cursor` and `POST /mutations` with batch acks.
- Asset strategy: app shell cached; APIs guarded with network timeout + fallback.
- Telemetry emitted for queue length, conflicts, drift, and token errors.
- Run chaos tests: toggle offline/online, packet loss, partial failures.
- Ensure redaction of PII in logs; encrypt sensitive fields locally.

## Testing & QA
- Unit: queue, backoff, idempotency, conflict resolvers.
- Integration: deterministic replay of captured mutation logs against staging.
- E2E: offline mode flows (airplane), long-running drift, multi-client conflict.
- Load: high-frequency sync, large change feeds, cache upgrade paths.

## Operational Runbooks
- **Stuck queue:** Inspect WAL entries, clear poisoned messages via admin tool, redeploy worker if needed.
- **High conflict rate:** Sample records, adjust merge policy, add field-level CRDTs, or enforce stronger locking.
- **Token churn:** Validate clock skew, shorten refresh reuse window, check device binding.
- **Drift buildup:** Force snapshot sync for clients older than threshold.
- **Mesh instability:** Drop to single-hop mode; reduce broadcast rate; force cloud resync when back online; rotate peer keys.

## Offline-First LLM Enrichment (Directory-Driven)
- **Goal:** Allow users to select/download an OSS/local LLM to enrich data while offline; keep parity when back online.
- **Model directory UX:** Present vetted models with size, license, modality, context length, quant formats (GGUF), and hardware fit (CPU/GPU/NPU). Let users pick and download; cache fingerprints for integrity.
- **Recommended OSS short-list:** Mistral 7B/8x22B, Llama 3.1 8B/70B, Phi-3 Mini, Qwen 2.5 7B/14B, Granite 7B. Offer quantized GGUF (Q4_0/Q6_K) for laptop-class devices.
- **Runtime:** Prefer on-device runners (llama.cpp/llama-rs or WebGPU-backed in browser). Ship a thin inference worker with batching and token budget limits.
- **Data flow:** Local chunking + embedding (e.g., all-MiniLM or in-model embeddings) into local vector store (Dexie + float packing or SQLite/pgvecto.rs on desktop). Retrieval + generation performed locally; no uplink required.
- **Sync & privacy:** Keep embeddings and prompts local unless user opts-in. When back online, sync only source data and hashed doc IDs; never sync raw prompts/responses without consent.
- **Safety:** Enforce model allowlist, integrity checks (SHA256), and per-device sandbox; rate-limit to protect battery/CPU. Expose a kill-switch/feature flag.
- **Alignment with ADRs:** Reuse caching/fetch layer from `docs/ADRs/002-react-query.md`; apply circuit-breaker rules from `docs/ADRs/003-circuit-breaker.md` to model download and inference backends.

## Related ADRs (LithiumBuy)
- `docs/ADRs/001-supabase-choice.md` (backend/data platform)
- `docs/ADRs/002-react-query.md` (client caching & fetch layer)
- `docs/ADRs/005-cache-strategy.md` (cache policy defaults)
- `docs/ADRs/003-circuit-breaker.md` (resilience patterns)
- `docs/ADRs/004-bullmq-queues.md` (server-side queueing/backpressure)
- `docs/ADRs/006-transaction-management.md` (consistency rules)

## Reference Implementations (GitHub)
- PouchDB (Couch-style sync, IndexedDB/LevelDB): https://github.com/pouchdb/pouchdb
- RxDB (RxJS + IndexedDB/SQLite + replication): https://github.com/pubkey/rxdb
- WatermelonDB (mobile SQLite + sync): https://github.com/Nozbe/WatermelonDB
- Dexie (IndexedDB wrapper used here): https://github.com/dexie/Dexie.js
- Apollo/Urql offline queue pattern (GraphQL): https://github.com/awslabs/offline-appsync-sample
- CRDT tooling (Yjs): https://github.com/yjs/yjs
- Phoenix LiveView PWA offline-ready example: https://github.com/dwyl/PWA-Liveview
- SyncKit (local-first/CRDT engine): https://github.com/Dancode-188/synckit
- libp2p (modular p2p stack): https://github.com/libp2p/js-libp2p
- WebRTC datachannels + mesh signaling examples: https://github.com/webrtc/samples
- DAT/Hypercore-like append-only replication: https://github.com/holepunchto/hypercore

## Sources (recent, for further reading)
- Android Offline-First data layer guidance: https://developer.android.com/topic/architecture/data-layer/offline-first
- Service Worker + Background Sync patterns: https://web.dev/offline-cookbook/
- IndexedDB + sync strategies (2025): https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/
- PWA offline strategies (2025): https://www.elysiate.com/blog/progressive-web-apps-offline-first-architecture-2025

---

**Status:** Living document. Update with platform-specific decisions and chosen conflict policies as they are implemented.









