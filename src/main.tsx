import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Self-hosted fonts (latin + devanagari, no runtime CDN).
import '@fontsource/rajdhani/latin-500.css';
import '@fontsource/rajdhani/latin-600.css';
import '@fontsource/rajdhani/latin-700.css';
import '@fontsource/rajdhani/devanagari-500.css';
import '@fontsource/rajdhani/devanagari-600.css';
import '@fontsource/hind/latin-400.css';
import '@fontsource/hind/latin-500.css';
import '@fontsource/hind/latin-600.css';
import '@fontsource/hind/devanagari-400.css';
import '@fontsource/hind/devanagari-500.css';
import '@fontsource/hind/devanagari-600.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import '@fontsource/jetbrains-mono/latin-600.css';

import './index.css';
import { App } from './app/App';

const container = document.getElementById('root');
if (!container) throw new Error('Root element missing');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Cache the built app so a viva demo still works if the network drops.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* offline support is optional; never block the planner */
    });
  });
}
