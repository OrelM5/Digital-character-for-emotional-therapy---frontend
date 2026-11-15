# AGENTS.md — Master AI Agent Instructions
## Therapist Back-Office | 3-Layer AI Architecture

> **This file is the authoritative guide for every AI coding agent working on this repository.**
> GEMINI.md and CLAUDE.md are exact mirrors of this file.

---

## Project Overview

**Therapist Back-Office** is a React 18 + Vite + TypeScript SPA used by child therapists to:
- Manage patient records (CRUD)
- Configure and launch emotional therapy sessions with 3D animated characters
- Monitor live sessions in real time (WebSocket) with transcript and emotion detection
- Review historical session archives

**Team integrations:**
- **Team 2:** REST API backend (Axios client in `src/core/api/`). *Auth status:* Authentication is currently completely MOCKED via `useAuthStore` (`loginWithMock`) with fake JWT token `"mock_jwt_token_12345"`. Do not integrate Supabase. Ilay's agent will swap to Team 2's SpringBoot Spring Security + JWT endpoint (Contract 1) once the backend is ready.
- **Team 5:** WebSocket server for live session control

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
4. ✅ Check `src/types/` for the shared type contracts you must use

### Code Quality Standards
- **TypeScript strict mode** is ON. No `any` types.
- **No `console.log`** in committed code — use `console.error` for real errors only.
- **All imports** use the `@/` alias (e.g., `@/core/api/axiosClient`).
- **Zustand only** for global state. No Redux, Context API, or MobX.
- **Axios only** for HTTP (via `apiClient` from `@/core/api/axiosClient`).
- **Native WebSocket only** — no socket.io or other WS libraries.
- **Tailwind CSS only** for styling — no inline styles, no CSS modules.

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

*Last updated: 2026-11-15 | Maintained by Team Lead*

