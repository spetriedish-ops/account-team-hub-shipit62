/**
 * Account Hub - React Entry Point
 * 
 * This is the entry point for the Account Hub macro
 * which is embedded as a Confluence macro in account pages
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
