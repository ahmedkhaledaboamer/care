import React from 'react';
import './index.css';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { LocaleProvider } from './lib/i18n';
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LocaleProvider>
      <App />
    </LocaleProvider>
  </React.StrictMode>
);
