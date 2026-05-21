let lastPulseAt = 0
const MIN_INTERVAL_MS = 80

function vibrate(pattern: number | number[]): void {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') {
    return
  }

  const now = Date.now()
  if (now - lastPulseAt < MIN_INTERVAL_MS) {
    return
  }

  lastPulseAt = now
  navigator.vibrate(pattern)
}

export function lightHaptic(): void {
  vibrate(12)
}

export function mediumHaptic(): void {
  vibrate([10, 18, 10])
}
