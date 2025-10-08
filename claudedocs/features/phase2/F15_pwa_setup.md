# F15: Progressive Web App (PWA) Setup

**Status:** ⬜ Not Started
**Priority:** 🔴 Critical
**Estimated Time:** 2-3 days
**Dependencies:** F11 (Visualizations)
**Phase:** Phase 2 - Advanced Features

---

## 📋 Overview

Transform the web application into a Progressive Web App (PWA) enabling installation on mobile devices, offline support, and push notifications for price alerts. This provides an app-like experience without requiring separate native mobile apps.

**What this enables:**
- Install app on mobile devices (iOS and Android)
- Offline access to cached portfolio data
- Push notifications for price alerts
- App-like experience with standalone display mode
- Faster loading with service worker caching
- Background sync for price updates
- Add to home screen functionality
- App icon and splash screen

---

## 🎯 Acceptance Criteria

- [ ] PWA manifest.json configured correctly
- [ ] Service worker installed and registered
- [ ] Offline support for cached pages
- [ ] App installable on iOS Safari
- [ ] App installable on Android Chrome
- [ ] Install prompt appears appropriately
- [ ] App icons at all required sizes
- [ ] Splash screen configured
- [ ] Offline fallback page
- [ ] Push notification setup (for future price alerts)
- [ ] Background sync for data updates
- [ ] Service worker updates handled gracefully

---

## 🔧 Dependencies to Install

```bash
# Next.js PWA plugin
pnpm add next-pwa

# Web Push notifications (optional, for future)
pnpm add web-push
pnpm add -D @types/web-push
```

---

## 🏗️ Key Implementation Steps

### Step 1: Configure Next.js for PWA

Update `next.config.js`:

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ... other config options
}

module.exports = withPWA(nextConfig)
```

### Step 2: Create PWA Manifest

Create `public/manifest.json`:

```json
{
  "name": "Track Your Stack - Investment Portfolio Tracker",
  "short_name": "Track Your Stack",
  "description": "Track and analyze your investment portfolios with real-time data",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/desktop-1.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile-1.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ],
  "shortcuts": [
    {
      "name": "Dashboard",
      "short_name": "Dashboard",
      "description": "View your portfolio dashboard",
      "url": "/dashboard",
      "icons": [
        {
          "src": "/icons/icon-96x96.png",
          "sizes": "96x96"
        }
      ]
    },
    {
      "name": "Portfolios",
      "short_name": "Portfolios",
      "description": "View all portfolios",
      "url": "/portfolios",
      "icons": [
        {
          "src": "/icons/icon-96x96.png",
          "sizes": "96x96"
        }
      ]
    }
  ],
  "categories": ["finance", "business"],
  "lang": "en-US",
  "dir": "ltr"
}
```

### Step 3: Update HTML Meta Tags

Update `app/layout.tsx`:

```typescript
import { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Track Your Stack - Investment Portfolio Tracker',
  description: 'Track and analyze your investment portfolios with real-time data',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Track Your Stack',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Track Your Stack',
    title: 'Track Your Stack - Investment Portfolio Tracker',
    description: 'Track and analyze your investment portfolios with real-time data',
  },
  twitter: {
    card: 'summary',
    title: 'Track Your Stack',
    description: 'Track and analyze your investment portfolios',
  },
}

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />

        {/* Apple Splash Screens */}
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href="/splash/iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href="/splash/iPhone_15_Pro__iPhone_15__iPhone_14_Pro_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href="/splash/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href="/splash/iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href="/splash/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href="/splash/iPhone_11_Pro_Max__iPhone_XS_Max_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href="/splash/iPhone_11__iPhone_XR_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href="/splash/iPhone_8_Plus__iPhone_7_Plus__iPhone_6s_Plus__iPhone_6_Plus_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href="/splash/iPhone_8__iPhone_7__iPhone_6s__iPhone_6__4.7__iPhone_SE_portrait.png"
        />

        {/* iPad Splash Screens */}
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href="/splash/12.9__iPad_Pro_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href="/splash/11__iPad_Pro__10.5__iPad_Pro_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href="/splash/10.9__iPad_Air_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href="/splash/10.5__iPad_Air_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href="/splash/10.2__iPad_portrait.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
          href="/splash/9.7__iPad_Pro__7.9__iPad_mini__9.7__iPad_Air__9.7__iPad_portrait.png"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### Step 4: Create Custom Service Worker

Create `public/sw.js` (custom service worker):

```javascript
// Track Your Stack Service Worker
const CACHE_NAME = 'track-your-stack-v1'
const RUNTIME_CACHE = 'runtime-cache-v1'

// Resources to cache on install
const STATIC_CACHE_URLS = [
  '/',
  '/dashboard',
  '/portfolios',
  '/offline',
]

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching static resources')
      return cache.addAll(STATIC_CACHE_URLS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip API requests (always fetch fresh)
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Try to serve from cache if offline
          return caches.match(request)
        })
    )
    return
  }

  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200) {
            return response
          }

          const responseClone = response.clone()

          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })

          return response
        })
        .catch(() => {
          // If both cache and network fail, show offline page
          if (request.destination === 'document') {
            return caches.match('/offline')
          }
        })
    })
  )
})

// Background sync event (for future features)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-portfolios') {
    event.waitUntil(syncPortfolios())
  }
})

async function syncPortfolios() {
  try {
    // Future: Sync portfolio data in background
    console.log('Background sync: portfolios')
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Push notification event (for future price alerts)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}

  const title = data.title || 'Track Your Stack'
  const options = {
    body: data.body || 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: data.url,
    vibrate: [200, 100, 200],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  )
})
```

