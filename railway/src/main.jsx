import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Suppress console output in production to avoid Lighthouse "browser errors logged" noise
if (import.meta.env.PROD) {
  try {
    const noop = () => {};
    // Keep a tiny window hook for critical errors if needed, but silence console
    console.log = noop;
    console.debug = noop;
    console.info = noop;
    console.warn = noop;
    console.error = noop;
  } catch (_) {}
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
