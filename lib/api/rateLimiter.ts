import Bottleneck from 'bottleneck'

// Alpha Vantage limits: 5 calls per minute, 500 calls per day
const limiter = new Bottleneck({
  minTime: 12000, // 12 seconds between requests (5 per minute)
  maxConcurrent: 1,
  reservoir: 500, // Max 500 requests
  reservoirRefreshAmount: 500,
  reservoirRefreshInterval: 24 * 60 * 60 * 1000, // Reset daily
})

// Track API usage
let requestCount = 0
let dailyResetTime = Date.now() + 24 * 60 * 60 * 1000

export function getRateLimiter() {
  return limiter
}

export function incrementRequestCount() {
  requestCount++

  // Reset counter daily
  if (Date.now() >= dailyResetTime) {
    requestCount = 0
    dailyResetTime = Date.now() + 24 * 60 * 60 * 1000
  }

  return requestCount
}

export function getRequestCount() {
  return requestCount
}

export function getRemainingRequests() {
  return Math.max(0, 500 - requestCount)
}
