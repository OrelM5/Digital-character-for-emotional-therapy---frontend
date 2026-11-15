# SOP-01 · Core Infrastructure, Auth & Global State
**Owner:** Ilay | **AI Agent Scope:** `src/core/**` only

---

## Mission
You own the application's nervous system: authentication flow, routing, global Zustand stores, and the Axios client. Every other module depends on your work being stable and type-safe.

---

## Allowed Directories
```
src/core/api/          ← Axios client & interceptors
src/core/auth/         ← Login page, Profile page
src/core/routes/       ← AppRouter (react-router-dom v6)
src/core/store/        ← Zustand stores
```

**FORBIDDEN:** Do not write to `src/features/`, `src/live-session/`, `src/components/`, or `src/types/` without explicit Team Lead approval.

---

## Business Requirements & Data Models

### Role-Based Access Control (RBAC)
- **Strict Role Isolation:** The system must strictly isolate Therapist access from Child access. The Therapist Back-Office is an authenticated professional portal; child interactions take place on a separate runtime interface with no access to back-office management, patient records, or session notes.

### Therapist Profile Data Requirements
The therapist profile model must capture and manage:
- **Personal & Professional Details:** Full name, professional title, contact email, license and registration details.
- **Specialties:** Specific therapeutic focus areas (e.g., anxiety, ADHD, emotional regulation, trauma, behavioral challenges).
- **Training & Background:** Clinical certifications, formal education, and specialized workshop training.
- **Preferred Therapy Methods:** Primary clinical modalities used (e.g., CBT, Play Therapy, Narrative Therapy, Psychodynamic, ACT).

---

## Rules

### Authentication (Currently MOCKED via Zustand)
- **Temporary Mock Flow:** Authentication is currently completely MOCKED via `useAuthStore` (`loginWithMock`). Supabase is not used. The mock flow simulates a 1-second network latency and sets a standard fake JWT token (`"mock_jwt_token_12345"`) and mock `TherapistProfile` into Zustand state.
- **Preparation for REST API (Contract 1):** Ilay's agent must keep the UI clean and decoupled, prepared to swap `loginWithMock` for the real SpringBoot Spring Security + JWT endpoint (Team 2 REST API Contract 1) once the backend is ready.
- **Storage & Security:** Use JWT Bearer tokens stored via Zustand `persist` middleware in `localStorage`.
- **Store Contract:** `useAuthStore` must expose: `token`, `therapist`, `isAuthenticated`, `isLoading`, `setAuth`, `loginWithMock`, `logout`, `updateProfile`.
- Never store raw passwords anywhere in client state.

### Axios Client (`axiosClient.ts`)
- Single exported instance: `apiClient`.
- Request interceptor: attach `Authorization: Bearer {token}` from `useAuthStore.getState().token`.
- Response interceptor: on `401`, call `logout()` and redirect to `/login`.
- Base URL: `/api` (proxied by Vite in dev; set `VITE_API_BASE_URL` in production).

### Routing (`AppRouter.tsx`)
- Use `BrowserRouter` + `Routes` from `react-router-dom` v6.
- Protect all non-login routes with a `<RequireAuth>` component that checks `isAuthenticated`.
- Route map:
  ```
  /login                      → LoginPage (public)
  /patients                   → PatientsListPage (protected)
  /patients/:patientId        → PatientCardPage (protected)
  /sessions/new               → NewSessionSetupPage (protected)
  /sessions/:sessionId/live   → LiveControlRoomPage (protected)
  /history                    → SessionArchivePage (protected)
  /profile                    → TherapistProfilePage (protected)
  ```
- Index `/` redirects to `/patients`.

### Global State (Zustand)
- Use Zustand v4 with `create<T>()` API.
- Apply `persist` middleware ONLY for auth state (token survival across page refresh).
- Do NOT use Redux, MobX, Context API, or any other state library.
- Stores must be named `use<Feature>Store.ts`.

### TypeScript
- All function parameters and return types must be explicitly typed.
- No `any` types — use `unknown` and narrow with type guards.
- Import types from `src/types/` only. Never redefine shared types locally.

---

## Team Contracts
- Exports `useAuthStore` hook for other modules.
- Exports `apiClient` instance for `src/features/` and `src/live-session/`.
- Route changes must be coordinated with all team members.
