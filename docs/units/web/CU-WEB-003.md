---
id: CU-WEB-003
name: UI Component Pack (EasyObj/EasyList Binding)
module: web
status: in-progress
priority: P1
links: [CU-WEB-001, CU-WEB-002, CU-WEB-004, CU-WEB-005, CU-WEB-006]
---

### Purpose
- Ship a reusable UI component pack whose default data binding relies on EasyObj and EasyList reactive models.
- Guarantee consistent UX across SSR/CSR, including loading, empty, and error presets.

### Scope
- Included
  - Inputs: Input, Password, Textarea, Select, Combobox, Checkbox, RadioGroup, Switch, Date/Time (light), Number
  - Feedback: Toast, Alert, Tooltip, Modal/Slider, Loading, Skeleton, Empty
  - Display/Layout: Card, Stat, Badge/Tag, List/Table (light), Dropdown, Pagination (light), Tabs
  - Binding contract shared by EasyObj/EasyList aware components
  - State presets: `loading`, `empty`, `error`, `disabled`, `readonly`, `required`
  - Design token alignment: Tailwind v4 tokens as base
- Excluded
  - Advanced grid features (column resize/grouping), rich text editor, heavy data grids

### Interface
- Common props (focus on binding + accessibility)
  - `dataObj?`: EasyObj or EasyList proxy-backed model
  - `dataKey?`: dotted path string (`foo.bar`) for EasyObj or selection/sort/page key for EasyList
  - `value` / `defaultValue` / `onChange(nextValue, ctx)` and `onValueChange(nextValue, ctx)`
  - `status`: `idle | loading | error | success`
  - `disabled`, `readOnly`, `required`, `invalid`, `hint`, `errorMessage`, `aria-*`
- Bound vs controlled modes
  - Bound mode: `dataObj + dataKey` drive rendering; EasyObj proxy must detect direct assignments,
    deletions, and nested mutations, emitting `ctx` via `fireValueHandlers`
  - Controlled mode: `value + onChange` mirror the bound UX without touching the model
  - Direct assignment support (`obj.foo = v`, `obj['foo.bar'] = v`, `delete obj.foo`) must notify the same
    pipeline as helper calls; legacy `dataObj.get/set` stay available but are optional
- EasyList lightweight list contract
  - Props: `items`, `columns` (minimal), `emptyMessage`, `isLoading`, `errorCode`, `requestId`
  - Model binding: `selection`, `sort`, `page`, `pageSize` through EasyList proxy
  - Context payload `ctx` (minimum): `{ dataKey?, modelType: 'obj' | 'list' | null, dirty: boolean,
    valid: boolean | null, source: 'user' | 'program' }`

### Data & Rules
- Validation: length/pattern/numeric rules map to `invalid=true`, `errorMessage`; server errors (`VALID_422_*`)
  map to the same schema
- Error format: `{ status: false, code, message, requestId }` feeds UI error states
- Auth coupling: integrate with `AUTH_*` error rules (CU-WEB-004)
- UX defaults: Toast/Alert parity with state presets
- State priority: `disabled > loading > error > success > idle`
- Accessibility: enforce `for/id`, `aria-describedby`, roving focus for composite widgets, modal focus traps
- Performance: SSR initial state should lean on skeleton presets; CSR hydration must avoid layout shift

### NFR & A11y
- Render cost: key components render under 2ms locally; contribute to overall LCP < 2.5s
- Telemetry: warn when components mix bound/controlled modes; polish fallback paths
- WCAG 2.2 AA compliance for naming, contrast, keyboard support

### Acceptance Criteria
- AC-1: Components bound with `dataObj + dataKey` reflect updates triggered by direct assignments,
  dotted keys, and deletions; `onChange`/`onValueChange` receive the same `ctx`
- AC-2: Controlled mode matches bound UX without model coupling
- AC-3: Loading, error, and empty presets surface consistent visuals and ARIA
- AC-4: Dashboard (CU-WEB-002) composes the pack to render cards/lists with minimal glue under SSR/CSR
- AC-5: Storybook exposes controls/A11y checks, light/dark themes, and binding scenarios
- AC-6: Login page (CU-WEB-001) can swap in the new form components without extra logic
- AC-7: Component docs under `frontend-web/app/component/docs/components/*` follow agreed template

### Tasks
- T1 Catalogue refinement: document props, state presets, loading/error/empty patterns
- T2 Binding retrofit: implement proxy-based bound/controlled duality, document `ctx` contract, keep legacy helpers optional
- T3 Input family: Input/Password/Select/Checkbox/RadioGroup/Switch/Date/Number/Textarea parity
- T4 Display & feedback: Card/Stat/Badge/Tag/List (light)/Pagination (light)/Tabs/Skeleton/Empty/Alert/Toast/Modal
- T5 Accessibility guardrails: label associations, modal focus management, roving focus lists
- T6 Error/state mapping: align `AUTH_*`, `VALID_422_*`, `HD_*` with Toast/Alert patterns
- T7 Storybook: controls, A11y, dark mode, model mutation demos
- T8 Testing: Vitest coverage for bound vs controlled equality, loading/error presets, EasyList selection/sort
- T9 Documentation: update component pages in `frontend-web/app/component/docs/components/*`

### Notes
- Stack: JavaScript only, Next 15 (App Router), Node 22.19.0, Tailwind v4
- Cross-links: CU-WEB-001 (login swap), CU-WEB-002 (dashboard assembly), CU-WEB-004/008 (guards), CU-WEB-005 (API contract)
- Design tokens: Tailwind v4 tokens; no hard-coded hex unless documented override

### Progress
- Implemented Switch, Textarea, Card, Badge/Tag baseline components
- Added initial binding helpers with `ctx` payload (`frontend-web/app/lib/binding.js`)
- Updated Input/Checkbox/Select for dotted keys, event detail propagation
- Docs partially updated; Storybook/tests pending
