# SOP-03 · Live Session Control Room (WebSockets)
**Owner:** Yishai | **AI Agent Scope:** `src/live-session/**` only

---

## Mission
You own the real-time control room — the most critical feature for therapists during active sessions. This module connects to Team 5's WebSocket server to stream transcripts, detect emotions, and let therapists steer the 3D character in real time.

---

## Allowed Directories
```
src/live-session/hooks/        ← WebSocket hook
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
- **Strict Child Concealment:** Interventions are purely internal to the therapist's control console and transmitted directly to the session backend/WebSocket server, with zero visual or audible cue delivered to the child.

---

## Rules

### WebSocket Hook (`useLiveSessionSocket`)
- Use native browser `WebSocket` API (no `socket.io`, `ws` package, etc.).
- Connect to: `${VITE_WS_BASE_URL}/sessions/:sessionId`
- On connect: immediately send `session.join` message with `therapistId` and `token` from `useAuthStore`.
- Implement auto-reconnect: exponential backoff, max 5 attempts.
- Expose: `status: ConnectionStatus`, `send(message: ClientMessage): void`, `disconnect(): void`.
- Clean up (`ws.close()`) on component unmount.

### Message Protocol
All messages are JSON. Use the types from `@/types/websocket.types.ts`.

**Server → Client (inbound):**
- `transcript.update` → update transcript list (handle interim vs final)
- `emotion.detected` → update emotion display
- `character.state` → update character status indicator
- `session.ended` → navigate away to `/history`
- `error` → show error notification

**Client → Server (outbound):**
- `session.join` → sent on connection open
- `steering.text` → inject text for the character to say
- `steering.emotion` → trigger character emotion animation
- `session.end` → therapist ends the session

### Live Transcript (`LiveTranscript`)
- Display messages in a scrollable list.
- Auto-scroll to the latest message.
- Distinguish `child` vs `character` speakers visually (different bubbles/colors).
- Show interim (non-final) transcripts with visual indicator (opacity/italic).

### Live Steering Input (`LiveSteeringInput`)
- Two modes: **Text injection** and **Emotion trigger**.
- Text: `Enter` to submit (Shift+Enter for newline).
- Emotion: grid of 6 emotion buttons, then confirm.
- Disable controls when WebSocket is not connected.

### TypeScript
- No `any`. Use `unknown` for raw WS data, then narrow with parsed types.
- All WebSocket message types imported from `@/types/websocket.types.ts`.

---

## Team Contracts
- `LiveControlRoomPage` receives `sessionId` via `useParams`.
- `VITE_WS_BASE_URL` from `.env.local` — do not hardcode URLs.
- Session end triggers navigation to `/history` (react-router `useNavigate`).
