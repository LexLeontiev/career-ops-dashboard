# Markdown Rendering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement premium, feature-complete Markdown rendering for reports using Tailwind Typography and remark/rehype plugins.

**Architecture:** We will install `@tailwindcss/typography`, `remark-gfm`, and `rehype-highlight`. We will configure Tailwind v4 to use the typography plugin via CSS `@plugin`, update `ReportDrawer.tsx` to use the new remark/rehype plugins, and apply `prose` classes to the markdown wrapper. We will also add CSS to ensure tables scroll horizontally.

**Tech Stack:** React, Tailwind CSS v4, `react-markdown`, `remark-gfm`, `rehype-highlight`.

## Global Constraints

- Do not change how reports are fetched or stored; focus strictly on rendering.
- Follow Tailwind v4 syntax for plugin injection (`@plugin`).

---

### Task 1: Install Dependencies and Configure Tailwind

**Files:**
- Modify: `package.json`
- Modify: `src/client/index.css`

**Interfaces:**
- Consumes: Existing Tailwind CSS setup.
- Produces: `@tailwindcss/typography` plugin available for use in classes.

- [ ] **Step 1: Install new npm packages**

```bash
npm install @tailwindcss/typography remark-gfm rehype-highlight highlight.js
```

- [ ] **Step 2: Add Typography plugin to index.css**

Update `src/client/index.css` to include the typography plugin and the highlight.js dark theme. Also add a global style for `.prose table` to allow horizontal scrolling.

```css
/* At the top of the file, after @import "tailwindcss"; */
@plugin "@tailwindcss/typography";
@import "highlight.js/styles/github-dark.css";

/* ... existing CSS ... */

/* Add at the bottom of the file */
.prose {
  max-width: none;
}
.prose table {
  display: block;
  overflow-x: auto;
  white-space: nowrap;
}
```

- [ ] **Step 3: Run the build to verify CSS doesn't break**

Run: `npm run build`
Expected: PASS with no CSS/PostCSS syntax errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/client/index.css
git commit -m "build: add tailwind typography and remark plugins"
```

---

### Task 2: Update ReportDrawer Component

**Files:**
- Modify: `src/client/components/ReportDrawer.tsx`
- Modify: `src/client/index.css` (cleaning up old styles)

**Interfaces:**
- Consumes: The `content` state inside `ReportDrawer.tsx`.
- Produces: A `<ReactMarkdown>` component with `remarkPlugins` and `rehypePlugins`.

- [ ] **Step 1: Import plugins in ReportDrawer.tsx**

At the top of `src/client/components/ReportDrawer.tsx`, add:
```tsx
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
```

- [ ] **Step 2: Update ReactMarkdown rendering**

Find this code in `src/client/components/ReportDrawer.tsx`:
```tsx
        !loading && !error && content && React.createElement(
          "div",
          { className: "markdown-content" },
          React.createElement(ReactMarkdown, null, content)
        )
```
Update it to use `className: "prose prose-invert prose-sm md:prose-base"` and pass the plugins to `ReactMarkdown`:
```tsx
        !loading && !error && content && React.createElement(
          "div",
          { className: "prose prose-invert prose-sm md:prose-base" },
          React.createElement(ReactMarkdown, {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeHighlight]
          }, content)
        )
```

- [ ] **Step 3: Remove old custom Markdown CSS**

In `src/client/index.css`, delete lines 99-126 (everything under `/* Markdown styling inside drawer */`). We no longer need `.markdown-content` custom rules since Tailwind Typography handles it.

- [ ] **Step 4: Build and Verify**

Run: `npm run build`
Expected: PASS with no TypeScript errors (if TS complains about missing types for `rehype-highlight`, run `npm install -D @types/rehype-highlight` and retry).

- [ ] **Step 5: Commit**

```bash
git add src/client/components/ReportDrawer.tsx src/client/index.css
git commit -m "feat: render reports with tailwind typography and gfm/highlight plugins"
```
