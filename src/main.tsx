import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import './styles/theme.css'
import { installFetchGuard } from './utils/fetchGuard'

const APP_BASE_URL = import.meta.env.BASE_URL

function registerServiceWorker(): void {
  if (typeof window === 'undefined') return
  if (!('serviceWorker' in navigator)) return

  let isRefreshing = false

  window.addEventListener('load', () => {
    void navigator.serviceWorker
      .register(`${APP_BASE_URL}sw.js`)
      .then((reg) => {
        if (import.meta.env.DEV) console.log('SW registered')
        void reg.update()

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller && !isRefreshing) {
              isRefreshing = true
              if (import.meta.env.DEV) console.log('New SW available, reloading...')
              window.location.reload()
            }
          })
        })
      })
      .catch((err) => { if (import.meta.env.DEV) console.log('SW error:', err) })

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (isRefreshing) return
      isRefreshing = true
      if (import.meta.env.DEV) console.log('SW controller changed, reloading...')
      window.location.reload()
    })
  })
}

installFetchGuard()
registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
