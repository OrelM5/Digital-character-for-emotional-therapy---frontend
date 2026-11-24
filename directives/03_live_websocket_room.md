# SOP-03 · Live Session Control Room (Hybrid: WebSocket + HTTP Steering)
**Owner:** Yishai | **AI Agent Scope:** `src/live-session/**` only

---

## Mission
You own the real-time control room — the most critical feature for therapists during active sessions. This module uses a **hybrid communication architecture**:
1. **Inbound Live Stream (WebSocket via Team 5):** Streams live transcripts, detected emotions, and character states in real time.
2. **Outbound Live Steering (HTTP POST via `axiosClient` → Team 2):** Sends covert therapist instructions to Team 2's REST server using the existing `axiosClient` (Team 2 forwards them internally to Team 3's LLM — the frontend has **NO** direct connection to Team 3).

---

## Allowed Directories
```
src/live-session/hooks/        ← WebSocket hook (inbound stream)
src/live-session/components/   ← LiveTranscript, LiveSteeringInput
src/live-session/              ← LiveControlRoomPage.tsx
```

**FORBIDDEN:** Do not write to `src/core/`, `src/features/`, `src/components/`, or `src/types/`. Do NOT use any third-party WebSocket libraries — use native `WebSocket` API only.

---

## Business Requirements & Data Models

### Live Transcript
- **Real-Time Dialogue:** Must display the real-time conversation between the child and the AI character as it happens.
- **Utterance Streaming:** Render speech recognition updates cleanly, distinguishing between interim speech states and finalized utterances, with distinct visual representations for the child and the AI character.

### Live Steering (Therapist Intervention)
- **Covert Real-Time Prompt Injection:** The therapist must have a dedicated input field to inject hidden instructions (e.g., "ask about school", "change tone to empathetic") into the active session without the child seeing or hearing the intervention.
- **Instruction Capabilities:**
  - Content Guidance: Steer conversation topics and encourage probing questions without breaking immersion.
  - Emotional & Behavioral Modulation: Adjust character emotion, intensity, and conversational tone on the fly.
- **Strict Child Concealment:** Interventions are purely internal to the therapist's control console and transmitted via HTTP `POST` to Team 2's server (which forwards them internally to Team 3's LLM), with zero visual or audible cue delivered to the child.

---

## Rules

### 1. WebSocket Hook (`useLiveSessionSocket`) — Inbound Transcript & Lifecycle
- Use native browser `WebSocket` API (no `socket.io`, `ws` package, etc.).
- Connect to Team 5's WebSocket server: `${VITE_WS_BASE_URL}/sessions/:sessionId`
- On connect (`onopen`): immediately send `session.join` message with `therapistId` and `token` from `useAuthStore`.
- Implement auto-reconnect: exponential backoff, max 5 attempts.
- Expose: `status: ConnectionStatus`, `send(message: ClientMessage): void`, `disconnect(): void`.
- Clean up (`ws.close()`) on component unmount.
- **Rule:** Do **NOT** send `steering.text` or `steering.emotion` over WebSocket.

### 2. WebSocket Message Protocol
All WebSocket messages are JSON. Use the types from `@/types/websocket.types.ts`.

**Server → Client (inbound from Team 5):**
- `transcript.update` → update transcript list (handle interim vs final)
- `emotion.detected` → update emotion display
- `character.state` → update character status indicator
- `session.ended` → navigate away to `/history`
- `error` → show error notification

**Client → Server (outbound lifecycle only):**
- `session.join` → sent on connection open
- `session.end` → therapist ends the session

### 3. Live Steering (`LiveSteeringInput`) — Outbound HTTP POST (via Team 2)
- Send all steering instructions via standard **HTTP `POST`** using the existing `axiosClient` (`@/core/api/axiosClient.ts`) — do NOT use WebSocket for steering and do NOT create a separate API client for Team 3.
- **Endpoint:** `POST /api/v1/sessions/:sessionId/steering`
  - Text payload: `{ type: 'text', instruction: string }`
  - Emotion payload: `{ type: 'emotion', emotion: string }`
- Two modes: **Text injection** and **Emotion trigger**.
  - Text: `Enter` to submit (`Shift+Enter` for newline).
  - Emotion: grid of 6 emotion buttons, then confirm.
- **UI Feedback:**
  - Show a loading/sending state while the `POST` request is in-flight.
  - On `200 OK`: clear the input, show a brief confirmation indicator (e.g., "הנחיה נשלחה ✓"), and optimistically append the `THERAPIST_STEERING` message to the local `LiveTranscript` view (unless Team 5 echoes it back over WebSocket).
  - On error: preserve the input text and display a clear retry error message.
- Disable controls while a request is in-flight or when the session is not active/connected.

### 4. Live Transcript (`LiveTranscript`)
- Display messages in a scrollable list.
- Auto-scroll to the latest message.
- Distinguish `CHILD`, `CHARACTER`, and `THERAPIST_STEERING` speakers visually (different bubbles/colors).
- Show interim (non-final) transcripts with visual indicator (opacity/italic).

### 5. TypeScript
- No `any`. Use `unknown` for raw WS data, then narrow with parsed types.
- All WebSocket message types imported from `@/types/websocket.types.ts`.

---

## Team Contracts
- `LiveControlRoomPage` receives `sessionId` via `useParams`.
- `VITE_WS_BASE_URL` from `.env.local` (Team 5 WebSocket server) — do not hardcode URLs.
- Use the existing `axiosClient` (`@/core/api/axiosClient.ts`, pointing to Team 2's `VITE_REST_API_URL`) for all HTTP `POST` steering requests. Do NOT create a separate API client or env variable for Team 3.
- Session end triggers navigation to `/history` (react-router `useNavigate`).