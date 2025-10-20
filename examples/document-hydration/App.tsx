import { createSignal, Show } from 'solid-js';
import { HydrationScript } from 'solid-js/web';

/**
 * Example component that returns a full HTML document structure.
 * This component can be used on both server and client.
 *
 * On the server: renderToString() will output the complete HTML
 * On the client: hydrateDocument() will extract the children and hydrate into existing elements
 */
export function App() {
  const [count, setCount] = createSignal(0);
  const [showDetails, setShowDetails] = createSignal(false);

  return (
    <html lang="en">
      <head>
        <title>Solid Full Document Hydration - Count: {count()}</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Example of full document hydration with Solid.js" />
        <HydrationScript />
        <style>{`
          body {
            font-family: system-ui, -apple-system, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background: #f5f5f5;
          }
          .card {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          button {
            background: #2c4f7c;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
            margin: 0.5rem;
          }
          button:hover {
            background: #1e3a5f;
          }
          .details {
            margin-top: 1rem;
            padding: 1rem;
            background: #e3f2fd;
            border-radius: 4px;
          }
        `}</style>
      </head>
      <body>
        <div class="card">
          <h1>🚀 Full Document Hydration Example</h1>

          <p>
            This demonstrates Solid's <code>hydrateDocument()</code> function, which allows
            hydrating the complete document including <code>&lt;html&gt;</code>,{' '}
            <code>&lt;head&gt;</code>, and <code>&lt;body&gt;</code> elements.
          </p>

          <div>
            <button onClick={() => setCount(c => c + 1)}>
              Increment Count: {count()}
            </button>

            <button onClick={() => setShowDetails(!showDetails())}>
              {showDetails() ? 'Hide' : 'Show'} Details
            </button>
          </div>

          <Show when={showDetails()}>
            <div class="details">
              <h3>How it works:</h3>
              <ul>
                <li>The component returns a full <code>&lt;html&gt;</code> structure</li>
                <li>Server renders this to a complete HTML document</li>
                <li>
                  Client uses <code>hydrateDocument()</code> to hydrate into existing elements
                </li>
                <li>
                  The <code>&lt;title&gt;</code> tag is reactive and updates with the count!
                </li>
                <li>
                  HTML attributes like <code>lang="en"</code> are applied to{' '}
                  <code>document.documentElement</code>
                </li>
              </ul>

              <p>
                <strong>Current count:</strong> {count()}
                <br />
                <strong>Document title:</strong>{' '}
                <code>Solid Full Document Hydration - Count: {count()}</code>
              </p>
            </div>
          </Show>
        </div>
      </body>
    </html>
  );
}
