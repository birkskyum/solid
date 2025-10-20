# Full Document Hydration Example

This example demonstrates how to use Solid's `hydrateDocument` function to hydrate a complete HTML document, including the `<html>`, `<head>`, and `<body>` elements.

## Overview

Unlike React, which can only hydrate into a container element, Solid now supports full document hydration similar to React 18's `hydrateRoot` when used with document-level components.

## Usage Patterns

### Pattern 1: Separate Server and Client Components

The recommended approach is to have a shared component for the content and wrap it differently on server vs client:

**Shared Component (`AppContent.tsx`):**
```tsx
export function AppContent() {
  const [count, setCount] = createSignal(0);

  return (
    <>
      <head>
        <title>My App - Count: {count()}</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <div id="root">
          <h1>Full Document Hydration</h1>
          <button onClick={() => setCount(c => c + 1)}>
            Clicked {count()} times
          </button>
        </div>
      </body>
    </>
  );
}
```

**Server (`server.tsx`):**
```tsx
import { renderToString } from 'solid-js/web';
import { AppContent } from './AppContent';

function App() {
  return (
    <html lang="en">
      <AppContent />
    </html>
  );
}

const html = renderToString(() => <App />);
```

**Client (`client.tsx`):**
```tsx
import { hydrateDocument } from 'solid-js/web';
import { AppContent } from './AppContent';

hydrateDocument(() => <AppContent />);
```

### Pattern 2: Same Component with Automatic Extraction

If you want to use the exact same component on both server and client, `hydrateDocument` will automatically extract the children from the `<html>` element:

**Shared Component (`App.tsx`):**
```tsx
export function App() {
  const [count, setCount] = createSignal(0);

  return (
    <html lang="en">
      <head>
        <title>My App</title>
        <meta charset="UTF-8" />
      </head>
      <body>
        <div id="root">
          <h1>Hello World</h1>
          <button onClick={() => setCount(c => c + 1)}>
            Count: {count()}
          </button>
        </div>
      </body>
    </html>
  );
}
```

**Server:**
```tsx
import { renderToString } from 'solid-js/web';
import { App } from './App';

const html = renderToString(() => <App />);
```

**Client:**
```tsx
import { hydrateDocument } from 'solid-js/web';
import { App } from './App';

// hydrateDocument will automatically extract children from <html>
// and apply any attributes (like lang="en") to document.documentElement
hydrateDocument(() => <App />);
```

## How It Works

The `hydrateDocument` function:

1. **Hydrates into `document.documentElement`** (the existing `<html>` element) instead of trying to create a new one
2. **Extracts children** from any `<html>` element returned by the component
3. **Applies attributes** from the JSX `<html>` element to the existing `document.documentElement`
4. **Uses existing `<head>` and `<body>` elements** during hydration

This allows you to have full control over the entire document, including:
- Dynamic `<title>` tags
- Meta tags in `<head>`
- Scripts and styles
- HTML attributes like `lang`, `dir`, etc.

## Differences from Standard `hydrate()`

| Feature | `hydrate()` | `hydrateDocument()` |
|---------|-------------|---------------------|
| Mount point | Any element | `document.documentElement` |
| Can render `<html>` | ❌ No | ✅ Yes |
| Can render `<head>` | ⚠️ Limited (via Portal) | ✅ Yes |
| Can set html attributes | ❌ No | ✅ Yes |
| Use case | Component hydration | Full document hydration |

## Migration from `hydrate(fn, document)`

If you were previously using:
```tsx
hydrate(() => <App />, document)
```

And getting errors because `<App />` returns `<html>`, simply change to:
```tsx
hydrateDocument(() => <App />)
```

The function will handle extracting the content and hydrating it properly into the existing document structure.
