# Privacy Blur Mode Design Specification

## Overview
Privacy Blur Mode allows users to blur sensitive fields in the application list (Company Name, Role, and Comment/Notes) for privacy while viewing or recording screens. A toggle button in the top-right header controls this feature, and the state is persisted in `localStorage`. Users can hover over blurred text to temporarily reveal the unblurred content.

## User Experience & UI Layout
- **Toggle Button**: Positioned in the top right corner of the main header (`<header>`).
  - Icon: Google Material Symbol `visibility` (when privacy mode is off / items visible) and `visibility_off` (when privacy mode is on / items blurred).
  - Visual styling: `p-2 rounded-lg bg-surface-container-high hover:bg-surface-hover text-on-surface-variant transition-colors flex items-center gap-2`.
  - Accessible label / tooltip: "Toggle privacy blur".
- **Blur Behavior**:
  - Target fields: Company Name (`company`), Role (`role`), and Comment (`notes`) in both main table rows and expanded timeline details.
  - Applied CSS when `isBlurred` is active: `blur-[4px] select-none hover:blur-none transition-all duration-200 cursor-pointer`.
  - Hover effect: Hovering over a blurred text element temporarily reveals it by applying `hover:blur-none`.

## Architecture & Data Flow
1. **State Management**:
   - `isBlurred`: Boolean state maintained in `App.tsx`.
   - Initial state read from `localStorage.getItem("career_ops_blur_mode") === "true"`.
   - Toggle handler updates state and sets `localStorage.setItem("career_ops_blur_mode", JSON.stringify(newState))`.
2. **Component Interface**:
   - `App.tsx` renders the header toggle button and passes `isBlurred` to `<DataTable isBlurred={isBlurred} ... />`.
   - `DataTable.tsx` updates `DataTableProps` interface to accept optional `isBlurred?: boolean`.

## File Changes & Touched Files
- `src/client/App.tsx`: State initialization, header button UI, prop passing to `DataTable`.
- `src/client/components/DataTable.tsx`: Incorporate `isBlurred` prop and blur/hover CSS logic for company, role, and notes cells (including expanded timeline notes).
- `src/client/components/DataTable.test.tsx`: Unit tests for `DataTable` verifying blur state handling.

## Verification & Testing Strategy
- Unit tests: Add unit tests verifying `DataTable` renders blurred styling when `isBlurred={true}`.
- Manual / E2E verification: Build and verify component rendering, toggle button operation, hover reveal, and `localStorage` persistence.
