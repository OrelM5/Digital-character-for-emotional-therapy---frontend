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

### Therapist Profile Data Requirements (Contract 1 — LOCKED)
The `Therapist` interface (`src/types/patient.types.ts`) contains:
- `id: string`
- `email: string`
- `fullName: string`
- `specialty?: string | null` — clinical specialties & therapy methods (e.g., anxiety, ADHD, CBT)
- `licenseNumber?: string | null` — professional license / registration number
- `therapeuticPreferences?: string | null` — guiding therapeutic principles & preferred methods
- `createdAt?: string`, `updatedAt?: string`

---

## Rules

### Authentication (Currently MOCKED via Zustand — Contract 1 Ready)
- **Temporary Mock Flow:** Authentication is currently completely MOCKED via `useAuthStore` (`loginWithMock`). **Do NOT integrate Supabase.** The mock flow simulates a 1-second network latency and sets a fake JWT token (`"mock_jwt_token_12345"`) and mock `Therapist` profile into Zustand state.
- **Locked Contract 1 REST Endpoints (Team 2 SpringBoot):** Prepare the UI and store to swap `loginWithMock` to these exact endpoints once Ilay connects the live backend:
  | Action | Method | Endpoint | Request / Response Types |
  |---|---|---|---|
  | Login | `POST` | `/auth/login` | `LoginRequest` → `AuthResponse` (`accessToken`, `tokenType`, `expiresIn`, `therapist`) |
  | Register | `POST` | `/auth/register` | `RegisterRequest` (`email`, `password`, `fullName`, `licenseNumber`) → `AuthResponse` |
  | Get Profile | `GET` | `/therapists/me` | → `Therapist` |
  | Update Profile | `PUT` | `/therapists/me` | `UpdateTherapistProfileRequest` (`fullName?`, `specialty?`, `therapeuticPreferences?`) → `Therapist` |
- **Storage & Security:** Store JWT Bearer tokens via Zustand `persist` middleware in `localStorage`. Never store raw passwords in client state.
- **Store Contract:** `useAuthStore` must expose: `token`, `therapist`, `isAuthenticated`, `isLoading`, `setAuth`, `loginWithMock`, `logout`, `updateProfile`.

### Axios Client (`axiosClient.ts`)
- Single exported instance: `apiClient`.
- Request interceptor: attach `Authorization: Bearer {token}` from `useAuthStore.getState().token`.
- Response interceptor: on `401`, call `logout()` and redirect to `/login`.
- Base URL: `/api` (proxied by Vite in dev; set `VITE_API_BASE_URL` in production).

### Routing (`AppRouter.tsx`)
- Use `BrowserRouter` + `Routes` from `react-router-dom` v6.
- Protect all non-login routes with a `<ProtectedLayout>` guard that checks `isAuthenticated`.
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
- Import types from `@/types/` only. Never redefine shared types locally.

---

## Team Contracts
- Exports `useAuthStore` hook for other modules.
- Exports `apiClient` instance for `src/features/` and `src/live-session/`.
- Route changes must be coordinated with all team members.
