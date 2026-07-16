# Career Ops Dashboard - Design Spec

## Overview
A dashboard for managing and tracking the career interview process. The layout builds upon the existing dark-themed table structure but introduces a timeline-based view of the application lifecycle and refines the data presented to focus on active engagements.

## UI / UX Architecture

### 1. Stats Overview
The top metrics cards will display the following data points:
- **Total Analyzed**: Total number of positions evaluated.
- **Active Processes**: Positions currently in the active funnel (Applied, Interviewing, etc.).
- **Interview Count**: Number of positions where an interview has occurred.
- **Responded Count**: Number of positions with recruiter/company responses.
*(Removed: Avg Match Score and Closed/Skipped)*

### 2. Filter Bar
- **Search Input**: Continues to filter by company, role, or notes.
- **Status Filters (Chips)**: The dropdown is replaced by clickable "chips" (pills) for quick toggling (e.g., "All Statuses", "Active", "Evaluated", "Closed"). Active chips will be highlighted with the primary blue color.

### 3. Data Table (Main View)
The primary table columns, in order:
1. **Company**: Name (bold).
2. **Role**: Job title.
3. **Score**: Match score with colored badges (high = green, med = yellow, low = gray).
4. **Status**: Current application state with colored badges.
5. **Last Interaction**: Date formatted as `Today`, `Yesterday`, or `DD.MM`. Includes context in parenthesis (e.g., "Recruiter Call").
6. **Added By**: Indicates origin (e.g., "System", "Lex", "Lex (Referral)").
7. **Report**: An icon button (👁️) to open the full detailed report (ReportDrawer).
8. **Comment**: Text notes (truncated if too long).

*(Removed: `num` column and the trailing expand chevron).*

### 4. Row Expansion & Timeline
Clicking anywhere on a row (except the Report icon) expands it to reveal the **Application Process Timeline**.
- **Timeline UI**: A vertical line with nodes representing interactions.
- **Node Data**: Date, Title of interaction (e.g., "Added to System", "Recruiter Call"), and detailed description.
- **Visual Cues**: 
  - System-generated events use gray dots.
  - User-driven or active interview events use primary blue dots.
  - Referral links (e.g., LinkedIn profiles) are embedded as clickable links inside the timeline description.

## Theming & Styling
- **Base Theme**: `#0b0f19` main background, `#161b26` card background.
- **Accent Colors**: `#3b82f6` (primary), `#10b981` (success), `#f59e0b` (warning).
- **Interactions**: Rows highlight on hover (`#222a3a`). Expanded rows remove the bottom border to visually connect with the timeline expansion container.

## Implementation Notes
- The React component `DataTable` will need a state array to track `expandedRows`.
- Dates for `Last Interaction` will need a helper function to format timestamps into `Today`/`Yesterday`/`DD.MM`.
- The `Application` type will need an `events` array or timeline structure added to the backend data model to feed the expanded view.
