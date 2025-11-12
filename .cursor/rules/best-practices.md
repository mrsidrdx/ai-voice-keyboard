```yaml
# Cursor AI coding guardrails for the AI Voice Keyboard App
version: 1
project_style:
  language: typescript
  framework: nextjs
  package_manager: pnpm
  runtime: node18
  ui: shadcn+tailwind
  db: prisma+postgres
rules:
  - "Prefer bottom-up implementation: start with pure utils, then hooks/services, then components, then screens."
  - "Create small files; keep functions ≤ 50 LOC and cyclomatic complexity ≤ 15."
  - "UI must stay thin: data fetching, transforms, and heavy logic live in server or hooks/service layer."
  - "TypeScript strict mode on. No implicit any. Prefer discriminated unions over enums when feasible."
  - "All external input (HTTP, env, query, params) must be validated with zod before use."
  - "APIs must be idempotent where applicable, paginated by default, and return stable error shapes."
  - "Use React Server Components for data, Client Components only for interactivity."
  - "No component exceeds 200 LOC; split into subcomponents and hooks."
  - "Never access process.env outside server-side modules. Provide typed env via a single validated module."
  - "Audio slicing: 5s slices with 1s overlap, backpressure-aware streaming to server; merge on server."
  - "Security first: parameterized queries, CSRF-safe auth, per-request authorization checks."
  - "Observability: log structured JSON, include requestId and userId on every server log line."
  - "Prohibit premature optimization; measure before tuning. Keep performance budgets documented."
ci_checks:
  - lint
  - typecheck
  - test
  - build
```

---

## 1) Design Philosophy & Modern Minimalist Aesthetics

**Principles**

* **Clarity over decoration**: ruthless reduction of visual noise; favor whitespace.
* **Hierarchy via typography**: 3–4 text sizes max (e.g., 30/20/16/13). Use weight and spacing for emphasis.
* **Consistent rhythm**: 8‑pt spacing system; consistent padding/margins.
* **Motion as feedback**: 150–250ms ease transitions; no gratuitous animations. Motion indicates state changes.
* **Contrast & accessibility**: WCAG 2.1 AA minimum. Provide focus states for all interactive elements.
* **Color discipline**: 1 primary, 1 neutral, 1 semantic set (success/warn/error). Use tints for depth.

**ShadCN + Tailwind Tokens**

* **Typography**: Inter or Geist; `leading-relaxed` for long text, `tracking-tight` for headlines.
* **Color example**: `primary=#2563EB`, `accent=#10B981`, `bg=#0B0B0C (dark)/#F9FAFB (light)`.
* **Elevation**: 2 levels only—flat and subtle shadow (`shadow-sm`/`shadow-md`).

**Micro‑interaction Patterns**

* Buttons: press → 95% scale; hover → subtle lift; disabled → lowered opacity.
* Toasters: top-right; auto-dismiss 2–3s; concise copy.
* Clipboard: icon morph to checkmark + toast "Copied".
* Record button: pulsing glow while recording; waveform anim tied to input amplitude.

**Layout**

* Max content width 1200px; responsive breakpoints at `sm/md/lg/xl`.
* Sidebar navigation with icons + labels; highlight active route.

---

## 2) Problem Solving Method (Always)

* **Decompose** complex problems into *orthogonal* subproblems.
* **Conquer** each subproblem fully with docs.
* **Integrate** with clear contracts and typed boundaries.
* **Iterate**: measure, refine, simplify. Prefer deletion over addition.

Checklist:

1. Define inputs/outputs; write types first.
2. Identify invariants and performance budgets.
3. Create pure functions where possible; isolate side effects.

---

## 3) Frontend Architecture (Next.js App Router)

**Layering**

* **Domain utils** (`/lib`): pure, framework-agnostic.
* **Data access & services** (`/server/*`): Prisma, external APIs, business rules.
* **Hooks** (`/hooks`): UI-facing state derived from services.
* **UI components** (`/components`): presentational; no side effects.
* **Screens** (`/app/*`): compose components and hooks.

**Rules**

