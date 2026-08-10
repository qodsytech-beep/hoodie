'use client'

import { useState, useEffect } from 'react'
import { siteSettings, SiteSettings, defaultSettings } from './siteSettings'

/**
 * Hook that loads settings from the server (for all users including incognito)
 * and falls back to localStorage for the admin session.
 * Returns null while loading to prevent flash of default values.
 */
export function useSiteSettings(): SiteSettings | null {
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Try to fetch from server first (works for all users, all browsers)
        const res = await fetch('/api/data/settings', { cache: 'no-store' })
        if (res.ok) {
          const serverSettings = await res.json()
          // If server has settings, merge with defaults and use them
          if (serverSettings && Object.keys(serverSettings).length > 0) {
            const merged = { ...defaultSettings, ...serverSettings }
            setSettings(merged)
            // Also update localStorage so admin session stays in sync
            try {
              localStorage.setItem('toko-site-settings', JSON.stringify(merged))
            } catch {}
            return
          }
        }
      } catch {
        // Server not available — fall back to localStorage
      }

      // Fallback: read from localStorage (admin's own browser)
      setSettings(siteSettings.get())
    }

    loadSettings()

    // Listen for live updates from the admin panel (same browser/tab)
    const handler = async () => {
      // Re-read from localStorage immediately for instant admin feedback
      setSettings(siteSettings.get())
    }
    window.addEventListener('site-settings-updated', handler)
    return () => window.removeEventListener('site-settings-updated', handler)
  }, [])

  return settings
}
