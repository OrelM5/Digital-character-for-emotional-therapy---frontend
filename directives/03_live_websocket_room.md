# SOP-03 · Live Session Control Room (Hybrid WebSocket + REST)
**Owner:** Yishai | **AI Agent Scope:** `src/live-session/**` only

---

## Mission
You own the real-time control room — the most critical feature for therapists during active sessions. This module implements our **Locked Contract 1 Hybrid Architecture**:
- **Inbound Real-Time Stream (WebSocket via Team 5):** Streams live transcripts, detected emotions, character states, and session-end notifications.
- **Outbound Controls (HTTP POST via Team 2 `apiClient`):** Sends covert live steering instructions and ends the session. **There is NO direct frontend connection to Team 3** (Team 2 forwards steering internally to Team 3's LLM).

---

## Allowed Directories
```
src/live-session/hooks/        ← WebSocket hook (Team 5 inbound stream)
src/live-session/components/   ← LiveTranscript, LiveSteeringInput
src/live-session/              ← LiveControlRoomPage.tsx
```

**FORBIDDEN:** Do not write to `src/core/`, `src/features/`, `src/components/`, or `src/types/`. Do NOT use third-party WebSocket libraries — use native `WebSocket` API only. Do NOT create a separate API client or env variable for Team 3.

---

## Business Requirements & Data Models (Contract 1 — LOCKED)

### Live Transcript
- **Real-Time Dialogue:** Must display the real-time conversation between the child and the AI character as it happens.
- **Schema Alignment:** Uses `speaker` (`'CHILD' | 'CHARACTER' | 'THERAPIST_STEERING'`), `content`, and `sequenceNumber`. Renders interim speech updates cleanly and distinguishes speaker roles visually.

### Live Steering (Covert Therapist Intervention)
- **Covert Real-Time Prompt Injection:** The therapist injects hidden instructions (`instruction`, optional `desiredTone`, optional `suggestedAnimationTriggerId`) via HTTP POST (`POST /sessions/:sessionId/steering`) without the child seeing or hearing the intervention.
- **Optimistic UI:** On HTTP POST success (`LiveSteeringResponse` with `status: 'FORWARDED'`), show confirmation feedback and optimistically append a `THERAPIST_STEERING` entry to the local transcript view.

---

## Rules

### WebSocket Hook (`useLiveSessionSocket`)
- Use native browser `WebSocket` API (no `socket.io`, `ws` package, etc.).
- Connect to: `${VITE_WS_BASE_URL}/sessions/:sessionId` (Team 5).
- **Outbound WS is handshake ONLY:** Immediately send `session.join` (`{ type: 'session.join', sessionId, therapistId, token }`) on `onopen`.
- **NEVER send steering instructions or `session.end` over WebSocket.**
- Implement auto-reconnect with exponential backoff (up to 5 attempts) and expose `status: ConnectionStatus` (`'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error'`) and `disconnect(): void`.
- Clean up (`ws.close()` + clear reconnect timers) on unmount.

### Inbound WebSocket Protocol (`ServerMessage` from Team 5)
All messages are JSON following `@/types/websocket.types.ts`:
- `{ type: 'transcript.update', payload: { sequenceNumber?, speaker, content, timestamp, isFinal, ttsDirectives?, animationTriggerId? } }` → update live transcript
- `{ type: 'emotion.detected', payload: { emotion, confidence?, timestamp } }` → update emotion indicator
- `{ type: 'character.state', payload: { state, animationTriggerId? } }` → update character state/animation indicator
- `{ type: 'session.ended', payload: { sessionId, endedAt } }` → navigate to `/history`
- `{ type: 'error', payload: { code?, message } }` → handle/log error

### Outbound HTTP REST Controls (Team 2 via `apiClient`)
- **Live Steering:** `POST /sessions/:sessionId/steering`
  - Request: `LiveSteeringRequest` (`{ instruction: string; desiredTone?: string; suggestedAnimationTriggerId?: string }`)
  - Response: `LiveSteeringResponse` (`{ sessionId: string; status: 'FORWARDED'; forwardedAt: string }`)
- **End Session:** `POST /sessions/:sessionId/end`
  - Response: `Session` (with `status: 'COMPLETED'`)
  - After calling `/end`, call `disconnect()` on the WebSocket hook and navigate to `/history`.

### Live Transcript (`LiveTranscript`)
- Display messages in a scrollable list with auto-scroll to the latest message.
- Visually distinguish `CHILD`, `CHARACTER`, and `THERAPIST_STEERING` entries.
- Show interim (`!isFinal`) transcripts with opacity/italic indicator.

### Live Steering Input (`LiveSteeringInput`)
- Submits `LiveSteeringRequest` via `apiClient.post('/sessions/' + sessionId + '/steering', payload)`.
- Supports text instruction (`Enter` to submit, `Shift+Enter` for newline) and quick tone/animation presets.
- Displays loading state, success/error confirmation feedback, and disables controls while disconnected or sending.

### TypeScript
- No `any`. Import all shared types from `@/types/websocket.types.ts` and `@/types/session.types.ts`.

---

## Team Contracts
- `LiveControlRoomPage` receives `sessionId` via `useParams`.
- `VITE_WS_BASE_URL` from `.env.local` — do not hardcode URLs.
- Session end calls `POST /sessions/:sessionId/end`, disconnects WS, and navigates to `/history`.
