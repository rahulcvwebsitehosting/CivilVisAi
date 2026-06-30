
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Runtime shim for window.process to prevent crashes in browser environments
if (typeof (window as any).process === 'undefined') {
  (window as any).process = {
    env: {}
  };
}

console.log("CivilVision AI: Initializing core systems...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
