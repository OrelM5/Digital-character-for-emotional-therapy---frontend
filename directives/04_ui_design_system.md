# SOP-04 · UI Design System & Shared Components
**Owner:** Leon | **AI Agent Scope:** `src/components/**` only

---

## Mission
You own the design system — the foundation every other team member builds on. Your components must be accessible, RTL-first, type-safe, and visually consistent across all screens.

---

## Allowed Directories
```
src/components/ui/        ← Button, Input, Card, Badge, Modal, etc.
src/components/layout/    ← MainLayout, Sidebar, Header
```

**FORBIDDEN:** Do not write to `src/core/`, `src/features/`, `src/live-session/`, or `src/types/`. Do not add business logic to UI components.

---

## Rules

### Design Tokens (Tailwind Config)
All colors, fonts, and animations are defined in `tailwind.config.js`. Do not hardcode hex values in component files — use Tailwind utility classes.

| Token | Usage |
|---|---|
| `brand-500` | Primary interactive blue |
| `therapy-medium` | Primary purple (CTAs, active states) |
| `therapy-soft` | Light purple background |
| `therapy-strong` | Dark purple (text on light bg) |

### Component Standards
1. **TypeScript-first:** All props must have explicit interfaces. Export the props interface.
2. **Polymorphic components:** `Button` supports `as` prop for rendering as `Link`, `a`, etc.
3. **forwardRef:** `Input` and similar form elements must use `forwardRef`.
4. **No hardcoded text:** Components must accept `children` or explicit text props.
5. **Accessibility:** Every interactive element needs `aria-label` or visible text.

### RTL Support
- Use logical CSS properties via Tailwind: `ms-` (margin-start), `me-` (margin-end), `ps-`, `pe-` instead of `ml-`, `mr-`, `pl-`, `pr-` wherever direction matters.
- Icon-only buttons need `aria-label` in Hebrew.
- The root `<html>` element has `dir="rtl"` — do not override per-component unless wrapping LTR content (e.g., code, email inputs — use `dir="ltr"` on the element).

### Styling
- Tailwind CSS classes only. No CSS modules, no styled-components, no inline `style={{}}`.
- Use `clsx` or string concatenation for conditional classes (avoid template literal complexity).
- Responsive: mobile-first with `sm:`, `md:`, `lg:` breakpoints.

### Component Checklist (before finishing any component)
- [ ] TypeScript props interface exported
- [ ] `className` prop accepted and merged (for extensibility)
- [ ] Loading / disabled states handled
- [ ] Works in RTL (tested with Hebrew text)
- [ ] No hardcoded colors or pixel values
- [ ] `lucide-react` used for all icons

---

## Component Catalog (current)
| Component | File | Description |
|---|---|---|
| `Button` | `ui/Button.tsx` | Polymorphic, variants: primary/secondary/ghost/danger |
| `Input` | `ui/Input.tsx` | Supports input + textarea, forwardRef |
| `Card` | `ui/Card.tsx` | Container with optional title |
| `Sidebar` | `layout/Sidebar.tsx` | RTL navigation sidebar |
| `MainLayout` | `layout/MainLayout.tsx` | Full-page layout wrapper |

New components to add: `Badge`, `Modal`, `Spinner`, `Toast`, `EmptyState`.

## 🎨 Safe Page Restyling Protocol (Cross-Domain UI Polish)

By default, your primary workspace is `src/components/`, `tailwind.config.js`, and `src/index.css`. However, when requested to redesign or style specific pages located in other domains (`src/core/`, `src/features/`, or `src/live-session/`), you MUST strictly follow these non-destructive rules:

### 1. What You ARE Allowed to Change in Page Files:
- **JSX Layout & Structure:** You may wrap elements in layout containers (`<div>`, `<section>`, `<main>`), reorder visual blocks, and replace raw HTML tags with shared components from `src/components/ui/`.
- **Styling & Classes:** You may freely modify, add, or replace all Tailwind CSS `className` attributes, animations, icons (`lucide-react`), and RTL spacing (`dir="rtl"`).
- **Theme Assets:** You may configure brand colors (such as the soft rose/pink and slate-blue tones from the platform's heart logo), typography, and dark/light mode variables in `tailwind.config.js`.

### 2. What You Are STRICTLY FORBIDDEN from Changing:
- **Component Props & Signatures:** Never rename, remove, or change the TypeScript interface of any existing component props (e.g., `onClick`, `value`, `onChange`, `disabled`, `sessionId`).
- **Business Logic & Hooks:** Do NOT touch anything above the `return (` statement in page components. Never modify `useState`, `useEffect`, `useAuthStore` (Zustand), `axiosClient` calls, or `useLiveSessionSocket` (WebSocket) logic.
- **Event Handlers & Data Binding:** Keep all form `onSubmit`, input `onChange`, button `onClick` handlers, and mapped data arrays (`.map(...)`) intact and attached to their respective interactive elements.
- **API Contracts:** Never edit files inside `src/types/`.

### 3. Mandatory Verification Step:
After restyling any component or page, you must run:
1. `npm run build` (to ensure zero TypeScript or JSX compilation errors).
2. `python execution/validate_contracts.py` (to verify all architectural contracts remain intact).
