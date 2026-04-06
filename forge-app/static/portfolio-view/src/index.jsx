/**
 * Portfolio View - React Entry Point
 * 
 * This is the entry point for the Portfolio View global page
 * which displays a cross-account triage dashboard in Jira
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Create root element and render the App component
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