* Prefer **Server Components** for data fetching. Use **Client Components** for recording controls, toasts, and clipboard.
* Split components: if > 200 LOC or 2 responsibilities → refactor into subcomponents.
* Avoid prop drilling: use context or hooks for local domains; never global everything.
* Use `useId` for accessible associations; label controls properly.

**File Structure**

```
  app/
    (dashboard)/dictate/page.tsx
    (dashboard)/dictionary/page.tsx
    (dashboard)/settings/page.tsx
    layout.tsx
    api/
      transcriptions/route.ts
      dictionary/route.ts
  components/
    ui/* (shadcn)
    dictate/RecordButton.tsx
    dictate/Waveform.tsx
    history/TranscriptCard.tsx
  hooks/
    useTranscriptionStream.ts
  lib/
    audio/* (encoders, slice logic)
    env.ts
    logger.ts
    result.ts
  server/
    db.ts (Prisma)
    services/
      transcription.ts
      dictionary.ts
    auth/
      auth.ts (NextAuth config)
```

**Bottom‑up Implementation Order**

1. `/lib` pure helpers → 2) `/server/services` → 3) `/hooks` → 4) `/components` → 5) `/app` screens.

---

## 4) Clean Coding (TypeScript)

**Compiler & Config**

* `"strict": true`, `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true`.
* Path aliases via `tsconfig.json` (e.g., `@/lib`, `@/server`).

**Types**

* Prefer **type aliases** + **discriminated unions** over broad interfaces.
* Model failures explicitly: `Result<T, E>` or `Either<L, R>`; never throw across layers.
* Use `readonly` and immutability where possible.
* Avoid `any`; if unavoidable, wrap and sanitize at boundaries.

**Functions**

* Single responsibility; ≤ 50 LOC; **cyclomatic complexity ≤ 15**.
* No more than 5 parameters; otherwise accept an object options type.
* Pure by default; side effects isolated.

**Naming**

* Be specific and honest: `mergeTranscripts`, `encodeOpus`, `getUserDictionary`.

**Errors**

* Never leak raw errors to clients. Map to typed error shapes.
* Attach `requestId` and `userId` to server logs.

**Validation**

* All inbound data validated with **zod**. Define schemas alongside routes/services.

**Comments**

* Explain *why*, not *what*. Prefer self-documenting code.

---

## 5) Backend APIs (Next.js Route Handlers)

**Principles**

* Stateless, idempotent where applicable, predictable error shapes.
* Pagination by default (`?cursor=` or `?page=`). Sort stable.
* Input validation with zod; output types exported for client.
* Use `POST` only for actions that mutate or require payload privacy.

**Performance**

* Use **Edge Runtime** for low-latency routes that don’t need Node APIs.
* Enable HTTP streaming (`ReadableStream`) for partial results where possible.
* Connection pooling via Prisma Data Proxy or pgbouncer (Railway configured).

**Security**

* AuthN with NextAuth (credentials provider); AuthZ per resource (userId match).
* Rate limiting (token bucket) at route level; one key per IP+userId.
* Avoid N+1 queries; use `select`/`include` wisely; add necessary indexes.

**Versioning**

* Prefix with `/api/v1/…` and evolve with additive changes. Use Sunset headers for deprecations.

**Error Envelope**

```ts
{
  ok: false,
  error: { code: "VALIDATION_ERROR" | "NOT_FOUND" | "RATE_LIMIT" | "INTERNAL", message: string }
}
```

---

## 6) Audio Slicing & Near‑Realtime STT

**Frontend Capture**

* Use **MediaRecorder** (`audio/webm;codecs=opus`) at 48kHz.
* Slice every **5s** with **1s overlap** for context; include **sequence number** and **sessionId**.
* Maintain a bounded queue; apply backpressure if uploads lag.
* Optionally use **AudioWorklet** for VAD (voice activity detection) to skip silence.

**Transport**

* Prefer **WebSocket** for low-latency bi‑directional control and partial responses. Fallback: chunked `fetch`.

**Server Pipeline**

