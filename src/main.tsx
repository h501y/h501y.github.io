import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import './styles/theme.css'
import { installFetchGuard } from './utils/fetchGuard'

// Nuke any previously-installed service worker and its caches.
// Returning visitors may have an old SW from a prior build still
// intercepting fetches and serving stale gist data. Unregister it
// once, on every page load, until the browser stops reporting it.
// This is intentionally fire-and-forget: a failure here must never
// block the app from rendering.
function purgeServiceWorker(): void {
  if (typeof navigator === 'undefined') return

  if ('serviceWorker' in navigator) {
    void navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        for (const reg of registrations) {
          void reg.unregister()
        }
      })
      .catch(() => undefined)
  }

  if (typeof caches !== 'undefined') {
    void caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .catch(() => undefined)
  }
}

installFetchGuard()
purgeServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
