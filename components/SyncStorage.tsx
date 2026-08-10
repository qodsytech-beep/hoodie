'use client'

import { useEffect } from 'react'

export default function SyncStorage() {
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (!e.key) return
      
      // Map localStorage keys to the custom events we use in the app
      if (e.key === 'toko-site-settings') {
        window.dispatchEvent(new Event('site-settings-updated'))
      }
      if (e.key === 'toko-products') {
        window.dispatchEvent(new Event('products-updated'))
      }
      if (e.key === 'toko-categories') {
        window.dispatchEvent(new Event('categories-updated'))
      }
      if (e.key === 'toko-home-sections') {
        window.dispatchEvent(new Event('home-sections-updated'))
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return null
}