### Step 5: Create Offline Page

Create `app/offline/page.tsx`:

```typescript
import { Wifi, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Wifi className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>You're Offline</CardTitle>
          <CardDescription>
            It looks like you've lost your internet connection. Some features may not be available.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium">You can still:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
              <li>View cached portfolio data</li>
              <li>Browse previously loaded pages</li>
              <li>Access saved information</li>
            </ul>
          </div>

          <Button
            className="w-full"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload()
              }
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.history.back()
              }
            }}
          >
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Step 6: Create PWA Install Prompt Component

Create `components/pwa/InstallPrompt.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Check if user previously dismissed
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      if (!dismissed) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('PWA installed')
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  function handleDismiss() {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:max-w-md">
      <Card>
        <CardHeader className="relative pb-3">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="flex items-center gap-2 text-base">
            <Download className="h-5 w-5" />
            Install App
          </CardTitle>
          <CardDescription className="text-sm">
            Install Track Your Stack for quick access and offline support
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button onClick={handleInstall} className="w-full" size="sm">
            Install Now
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Step 7: Add Install Prompt to Layout

Update `app/(dashboard)/layout.tsx`:

```typescript
import InstallPrompt from '@/components/pwa/InstallPrompt'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* ... existing layout */}
      {children}
      <InstallPrompt />
    </div>
  )
}
```

### Step 8: Generate App Icons

Create a script to generate all required icon sizes:

Create `scripts/generate-icons.js`:

```javascript
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512]
const inputIcon = path.join(__dirname, '../public/logo.png') // Your source logo
const outputDir = path.join(__dirname, '../public/icons')

// Create icons directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Generate icons
async function generateIcons() {
  for (const size of sizes) {
    await sharp(inputIcon)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`))

    console.log(`Generated ${size}x${size} icon`)
  }

  console.log('All icons generated successfully!')
}

generateIcons().catch(console.error)
```

Add to `package.json`:
```json
{
  "scripts": {
    "generate-icons": "node scripts/generate-icons.js"
  }
}
```

Install sharp and run:
```bash
pnpm add -D sharp
pnpm run generate-icons
```

### Step 9: Create Push Notification Service (Future Feature)

Create `lib/push/notification-service.ts`:

```typescript
import webpush from 'web-push'

// Configure VAPID keys (generate with: npx web-push generate-vapid-keys)
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
}

if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    'mailto:your-email@example.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  )
}

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: {
    title: string
    body: string
    url?: string
  }
) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload))
    return { success: true }
  } catch (error) {
    console.error('Push notification failed:', error)
    return { success: false, error }
  }
}

export async function subscribeToPush(subscription: PushSubscription, userId: string) {
  // Store subscription in database for future use
  // TODO: Implement subscription storage
  console.log('Push subscription saved for user:', userId)
  return { success: true }
}
```

### Step 10: Add Service Worker Registration Check

Create `components/pwa/ServiceWorkerStatus.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { RefreshCw, CheckCircle } from 'lucide-react'

export default function ServiceWorkerStatus() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg)

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true)
              }
            })
          }
        })
      })
    }
  }, [])

  async function handleUpdate() {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  if (!updateAvailable) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:max-w-md">
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>New version available!</span>
          <Button size="sm" variant="outline" onClick={handleUpdate}>
            <RefreshCw className="mr-2 h-3 w-3" />
            Update
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}
```

Add to layout:
```typescript
import ServiceWorkerStatus from '@/components/pwa/ServiceWorkerStatus'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ServiceWorkerStatus />
      </body>
    </html>
  )
}
```

---

## 🧪 Testing Requirements

### Manual Testing Checklist

#### Desktop Testing
- [ ] Chrome: Install prompt appears
- [ ] Chrome: App installs successfully
- [ ] Chrome: Offline mode works
- [ ] Firefox: PWA features work
- [ ] Edge: Install and offline support

#### iOS Testing
- [ ] Safari: "Add to Home Screen" works
- [ ] App opens in standalone mode
- [ ] Icons display correctly
- [ ] Splash screen shows
- [ ] Offline fallback works
- [ ] App updates properly

#### Android Testing
- [ ] Chrome: Install prompt appears
- [ ] Chrome: App installs via banner
- [ ] App opens in standalone mode
- [ ] Icons display correctly
- [ ] Offline mode works
- [ ] Push notifications (future)

### Lighthouse PWA Audit

Run Lighthouse audit:
```bash
# Install Lighthouse CLI
pnpm add -g @lhci/cli

