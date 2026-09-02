# HIMS React Migration Strategy & Guidelines

## 1. Migration Baseline
*   **AngularJS**: ~98.7% (2,629 JS files, 2,630 HTML templates, ~1.14M LOC)
*   **React**: ~1.3% (79 TSX files, ~14.5K LOC)
*   **React bridge templates**: 45

## 2. Process: The Bounded Batch Approach
Do NOT attempt a broad rewrite or mass conversion. Follow this exact flow:
`Discover` → `Trace functionality` → `Identify API/service dependencies` → `Identify reusable React components` → `Migrate ONE bounded batch` → `Preserve behavior` → `Apply 5174 design language` → `Validate` → `Build` → `Commit` → `Move to next batch`

## 3. Architecture Rule (The Two Servers)
*   **5173 = Production/Functional source of truth**
*   **5174 = Design/UX reference only**
*   **Formula**: `5173 existing functionality` + `5174 design/UX` = `modernized React application`
*   Do NOT copy 5174's backend or functional implementation.

## 4. Prioritization Matrix
Prioritize screens that are:
1.  Reachable in real user workflows.
2.  High business impact.
3.  Good candidates for reusable React patterns.
4.  Sharing common components/APIs.
5.  Suitable for bounded migration batches.
*(Avoid converting isolated/unreachable legacy screens just to increase file count).*

## 5. Aggressive Reuse
Always check for existing React components before creating new ones. Prefer reusable primitives for:
`Input`, `Select`, `DatePicker`, `Search`, `Table`, `Pagination`, `Modal`, `Card`, `Button`, `Checkbox`, `Address controls`, `Lookup controls`, `Form sections`, `Action bars`, `Summary panels`.

## 6. Functional Contract (Zero Backend Changes)
Every migrated screen MUST preserve:
*   Existing API endpoints and request/response contracts.
*   Existing business logic, validation, and permissions.
*   Existing routing, navigation, and error handling.
*   Existing loading states and CRUD behavior.
*(Do not redesign backend behavior during frontend migration).*

## 7. HTTP Architecture
*   Enforce the single sanctioned React HTTP path.
*   Do NOT introduce parallel raw `fetch()` implementations.
*   *Note: Address-control `apiFetch()` issue needs architectural cleanup.*

## 8. Measurement & Tracking
After each batch, track:
*   Angular screens migrated / React screens added.
*   Angular files retired/reduced.
*   React components reused.
*   APIs preserved.
*   Validation, Build, and Functional verification status.
*   Remaining legacy dependencies.
