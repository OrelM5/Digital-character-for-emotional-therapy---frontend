# AGENTS.md — Master AI Agent Instructions
## Therapist Back-Office | 3-Layer AI Architecture

> **This file is the authoritative guide for every AI coding agent working on this repository.**
> GEMINI.md and CLAUDE.md are exact mirrors of this file.

---

## Project Overview

**Therapist Back-Office** is a React 18 + Vite + TypeScript SPA used by child therapists to:
- Manage patient records (`Patient`, `PatientSummary` — create, read, update; no delete in MVP)
- Configure and launch emotional therapy sessions with 3D animated characters (`Character`, `AnimationTrigger`, `Session`)
- Monitor live sessions in real time using our **Locked Contract 1 Hybrid Architecture**
- Review historical session archives (`SessionDetails`, `TranscriptMessage` keyed by `sequenceNumber`)

**Team integrations (Contract 1 — LOCKED):**
- **Team 2 (SpringBoot REST API via `apiClient` in `src/core/api/`):** Handles Auth (`/auth/login`, `/auth/register`, `/therapists/me`), Patients (`/patients`), Characters (`/characters`), Sessions (`/sessions`, `/sessions/:id/notes`), **and** Live Session outbound actions (`POST /sessions/:id/steering` and `POST /sessions/:id/end`). Team 2 forwards steering internally to Team 3's LLM — **the frontend has NO direct connection to Team 3**.
  - *Auth status:* Authentication is currently completely **MOCKED** via `useAuthStore` (`loginWithMock`) with fake JWT `"mock_jwt_token_12345"`. **Do not integrate Supabase.** Ilay's agent will swap to Team 2's SpringBoot Spring Security + JWT endpoints once ready.
- **Team 5 (Real-Time Orchestrator WebSocket via `useLiveSessionSocket`):** Strictly inbound real-time stream (`${VITE_WS_BASE_URL}/sessions/:sessionId`) for transcripts, emotions, character states, and session-end events, plus the initial `session.join` handshake only. Do NOT send steering or session-end over WebSocket.

---

## 3-Layer AI Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: DIRECTIVES  (directives/)                     │
│  Markdown SOPs — what each agent is ALLOWED to do       │
│  Read your SOP before writing a single line of code.    │
├─────────────────────────────────────────────────────────┤
│  Layer 2: ORCHESTRATION  (src/)                         │
│  React app code — owned per team member                 │
│  All code lives here, organized by feature/domain       │
├─────────────────────────────────────────────────────────┤
│  Layer 3: EXECUTION  (execution/)                       │
│  Deterministic Python scripts — validation & tooling    │
│  Run before every commit: npm run validate-contracts    │
└─────────────────────────────────────────────────────────┘
```

---

## Ownership Map

| Team Member | Owned Directory | SOP Directive |
|---|---|---|
| **Ilay** | `src/core/` | `directives/01_core_and_state.md` |
| **Shalev** | `src/features/` | `directives/02_static_crud_screens.md` |
| **Yishai** | `src/live-session/` | `directives/03_live_websocket_room.md` |
| **Leon** | `src/components/` | `directives/04_ui_design_system.md` |
| **Team Lead** | `src/types/` | *(all SOPs reference shared types)* |

**RULE #1:** An AI agent must ONLY write files within its owner's directory.  
**RULE #2:** `src/types/` is read-only for all agents. Propose changes via PR.  
**RULE #3:** Run `npm run validate-contracts` before every commit.

---

## Repository Structure

```
├── AGENTS.md                    ← You are here
├── CLAUDE.md                    ← Mirror of AGENTS.md
├── GEMINI.md                    ← Mirror of AGENTS.md
├── directives/                  ← Layer 1: SOPs per team member
│   ├── 01_core_and_state.md     ← Ilay's agent
│   ├── 02_static_crud_screens.md ← Shalev's agent
│   ├── 03_live_websocket_room.md ← Yishai's agent
│   └── 04_ui_design_system.md  ← Leon's agent
├── execution/                   ← Layer 3: Validation scripts
│   └── validate_contracts.py
└── src/
    ├── core/        ← Ilay
    ├── features/    ← Shalev
    ├── live-session/ ← Yishai
    ├── components/  ← Leon
    └── types/       ← Team Lead (read-only for agents)
```

---

## Mandatory Rules for All AI Agents

### Before Writing ANY Code
1. ✅ Read `AGENTS.md` (this file)
2. ✅ Read your specific SOP in `directives/`
3. ✅ Run `npm run typecheck` to understand current type state
4. ✅ Check `src/types/` for the locked Contract 1 shared types you must use

### Code Quality Standards
- **TypeScript strict mode** is ON. No `any` types.
- **No `console.log`** in committed code — use `console.error` for real errors only.
- **All imports** use the `@/` alias (e.g., `@/core/api/axiosClient`).
- **Zustand only** for global state. No Redux, Context API, or MobX.
- **Axios only** for HTTP (via `apiClient` from `@/core/api/axiosClient`).
- **Native WebSocket only** — no socket.io or other WS libraries.
- **Tailwind CSS only** for styling — no inline styles, no CSS modules.
- **No direct Team 3 connection** — never create a separate HTTP client or env var for Team 3.
- **MVP Exclusions:** Do not add `usePreviousHistory`, `safetyFlag`, or patient deletion.

### Commit Rules
- Run `npm run validate-contracts` and ensure exit code 0.
- Run `npm run typecheck` and ensure zero errors.
- Never commit `.env.local` or any file containing secrets.

### Conflict Resolution
- If you need to modify a file outside your directory, **stop and ask the Team Lead**.
- If a shared type in `src/types/` needs changing, **open a PR and tag Team Lead**.
- If two agents need to collaborate on a feature, **coordinate via comments in the relevant issue**.

---

## Tech Stack Quick Reference

| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool & dev server |
| TypeScript | 5.x | Type safety |
| react-router-dom | 6.x | Client-side routing |
| Zustand | 4.x | Global state management |
| Axios | 1.x | REST API client |
| Tailwind CSS | 3.x | Styling (RTL-ready) |
| lucide-react | 0.396+ | Icon library |

---

## Environment Variables

| Variable | Used By | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Vite proxy | Team 2 REST API base URL |
| `VITE_WS_BASE_URL` | WS hook | Team 5 WebSocket server URL |
| `VITE_APP_ENV` | App | `development` / `production` |

Copy `.env.example` to `.env.local` to get started.

---

*Last updated: 2026-11-24 | Contract 1 Locked | Maintained by Team Lead*