# Run audit
lhci autorun --collect.url=http://localhost:3000
```

Target scores:
- PWA: 100
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

### Service Worker Testing

```javascript
// Test in browser console
navigator.serviceWorker.getRegistrations().then((registrations) => {
  console.log('Service Workers:', registrations)
})

// Test offline
// 1. Open DevTools > Application > Service Workers
// 2. Check "Offline" checkbox
// 3. Navigate app - should work with cached content

// Clear cache
caches.keys().then((names) => {
  names.forEach((name) => caches.delete(name))
})
```

---

## 📚 Documentation Updates

### Update README.md

Add PWA section:
```markdown
## Progressive Web App (PWA)

Track Your Stack is a fully functional Progressive Web App:

- **Install on Mobile**: Add to home screen on iOS and Android
- **Offline Support**: View cached portfolio data without internet
- **App-like Experience**: Standalone display mode on mobile
- **Fast Loading**: Service worker caching for instant page loads
- **Push Notifications**: Get alerts for price changes (coming soon)

### Installation

**iOS (Safari):**
1. Open app in Safari
2. Tap Share button
3. Tap "Add to Home Screen"
4. Tap "Add"

**Android (Chrome):**
1. Open app in Chrome
2. Tap the install banner or menu > "Install App"
3. Tap "Install"

**Desktop (Chrome/Edge):**
1. Look for install icon in address bar
2. Click "Install"
```

### Update CHANGELOG.md

```markdown
## [0.5.0] - Phase 2: PWA Support

### Added
- Progressive Web App (PWA) configuration
- Service worker for offline support
- Install prompts for mobile and desktop
- App icons at all required sizes
- Splash screens for iOS devices
- Offline fallback page
- Service worker update notifications
- Background sync capability
- Push notification infrastructure

### Technical
- Configured next-pwa plugin
- Created custom service worker
- Added PWA manifest.json
- Generated app icons and splash screens
- Implemented install prompt component
- Added service worker status tracking
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Service Worker Not Updating

**Problem:** New service worker doesn't activate

**Solution:**
```javascript
// In sw.js, ensure skipWaiting
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

// Handle clients.claim in activate
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})
```

### Issue 2: iOS Add to Home Screen Not Working

**Problem:** App doesn't work when added to home screen

**Solution:** Ensure all iOS meta tags are present:
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png">
```

### Issue 3: Manifest Not Found

**Problem:** Browser can't find manifest.json

**Solution:** Verify manifest link in layout:
```typescript
export const metadata: Metadata = {
  manifest: '/manifest.json', // Correct
  // NOT: manifest: './manifest.json' or 'public/manifest.json'
}
```

### Issue 4: Offline Page Not Showing

**Problem:** Offline page doesn't display when offline

**Solution:** Pre-cache offline page in service worker:
```javascript
const STATIC_CACHE_URLS = [
  '/',
  '/offline', // Must be included
]
```

---

## 📦 Deliverables

After completing this feature, you should have:

- [x] next-pwa configured in Next.js
- [x] PWA manifest.json with all metadata
- [x] Custom service worker with caching strategy
- [x] App icons at all required sizes (16-512px)
- [x] iOS splash screens for all devices
- [x] Offline fallback page
- [x] Install prompt component
- [x] Service worker status tracking
- [x] Push notification infrastructure (for future)
- [x] Icon generation script
- [x] Updated meta tags in layout
- [x] Documentation for installation
- [x] Lighthouse PWA audit passing

---

## 🔗 Related Files

### Created Files
- `public/manifest.json`
- `public/sw.js`
- `public/icons/icon-*.png` (multiple sizes)
- `public/splash/*.png` (iOS splash screens)
- `app/offline/page.tsx`
- `components/pwa/InstallPrompt.tsx`
- `components/pwa/ServiceWorkerStatus.tsx`
- `lib/push/notification-service.ts`
- `scripts/generate-icons.js`

### Modified Files
- `next.config.js` (added PWA configuration)
- `app/layout.tsx` (added meta tags and links)
- `app/(dashboard)/layout.tsx` (added InstallPrompt)
- `package.json` (added dependencies and scripts)

---

## 🎉 Phase 2 Complete!

**Congratulations!** All Phase 2 features (F12-F15) are now documented and ready for implementation.

### Phase 2 Summary
- ✅ F12: Historical Performance Charts with daily snapshots
- ✅ F13: CSV Import/Export with bulk operations
- ✅ F14: Portfolio Comparison for side-by-side analysis
- ✅ F15: PWA Setup for mobile app experience

### Next Steps
1. Implement features in order (F12 → F15)
2. Test thoroughly on multiple devices
3. Deploy to production
4. Monitor user feedback
5. Plan Phase 3 features (if needed)

### Production Checklist
- [ ] All Phase 2 features implemented
- [ ] Historical data collecting daily
- [ ] Import/export tested with real data
- [ ] Portfolio comparison working smoothly
- [ ] PWA installable on iOS and Android
- [ ] Lighthouse PWA audit passing
- [ ] Performance optimized
- [ ] Security reviewed
- [ ] Documentation complete
- [ ] User guide created

---

**Status Legend:**
- ⬜ Not Started
- 🟨 In Progress
- ✅ Complete
- ⛔ Blocked