1. Authenticate session; open slice stream → assign `requestId`.
2. Buffer N recent slices per session (e.g., last 2) to provide overlap context.
3. For each slice: decode → (optional) denoise → transcribe via Whisper (or equivalent) with dictionary prompt.
4. **Incremental merge**: align last confirmed tokens with new hypothesis using LCS/diff.
5. Emit partial text over WS; persist confirmed segments every M chars or on pause.
6. On stop: finalize merge; persist `Transcription` row with `status='done'`.

**Merging Pseudocode**

```ts
function mergePartial(prev: string, next: string): string {
  // find overlap window near the end of prev and start of next
  const tail = prev.slice(-200);
  const head = next.slice(0, 200);
  const overlap = longestCommonSubsequence(tail, head);
  if (overlap.length < 10) return prev + next; // low confidence, just append
  const cut = prev.lastIndexOf(overlap);
  return prev.slice(0, cut + overlap.length) + next.slice(overlap.length);
}
```

**Dictionary Injection**

* Build prompt: *“Transcribe accurately. Prefer these spellings: {terms}. Preserve punctuation, sentence casing.”*
* Consider on‑the‑fly dynamic biasing if model supports it.

**Performance Targets**

* ≤ 400ms server processing per 5s slice at P95.
* End‑of‑speech → final text ≤ 2s.

**Reliability**

* Retries with exponential backoff per slice.
* Idempotency by `sessionId+sequence` key.

---

## 7) Reusability & Modularization Rules

1. **Start reusable first**: write pure utilities (`/lib`) before components.
2. **Subcomponents next**: split UI into focused parts (Button, Waveform, ListItem).
3. **Compose screens last**: screens orchestrate; they do not compute.
4. **Hooks over helpers** for UI behavior; services for domain logic.
5. **No cross-layer imports** that jump around architecture boundaries.

**Granularity Heuristics**

* If a file exceeds 200–250 LOC, split it.
* If a function branches more than 3 levels deep, extract.
* If a component has more than 3 responsibilities, split.

---

## 8) Next.js Frontend Best Practices

* Prefer **RSC** for data; mark client components with `'use client'` sparingly.
* Use **Suspense** for data waterfalls; show skeletons not spinners.
* Cache with `fetch({ next: { revalidate: N } })` where safe; tag revalidation after mutations.
* Keep forms accessible; use `<form action={serverAction}>` when feasible.
* Debounce user input; throttle expensive handlers.
* Avoid global state for everything; use **React Query** or server cache for remote data.

---

## 9) Next.js Backend Best Practices

* Route Handlers in `/app/api/*/route.ts`; export `GET/POST/PUT/DELETE`.
* Use Edge runtime where Node APIs aren’t needed (`export const runtime = 'edge'`).
* Stream responses for long‑running operations (e.g., partial STT updates) via WS/Server‑Sent Events.
* Centralize env access in `@/lib/env` with zod validation.
* Centralize logging in `@/lib/logger` (pino or console wrapper) and include request metadata.

---

## 10) Database & Prisma

* Use explicit `select` fields to reduce payload; avoid `include: { * }`.
* Add composite indexes for hot queries; keep an index map in `/docs/indexes.md`.
* Soft delete via `deletedAt` when needed; otherwise hard delete where storage matters.
* Use migrations per PR; never edit generated SQL without review.
* Connection pooling on Railway (enable pgbouncer or Data Proxy). Set `POOL_MIN=0`, `POOL_MAX=10` per instance.

---

## 13) Performance Budgets

* Initial page load (TTFB): < 200ms (Edge), < 400ms (Node).
* LCP: < 2.0s on mid‑tier mobile.
* Slice processing P95: < 400ms.
* Memory budget per tab: < 150MB during recording.

**Frontend Tips**

* Lazy‑load noncritical components.
* Use `useMemo`/`useCallback` thoughtfully; avoid re-renders with key props.
* Web Workers for encoding if CPU spikes.

**Backend Tips**

* Avoid synchronous CPU‑heavy work in request handlers; offload to workers/queues if needed.
* Reuse HTTP keep‑alive agents for upstream API calls.

---
