# Markdown Rendering Design

## Context
The `career-ops-web` application renders candidate reports in a `ReportDrawer` component. Currently, it uses a basic `react-markdown` setup with minimal custom CSS. The reports contain tables, code blocks (YAML), quotes, and lists. By default, `react-markdown` does not support tables (requires GFM) and the existing styling looks unpolished. We need a premium, readable, dynamic design for these reports.

## Architecture & Dependencies
To achieve a premium aesthetic without reinventing standard typography rules, we will use the `@tailwindcss/typography` plugin. For full Markdown feature support, we will add standard ecosystem plugins.

New NPM Dependencies:
- `@tailwindcss/typography` (dev dependency, for the `prose` classes)
- `remark-gfm` (for GitHub Flavored Markdown support: tables, strikethrough, tasklists)
- `rehype-highlight` & `highlight.js` (for syntax highlighting in code blocks)

## Component Changes (`ReportDrawer.tsx`)
The `ReactMarkdown` component will be updated to include the necessary plugins:
```tsx
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

// Inside render:
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeHighlight]}
>
  {content}
</ReactMarkdown>
```
The container wrapping the markdown will replace its custom class with:
`className="prose prose-invert prose-sm md:prose-base max-w-none"`

## Styling (`index.css` & `tailwind.config.js`)
1. **Tailwind Config:** Add `require('@tailwindcss/typography')` to the plugins array.
2. **Global CSS overrides:**
   - Remove the old `.markdown-content` custom rules.
   - Add a global rule to ensure tables within the prose container can scroll horizontally to prevent breaking the Drawer layout on smaller screens. 
   - Add the `highlight.js` dark theme CSS import (e.g., `highlight.js/styles/github-dark.css` or similar) to `index.css`.

## Scope
This design is strictly focused on rendering the Markdown inside the `ReportDrawer`. It does not cover changes to how reports are fetched or stored.
