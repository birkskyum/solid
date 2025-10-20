import { hydrateDocument } from 'solid-js/web';
import { App } from './App';

/**
 * Client-side entry point
 *
 * Uses hydrateDocument() to hydrate the full document.
 * The App component returns <html>...</html>, but hydrateDocument
 * will automatically extract the children and hydrate them into
 * the existing document.documentElement.
 */

console.log('Starting full document hydration...');

hydrateDocument(() => <App />);

console.log('Full document hydration complete!');
console.log('Try clicking the buttons to see reactive updates including the document title.');
