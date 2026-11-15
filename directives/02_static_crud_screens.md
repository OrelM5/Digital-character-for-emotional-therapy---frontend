# SOP-02 · Static CRUD Screens (REST API)
**Owner:** Shalev | **AI Agent Scope:** `src/features/**` only

---

## Mission
You own all data-management screens that interact with the REST API (Team 2 backend). Pages must be functional, RTL-compatible, and display appropriate loading/error/empty states.

---

## Allowed Directories
```
src/features/patients/     ← Patient list & detail card
src/features/sessions/     ← New session setup form
src/features/history/      ← Completed session archive
```

**FORBIDDEN:** Do not write to `src/core/`, `src/live-session/`, or `src/types/` without Team Lead approval. Do NOT create your own Axios instance — always import `apiClient` from `@/core/api/axiosClient`.

---

## Business Requirements & Data Models

### Patient Card Tracking
The Patient record and profile card must track the following clinical fields:
- **Basic Info:** Full name, date of birth, age group, family/guardian contact details.
- **Emotional Background:** Clinical background, developmental history, and emotional baseline.
- **Main Challenges:** Primary therapeutic difficulties (e.g., social anxiety, impulsivity, emotional expression).
- **Interests:** Hobbies, favorite topics, games, and personal interests to build rapport.
- **Preferred Animation Characters:** Child's chosen or most responsive 3D animated avatars.
- **Long-Term Goals:** High-level therapeutic milestones and objectives.
- **Therapist Notes:** Ongoing clinical observations, progress commentary, and confidential annotations.

### New Session Setup Parameters
Configuring a new therapy session must capture:
- **Selected Character:** The 3D animated character assigned for the interaction.
- **Session Goals:** Immediate objectives for the specific session (e.g., emotion recognition, social skills, anxiety reduction).
- **Focus Topics:** Specific issues or themes to guide the session towards (e.g., school test, sibling conflict, bedtime anxiety).
- **Preferred Conversation Tone:** Target interaction style for the AI character (e.g., playful, calm, encouraging, energetic).
- **Sensitive Topics to Avoid:** Explicit boundaries, trigger words, or subjects the character must steer away from.

### Session History & Archive
Completed session archives must record and display:
- **Session Metadata:** Date/time scheduled and executed, total duration in minutes.
- **Character Used:** Identification and avatar of the animated character.
- **Full Verbatim Transcript:** Complete, turn-by-turn dialogue history between the child and the character.
- **AI-Generated Summary:** Automated clinical synthesis of emotional states, key moments, and progress highlights.
- **Manual Therapist Notes:** Post-session clinical evaluation and remarks added by the therapist.

---

## Rules

### Data Fetching
- Use `apiClient` from `@/core/api/axiosClient` for all HTTP calls.
- Fetch inside `useEffect` with cleanup where appropriate.
- Always handle three UI states: **loading**, **error**, **success/empty**.
- Use TypeScript generics: `apiClient.get<ResponseType>(url)`.

### REST Endpoints (Team 2 Contract)
| Screen | Method | Endpoint |
|---|---|---|
| Patients list | GET | `/patients?search=&page=&pageSize=` |
| Patient detail | GET | `/patients/:id` |
| Patient sessions | GET | `/patients/:id/sessions` |
| Create patient | POST | `/patients` |
| Update patient | PATCH | `/patients/:id` |
| Characters list | GET | `/characters` |
| Create session | POST | `/sessions` |
| Session history | GET | `/sessions?status=completed` |

### Styling
- Use Tailwind CSS classes only. No inline styles.
- RTL support: use `flex-row-reverse` for LTR-biased layouts, `text-right` for Hebrew text.
- Use shared components from `@/components/ui/`: `Button`, `Input`, `Card`.
- Use `lucide-react` for all icons.

### TypeScript
- Import all types from `@/types/` — do not redefine them.
- Key types: `Patient`, `Session`, `Character`, `PaginatedResponse<T>`, `CreateSessionDto`, `CreatePatientDto`.
- Use `const [data, setData] = useState<Type[]>([])` patterns.

### Navigation
- Use `Link` and `useNavigate` from `react-router-dom`.
- After creating a session, navigate to `/sessions/:id/live`.

---

## Team Contracts
- Pages must render inside `<MainLayout>` (provided by Ilay via `AppRouter`).
- Use `useAuthStore` from `@/core/store/useAuthStore` if therapist ID is needed.
- Do not implement your own auth guards — `AppRouter` handles that.
