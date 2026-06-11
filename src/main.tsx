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
installAutoUpdate()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Detect a newer deploy and reload transparently. Vite hashes the
// bundle filename, so the JS/CSS the browser holds in cache becomes
// invalid the moment a new deploy lands — but only if the browser
// actually re-fetches index.html. GitHub Pages cannot set HTTP cache
// headers, so we revalidate the HTML ourselves: fetch it with no-store,
// compare the bundle hash inside it to the one currently running, and
// reload when they diverge.
function installAutoUpdate(): void {
  if (typeof window === 'undefined') return

  const HTML_URL = (() => {
    const base = import.meta.env.BASE_URL || '/'
    return `${base}index.html`.replace(/\/+/g, '/')
  })()
  // Vite hashes JS and CSS independently: a style-only deploy changes
  // the CSS filename but not the JS one, so both must be compared.
  const JS_RE = /\/assets\/index-([A-Za-z0-9_-]+)\.js/
  const CSS_RE = /\/assets\/index-([A-Za-z0-9_-]+)\.css/

  const currentJs = (() => {
    for (const s of Array.from(document.scripts)) {
      const m = s.src.match(JS_RE)
      if (m) return m[1]
    }
    return null
  })()

  const currentCss = (() => {
    const links = document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
    for (const link of Array.from(links)) {
      const m = link.href.match(CSS_RE)
      if (m) return m[1]
    }
    return null
  })()

  if (!currentJs && !currentCss) return

  let reloading = false

  async function check(): Promise<void> {
    if (reloading) return
    try {
      const response = await fetch(`${HTML_URL}?_=${Date.now()}`, {
        cache: 'no-store',
        credentials: 'same-origin'
      })
      if (!response.ok) return
      const html = await response.text()
      // Compare each asset only when present in BOTH the running page
      // and the fetched HTML — an error page or a missing match must
      // never trigger a reload loop.
      const jsMatch = html.match(JS_RE)
      const cssMatch = html.match(CSS_RE)
      const jsChanged = currentJs !== null && jsMatch !== null && jsMatch[1] !== currentJs
      const cssChanged = currentCss !== null && cssMatch !== null && cssMatch[1] !== currentCss
      if (jsChanged || cssChanged) {
        reloading = true
        window.location.reload()
      }
    } catch {
      // Network failures here are non-fatal: the user keeps whatever
      // bundle they already have running until the next check.
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void check()
  })
  window.addEventListener('focus', () => void check())
  window.addEventListener('online', () => void check())
}
