import { renderToString } from 'solid-js/web';
import { App } from './App';

/**
 * Server-side entry point
 *
 * Renders the App component to a complete HTML string.
 * The App component returns the full <html> structure,
 * so no additional wrapping is needed.
 */

export function renderApp(): string {
  const html = renderToString(() => <App />);

  // The rendered HTML includes the complete document structure
  // It can be sent directly as the response
  return html;
}

// Example usage with Express.js or similar
// app.get('*', (req, res) => {
//   const html = renderApp();
//   res.send(html);
// });
