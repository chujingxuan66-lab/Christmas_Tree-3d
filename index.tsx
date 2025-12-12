import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/index.css';
import App from './App';

console.log('index.tsx: Starting app initialization...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

console.log('index.tsx: Root element found, creating root...');

try {
  const root = ReactDOM.createRoot(rootElement);
  console.log('index.tsx: Root created, rendering App...');
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('index.tsx: App rendered successfully');
} catch (error) {
  console.error('index.tsx: Error rendering app:', error);
  // Fallback: render error message
  rootElement.innerHTML = `
    <div style="color: white; padding: 20px; font-family: monospace;">
      <h1>Error Loading App</h1>
      <pre>${error instanceof Error ? error.message : String(error)}</pre>
      <pre>${error instanceof Error ? error.stack : ''}</pre>
    </div>
  `;
}