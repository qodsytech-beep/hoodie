'use client'

import { useState, useEffect } from 'react'
import { categoriesDB, StoreCategory, defaultCategories } from './categories'

export function useCategories(): StoreCategory[] {
  const [categories, setCategories] = useState<StoreCategory[]>([])

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/data/categories', { cache: 'no-store' })
        if (res.ok) {
          const serverCats = await res.json()
          if (serverCats && Array.isArray(serverCats) && serverCats.length > 0) {
            setCategories(serverCats)
            try { localStorage.setItem('toko-store-categories', JSON.stringify(serverCats)) } catch {}
            return
          }
        }
      } catch {}

      // Fallback
      setCategories(categoriesDB.get())
    }

    loadCategories()

    const handler = () => setCategories(categoriesDB.get())
    window.addEventListener('categories-updated', handler)
    return () => window.removeEventListener('categories-updated', handler)
  }, [])

  return categories
}
