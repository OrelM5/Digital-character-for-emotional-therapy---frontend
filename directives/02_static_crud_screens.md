# SOP-02 · Static CRUD Screens (REST API)
**Owner:** Shalev | **AI Agent Scope:** `src/features/**` only

---

## Mission
You own all data-management screens that interact with the REST API (Team 2 SpringBoot backend). Pages must be functional, RTL-compatible, and display appropriate loading/error/empty states.

---

## Allowed Directories
```
src/features/patients/     ← Patient list & detail card
src/features/sessions/     ← New session setup form
src/features/history/      ← Completed session archive
```

**FORBIDDEN:** Do not write to `src/core/`, `src/live-session/`, or `src/types/` without Team Lead approval. Do NOT create your own Axios instance — always import `apiClient` from `@/core/api/axiosClient`.

---

## Business Requirements & Data Models (Contract 1 — LOCKED)

> **MVP Scope Exclusions:** `usePreviousHistory` and `safetyFlag` are explicitly **excluded** from MVP. Do not add them to forms, requests, or UI.

### Patient Card Tracking (`Patient` / `PatientSummary`)
- `PatientSummary` (list view): `id`, `displayAlias`, `age`, `lastSessionDate: string | null`.
- `Patient` (full record):
  - `displayAlias: string` — child's first name / alias used in conversation
  - `personalDetails: string` — confidential full name & background (never sent to AI)
  - `age: number`
  - `emotionalBackground: string` — emotional baseline & main challenges
  - `interestsAndSafeTopics: string` — hobbies, interests & safe conversation topics
  - `longTermGoals: string` — long-term therapeutic milestones
  - `therapistNotes: string` — ongoing therapist observations
  - `preferredCharacterIds: string[]` — child's preferred 3D character IDs

### Character Catalog (`Character` & `AnimationTrigger`)
- `Character`: `id`, `name`, `description`, `unityModelAssetId`, `avatarUrl: string | null`, `availableAnimations: AnimationTrigger[]` (`{ animationTriggerId, displayName }`).

### New Session Setup (`CreateSessionRequest` → `Session`)
- Captures: `patientId`, `characterId`, `sessionGoals`, `focusTopics` (topics & preferred tone), and `sensitiveBoundaries` (topics to avoid).
- `Session` fields: `id`, `patientId`, `therapistId?`, `characterId`, `status` (`'CREATED' | 'ACTIVE' | 'COMPLETED'`), `sessionGoals`, `focusTopics`, `sensitiveBoundaries`, `startedAt?`, `endedAt?`, `durationSeconds?`, `therapistSessionNotes?`, `aiSummary?`.

### Session History & Archive (`SessionDetails` & `TranscriptMessage`)
- `SessionDetails extends Session` with `transcript: TranscriptMessage[]`.
- `TranscriptMessage` has **no `id` field** — it is keyed by `sequenceNumber: number`, with `timestamp`, `speaker` (`'CHILD' | 'CHARACTER' | 'THERAPIST_STEERING'`), `content`, `ttsDirectives: string | null`, and `animationTriggerId: string | null`.
- Displays session date (`startedAt`), duration (`durationSeconds`), character used, full verbatim transcript, AI-generated summary (`aiSummary`), and editable manual therapist notes (`therapistSessionNotes`).

---

## Rules

### Data Fetching
- Use `apiClient` from `@/core/api/axiosClient` for all HTTP calls.
- Fetch inside `useEffect` with cleanup where appropriate.
- Always handle three UI states: **loading**, **error**, **success/empty**.
- Use TypeScript generics: `apiClient.get<ResponseType>(url)`.

### Locked REST Endpoints (Team 2 Contract 1)
| Screen / Action | Method | Endpoint | Types |
|---|---|---|---|
| Patients list | `GET` | `/patients` | `PatientSummary[]` / `Patient[]` |
| Create patient | `POST` | `/patients` | `CreatePatientRequest` → `Patient` |
| Patient detail | `GET` | `/patients/:id` | → `Patient` |
| Update patient | `PUT` | `/patients/:id` | `UpdatePatientRequest` → `Patient` |
| *(Delete patient)* | — | **NO DELETE ENDPOINT** | Not supported in Contract 1 |
| Characters catalog | `GET` | `/characters` | → `Character[]` |
| Create session | `POST` | `/sessions` | `CreateSessionRequest` → `Session` |
| Patient sessions | `GET` | `/patients/:id/sessions` | → `Session[]` |
| Session details + transcript | `GET` | `/sessions/:id` | → `SessionDetails` |
| Update session notes | `PATCH` | `/sessions/:id/notes` | `UpdateSessionNotesRequest` (`{ therapistSessionNotes }`) → `Session` |

### Styling
- Use Tailwind CSS classes only. No inline styles.
- RTL support: use `flex-row-reverse` for LTR-biased layouts, `text-right` for Hebrew text.
- Use shared components from `@/components/ui/`: `Button`, `Input`, `Card`.
- Use `lucide-react` for all icons.

### TypeScript
- Import all shared types from `@/types/` — do not redefine them.
- Key types: `Patient`, `PatientSummary`, `CreatePatientRequest`, `UpdatePatientRequest`, `Character`, `AnimationTrigger`, `Session`, `SessionDetails`, `TranscriptMessage`, `CreateSessionRequest`, `UpdateSessionNotesRequest`.

### Navigation
- Use `Link` and `useNavigate` from `react-router-dom`.
- After creating a session, navigate to `/sessions/:id/live`.

---

## Team Contracts
- Pages must render inside `<MainLayout>` (provided by Ilay via `AppRouter`).
- Use `useAuthStore` from `@/core/store/useAuthStore` if therapist ID is needed.
- Do not implement your own auth guards — `AppRouter` handles that.
