# Therapist Back-Office

> **Internal tool for child therapists** – manage patients, configure sessions, and monitor live emotional-therapy interactions through 3D animated characters.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 + TypeScript 5 |
| Routing | react-router-dom v6 |
| Global State | Zustand v4 |
| HTTP Client | Axios v1 |
| Real-Time | Native WebSocket (custom hook) |
| Styling | Tailwind CSS v3 (RTL/Hebrew) |
| Icons | lucide-react |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with real API endpoints

# 3. Start dev server (port 3000)
npm run dev

# 4. Type-check
npm run typecheck

# 5. Validate team contracts
npm run validate-contracts
```

---

## 3-Layer AI Architecture

```
directives/   ← Layer 1: SOPs (Markdown) – what each AI agent is allowed to do
src/          ← Layer 2: Orchestration – React app code, owned per team member
execution/    ← Layer 3: Deterministic – Python validation scripts
```

Each team member owns a strict slice of `src/` and has a corresponding SOP in `directives/`.

| Team Member | Owns | SOP |
|---|---|---|
| **Ilay** | `src/core/` | `directives/01_core_and_state.md` |
| **Shalev** | `src/features/` | `directives/02_static_crud_screens.md` |
| **Yishai** | `src/live-session/` | `directives/03_live_websocket_room.md` |
| **Leon** | `src/components/` | `directives/04_ui_design_system.md` |
| **Team Lead** | `src/types/` | *(all SOPs reference shared types)* |

---

## Directory Structure

```
├── .gitignore
├── .env.example
├── AGENTS.md                 # Master AI Agent Instructions
├── CLAUDE.md                 # Mirror of AGENTS.md
├── GEMINI.md                 # Mirror of AGENTS.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── index.html                # RTL html[dir=rtl] + Hebrew fonts
├── directives/
│   ├── 01_core_and_state.md
│   ├── 02_static_crud_screens.md
│   ├── 03_live_websocket_room.md
│   └── 04_ui_design_system.md
├── execution/
│   └── validate_contracts.py
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css             # Tailwind directives + RTL base
    ├── core/                 # Owner: Ilay
    │   ├── api/axiosClient.ts
    │   ├── auth/LoginPage.tsx
    │   ├── auth/TherapistProfilePage.tsx
    │   ├── routes/AppRouter.tsx
    │   └── store/useAuthStore.ts
    ├── features/             # Owner: Shalev
    │   ├── patients/PatientsListPage.tsx
    │   ├── patients/PatientCardPage.tsx
    │   ├── sessions/NewSessionSetupPage.tsx
    │   └── history/SessionArchivePage.tsx
    ├── live-session/         # Owner: Yishai
    │   ├── components/LiveTranscript.tsx
    │   ├── components/LiveSteeringInput.tsx
    │   ├── hooks/useLiveSessionSocket.ts
    │   └── LiveControlRoomPage.tsx
    ├── components/           # Owner: Leon
    │   ├── ui/Button.tsx
    │   ├── ui/Input.tsx
    │   ├── ui/Card.tsx
    │   ├── layout/Sidebar.tsx
    │   └── layout/MainLayout.tsx
    └── types/                # Owner: Team Lead (read-only for agents)
        ├── patient.types.ts
        ├── session.types.ts
        ├── character.types.ts
        └── websocket.types.ts
```

---

## API Integration

- **Team 2 (REST):** Axios client in `src/core/api/axiosClient.ts`. Proxied via Vite: `/api → VITE_API_BASE_URL`.
- **Team 5 (WebSocket):** Live session hook in `src/live-session/hooks/useLiveSessionSocket.ts`. Connects to `VITE_WS_BASE_URL`.

---

## Contributing (Team Rules)

1. **Never edit files outside your owned directory** without coordinating with the owner.
2. **Shared types** in `src/types/` are Team Lead's responsibility – open a PR to propose changes.
3. **Run `npm run validate-contracts` before every commit.**
4. **AI agents must read `AGENTS.md` (or `GEMINI.md` / `CLAUDE.md`) before writing any code.**

