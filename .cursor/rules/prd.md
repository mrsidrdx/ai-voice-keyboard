# 🧠 AI Voice Keyboard App

**Product Requirements & Architecture Document (PRD)**
**Version:** 1.0
**Date:** November 2025
**Author:** Siddhartha Satyakama

---

## 1. Overview

The **AI Voice Keyboard App** enables users to convert speech into beautifully formatted text using modern AI transcription and language models. Unlike traditional dictation tools, this product provides **real-time slicing-based transcription** that merges context intelligently — producing near-instant, clean, and contextually accurate text output.

The application is built with **Next.js**, **PostgreSQL**, **Whisper API**, and deployed entirely on **Railway.com** for simplicity and scalability.

---

## 2. Problem Statement

Typing is slower than speaking. Most users avoid dictation because:

* Transcriptions are messy and contextually incorrect.
* Delays occur due to long audio uploads.
* No personalization (e.g., user-defined spellings or terminologies).

We need a **fast, accurate, and context-aware** dictation solution that delivers clean, formatted text — *instantly.*

---

## 3. Product Goals

| Goal            | Description                                               |
| --------------- | --------------------------------------------------------- |
| **Speed**       | Real-time streaming transcription with <2s delay.         |
| **Accuracy**    | LLM-based context correction and dictionary integration.  |
| **Usability**   | Intuitive, minimal UI for frictionless voice-to-text use. |
| **Reliability** | Stable service with predictable performance on Railway.   |
| **Scalability** | Support hundreds of concurrent transcriptions.            |

---

## 4. Target Users & Personas

### 🎙️ Persona 1: Fast Communicator

* **Age:** 25–45
* **Role:** Professionals, journalists, students
* **Goal:** Speak instead of type long-form content quickly.
* **Pain Point:** Slow typing, context loss in dictation tools.

### ✍️ Persona 2: Creative Writer

* **Age:** 30–50
* **Goal:** Capture ideas spontaneously via speech.
* **Pain Point:** Existing voice tools produce unformatted output.

### 🧑‍💼 Persona 3: Productivity Enthusiast

* **Goal:** Save time on repetitive typing tasks (emails, notes).
* **Pain Point:** Manual text correction post-transcription.

---

## 5. Success Metrics

| Metric                             | Target      |
| ---------------------------------- | ----------- |
| Time from speech end → final text  | < 2 seconds |
| Whisper API accuracy               | ≥ 95%       |
| Copy-to-clipboard latency          | < 100ms     |
| Daily active users (DAU)           | 1,000+      |
| Average user satisfaction (survey) | ≥ 4.5 / 5   |

** We do not need to integrate any observability tools or any metrics tools to verify this, I will manually test and verify this. **

---

## 6. Core Features

### 6.1 Authentication

* Email + Password (via NextAuth + Prisma)
* Sign up, log in, and logout flows
* Reset password is **out of scope**

### 6.2 Dictation (Transcription)

* “Start / Stop” toggle button
* Microphone access using **MediaRecorder API**
* Audio sliced every 5 seconds → streamed to backend
* Backend merges slices, transcribes incrementally via Whisper API
* Final output appended live to text area
* Copy to clipboard (one-click + toast)

### 6.3 Dictionary

* Add / Edit / Delete special words
* Backend stores dictionary terms per user
* Dictionary used as **contextual prompt** for AI transcription

### 6.4 History

* View past transcriptions (sorted by latest)
* Hover → quick copy icon
* Each record shows date, length, and snippet

### 6.5 Settings

* Manage name, transcription model, output tone (casual/formal)

---

## 7. Non-Functional Requirements

| Category          | Specification                                                  |
| ----------------- | -------------------------------------------------------------- |
| **Performance**   | API response <500ms per slice; <2s overall transcription delay |
| **Scalability**   | Horizontally scalable Next.js instances                        |
| **Availability**  | 99.9% uptime                                                   |
| **Security**      | Bcrypt password hashing, JWT session tokens, SSL enforced      |
| **Compliance**    | GDPR-ready data retention, user data deletable                 |
| **Accessibility** | WCAG 2.1 AA compliant                                          |
| **Deployment**    | Railway with automatic GitHub CI/CD                            |

---

## 8. User Flows

### 8.1 Sign-Up & Login Flow

```
User → /signup → Input name, email, password → [POST /api/auth/signup]
  → Redirect to /login → Login success → /dashboard
```

### 8.2 Voice Dictation Flow

```
Dashboard → Click "Start Recording"
  → Browser prompts mic access
  → Audio slices (5s) → Uploads incrementally
  → Backend processes each slice via Whisper API
  → Partial text updates in UI
  → Stop Recording → Final merge → Display completed text
  → User clicks “Copy” → Clipboard + Toast “Copied!”
```

### 8.3 Dictionary Management Flow

```
User → /dictionary → Click “Add Word”
  → Enter word + custom spelling
  → [POST /api/dictionary]
  → List auto-updates
  → Edit/Delete options inline
```

---

## 9. User Journeys

| Step            | Experience                      | Emotional Goal  |
| --------------- | ------------------------------- | --------------- |
| Launch App      | Sees clean minimal UI           | Calm, confident |
| Start Dictation | Mic activates smoothly          | Empowered       |
| See Live Text   | Words appear fast               | Delighted       |
| Copy Output     | One-click, smooth animation     | Gratified       |
| Review History  | Finds old transcriptions easily | Efficient       |

---

## 10. Micro-Interactions

| Interaction       | Behavior                                 |
| ----------------- | ---------------------------------------- |
| Record button     | Pulsing glow + waveform animation        |
| Stop recording    | Fade-out transition + processing spinner |
| Copy to clipboard | Animated icon swap + “Copied!” toast     |
| Dictionary edit   | Inline cell highlight + save spinner     |
| Sidebar nav       | Smooth slide + icon morphing             |

