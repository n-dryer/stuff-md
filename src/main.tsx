import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';

import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

// Expose Chrome AI test utility in development mode
if (import.meta.env.DEV) {
  import('./utils/chromeAITest').then(({ testChromeAI }) => {
    (
      window as unknown as { __STUFF_TEST_AI__?: () => Promise<unknown> }
    ).__STUFF_TEST_AI__ = testChromeAI;
    console.log(
      '%c[STUFF.MD] Chrome AI test utility available',
      'font-weight: bold'
    );
    console.log(
      'Run: await window.__STUFF_TEST_AI__()',
      'to test Chrome AI functionality'
    );
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
