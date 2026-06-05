import React from 'react';
import './index.css';
import { render } from 'react-dom';
import { App } from './App';
import { LocaleProvider } from './lib/i18n';
render(
  <LocaleProvider>
    <App />
  </LocaleProvider>,
  document.getElementById('root')
);