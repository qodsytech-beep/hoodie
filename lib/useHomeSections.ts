'use client'

import { useState, useEffect } from 'react'
import { homeSectionsDB, HomeSection, defaultSections } from './homeSections'

export function useHomeSections(): HomeSection[] {
  const [sections, setSections] = useState<HomeSection[]>([])

  useEffect(() => {
    const loadSections = async () => {
      try {
        const res = await fetch('/api/data/home-sections', { cache: 'no-store' })
        if (res.ok) {
          const serverSections = await res.json()
          if (serverSections && Array.isArray(serverSections) && serverSections.length > 0) {
            setSections(serverSections)
            try { localStorage.setItem('toko-home-sections', JSON.stringify(serverSections)) } catch {}
            return
          }
        }
      } catch {}

      // Fallback
      setSections(homeSectionsDB.get().sort((a, b) => a.order - b.order))
    }

    loadSections()

    const handler = () => setSections(homeSectionsDB.get().sort((a, b) => a.order - b.order))
    window.addEventListener('home-sections-updated', handler)
    return () => window.removeEventListener('home-sections-updated', handler)
  }, [])

  return sections
}