---

## 11. Design Philosophy

### Principles:

1. **Clarity** — minimal clutter, prioritize action.
2. **Immediacy** — instant feedback on every click or action.
3. **Trust** — predictable motion, clear system state (recording, processing).
4. **Consistency** — all elements styled via design tokens.

### Visual Identity:

* **Font:** Inter (or Geist Sans)
* **Colors:**

  * Primary: `#2563EB` (blue)
  * Secondary: `#64748B`
  * Background: `#F9FAFB`
  * Accent: `#10B981`
* **Theme:** Light mode default, dark mode toggle optional
* **Spacing:** 8px grid system
* **Motion:** 150–250ms ease-in-out transitions

---

## 12. Authentication Mechanism

**NextAuth.js + Prisma Adapter + PostgreSQL**

* JWT-based session with secure cookies
* Middleware route protection for `/dashboard`, `/dictionary`, `/settings`
* Session renewal via rotating refresh token (server-side)
* Passwords hashed using bcrypt (12 salt rounds)

---

## 13. Backend Architecture

### Framework: **Next.js 14 (App Router)**

### API Routes:

| Endpoint                  | Method     | Description                  |
| ------------------------- | ---------- | ---------------------------- |
| `/api/auth/signup`        | POST       | Register new user            |
| `/api/auth/login`         | POST       | Authenticate user            |
| `/api/transcriptions`     | GET/POST   | Get or add new transcription |
| `/api/transcriptions/:id` | DELETE     | Delete transcription         |
| `/api/dictionary`         | GET/POST   | CRUD dictionary terms        |
| `/api/dictionary/:id`     | PUT/DELETE | Edit or delete entry         |

### Key Backend Modules

* `audioSliceProcessor.ts` — merges buffers, calls Whisper API
* `dictionaryService.ts` — retrieves user-defined terms
* `transcriptionMerger.ts` — incremental LLM merge logic
* `authService.ts` — session + token management

---

## 14. Database Design

**ER Diagram:**

```
User (1) ────< Transcription (N)
User (1) ────< DictionaryItem (N)
```

**Tables:**

### users

| Field        | Type         | Notes         |
| ------------ | ------------ | ------------- |
| id           | UUID         | PK            |
| name         | VARCHAR(100) |               |
| email        | VARCHAR(255) | Unique        |
| passwordHash | TEXT         |               |
| createdAt    | TIMESTAMP    | default now() |

### transcriptions

| Field     | Type                              | Notes         |
| --------- | --------------------------------- | ------------- |
| id        | UUID                              | PK            |
| userId    | UUID                              | FK to users   |
| text      | TEXT                              |               |
| audioUrl  | TEXT                              | optional      |
| duration  | INT                               | seconds       |
| status    | ENUM('processing','done','error') |               |
| createdAt | TIMESTAMP                         | default now() |

### dictionary_items

| Field             | Type         | Notes         |
| ----------------- | ------------ | ------------- |
| id                | UUID         | PK            |
| userId            | UUID         | FK to users   |
| term              | VARCHAR(255) |               |
| preferredSpelling | VARCHAR(255) |               |
| createdAt         | TIMESTAMP    | default now() |

---

## 15. Frontend Components (Next.js + ShadCN)

| Component           | Description                            |
| ------------------- | -------------------------------------- |
| `RecordButton`      | Central mic button with dynamic states |
| `TranscriptDisplay` | Live updating text area                |
| `HistoryList`       | Paginated view of past transcriptions  |
| `DictionaryTable`   | CRUD UI for dictionary                 |
| `Sidebar`           | Navigation across app sections         |
| `Navbar`            | Displays user info and logout          |
| `Toast`             | Global feedback system                 |
| `Modal`             | For confirmation dialogs               |

---

## 16. Deployment Architecture (Railway)

**Services:**

1. **Web App:** Next.js + API routes
2. **Database:** Railway PostgreSQL instance
3. **Environment Variables:**

   * `DATABASE_URL`
   * `NEXTAUTH_SECRET`
   * `OPENAI_API_KEY`
   * `RAILWAY_ENVIRONMENT`

**CI/CD:**

* GitHub repo → Railway automatic deploy on push to `main`
* Build command: `next build`
* Start command: `next start`

**Monitoring:**

* Use Railway logs + optional Sentry integration

---

## 17. Performance & Reliability

| Concern           | Solution                             |
| ----------------- | ------------------------------------ |
| High latency      | Slice-based streaming to Whisper     |
| Large audio files | Progressive upload & merge           |
| Database scaling  | Connection pooling via Prisma        |
| Error handling    | Retry queue with exponential backoff |
| Observability     | Logtail + structured JSON logs       |

---

## 18. Appendix

### API Example: Transcription

```ts
POST /api/transcriptions
{
  "audioSlice": "<base64-encoded>",
  "context": "string",
  "dictionary": ["Hello", "Satyakama"]
}
→
{
  "partialText": "Good morning everyone, welcome to the meeting..."
}
```

### Whisper Prompt Template

```
You are an assistant that formats spoken dictations into clean, grammatically correct, contextually consistent text.
Use the following dictionary terms where relevant: {terms}.
```

## 19. Tech Stack

1. ** Next.js 16 ** - Get latest docs from web to follow best practices, guidelines and patterns for this version
2. ** Tailwind.CSS 4 ** - Get latest docs from web to follow best practices, guidelines and patterns for this version
3. ** ShadCN **
4. ** PostgreSQL on Railway **
5. ** OpenAI Whisper API ** - Get latest docs from openai @https://platform.openai.com/docs/guides/speech-to-text?lang=javascript

## 20. Constraints

1. ** DO NOT CREATE ANY TESTS **
