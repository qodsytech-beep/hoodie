'use client'

import { useEffect } from 'react'
import { siteSettings } from '@/lib/siteSettings'
import { usePathname } from 'next/navigation'

export default function MetaUpdater() {
  const pathname = usePathname()

  useEffect(() => {
    const updateMeta = () => {
      const settings = siteSettings.get()
      
      // Update Title
      if (settings.storeName && !pathname.startsWith('/admin')) {
        document.title = settings.storeName
      } else if (pathname.startsWith('/admin')) {
        document.title = 'لوحة التحكم | ' + (settings.storeName || 'المتجر')
      }

      // Update Favicon
      if (settings.faviconUrl) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
        if (!link) {
          link = document.createElement('link')
          link.rel = 'icon'
          document.head.appendChild(link)
        }
        link.href = settings.faviconUrl
      }
    }

    // Run on mount
    updateMeta()

    // Listen for setting updates
    window.addEventListener('site-settings-updated', updateMeta)
    return () => window.removeEventListener('site-settings-updated', updateMeta)
  }, [pathname])

  return null
}
