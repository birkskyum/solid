import { createSignal } from 'solid-js';
import { HydrationScript } from 'solid-js/web';

/**
 * Alternative pattern: Shared content component
 *
 * This component returns the children of <html> (i.e., <head> and <body>)
 * as a fragment. This is the recommended pattern for better code organization.
 *
 * Benefits:
 * - Clear separation between document structure and content
 * - Server wraps in <html>, client hydrates content directly
 * - No automatic extraction needed
 */
export function AppContent() {
  const [count, setCount] = createSignal(0);

  return (
    <>
      <head>
        <title>Solid App (Split Pattern) - {count()}</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <HydrationScript />
        <style>{`
          body {
            font-family: sans-serif;
            max-width: 600px;
            margin: 2rem auto;
            padding: 1rem;
          }
          button {
            padding: 0.5rem 1rem;
            font-size: 1rem;
            cursor: pointer;
          }
        `}</style>
      </head>
      <body>
        <h1>Split Component Pattern</h1>
        <p>This uses separate server/client wrappers for cleaner code.</p>
        <button onClick={() => setCount(c => c + 1)}>
          Count: {count()}
        </button>
      </body>
    </>
  );
}

/**
 * Server-side wrapper
 * Wraps the content in <html> tag with attributes
 */
export function AppServer() {
  return (
    <html lang="en" dir="ltr">
      <AppContent />
    </html>
  );
}

/**
 * Client-side: Use AppContent directly with hydrateDocument
 *
 * import { hydrateDocument } from 'solid-js/web';
 * import { AppContent } from './AppContent';
 *
 * hydrateDocument(() => <AppContent />);
 */
