export interface HomeSection {
  id: string
  type: 'hero' | 'shopbar' | 'featured' | 'category' | 'subscription' | 'banner'
  enabled: boolean
  order: number
  // For category sections
  category?: string
  title?: string
  // For banner sections
  bannerText?: string
  bannerBg?: string
  bannerLink?: string
}

const SECTIONS_KEY = 'toko-home-sections'

export const defaultSections: HomeSection[] = [
  { id: 'hero', type: 'hero', enabled: true, order: 0 },
  { id: 'shopbar', type: 'shopbar', enabled: true, order: 1 },
  { id: 'featured', type: 'featured', enabled: true, order: 2, title: 'المنتجات المميزة' },
  { id: 'cat-pants', type: 'category', enabled: true, order: 3, category: 'pants', title: 'بناطيل' },
  { id: 'cat-tshirts', type: 'category', enabled: true, order: 4, category: 'tshirts', title: 'تيشيرتات' },
  { id: 'cat-sweatshirts', type: 'category', enabled: true, order: 5, category: 'sweatshirts', title: 'سويتشيرتات' },
  { id: 'subscription', type: 'subscription', enabled: true, order: 6 },
]

export const sectionLabels: Record<HomeSection['type'], string> = {
  hero: 'البانر الرئيسي',
  shopbar: 'شريط التسوق',
  featured: 'المنتجات المميزة',
  category: 'قسم منتجات',
  subscription: 'الاشتراك والتواصل',
  banner: 'بانر إعلاني',
}

export const sectionIcons: Record<HomeSection['type'], string> = {
  hero: '🖼️',
  shopbar: '🛒',
  featured: '⭐',
  category: '📦',
  subscription: '📧',
  banner: '📣',
}

export const homeSectionsDB = {
  get(): HomeSection[] {
    if (typeof window === 'undefined') return defaultSections
    try {
      const s = localStorage.getItem(SECTIONS_KEY)
      if (s) return JSON.parse(s)
    } catch { }
    return defaultSections
  },

  save(sections: HomeSection[]) {
    if (typeof window === 'undefined') return
    try { 
      localStorage.setItem(SECTIONS_KEY, JSON.stringify(sections)) 
      // Also persist to server
      fetch('/api/data/home-sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sections)
      }).catch(err => console.warn('Could not save home sections to server:', err))
    } catch { }
  },

  toggle(id: string) {
    const sections = this.get().map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
    this.save(sections)
    return sections
  },

  moveUp(id: string) {
    const sections = [...this.get()].sort((a, b) => a.order - b.order)
    const idx = sections.findIndex(s => s.id === id)
    if (idx <= 0) return sections
    ;[sections[idx].order, sections[idx - 1].order] = [sections[idx - 1].order, sections[idx].order]
    this.save(sections)
    return [...sections].sort((a, b) => a.order - b.order)
  },

  moveDown(id: string) {
    const sections = [...this.get()].sort((a, b) => a.order - b.order)
    const idx = sections.findIndex(s => s.id === id)
    if (idx >= sections.length - 1) return sections
    ;[sections[idx].order, sections[idx + 1].order] = [sections[idx + 1].order, sections[idx].order]
    this.save(sections)
    return [...sections].sort((a, b) => a.order - b.order)
  },

  add(section: Omit<HomeSection, 'id' | 'order'>) {
    const sections = this.get()
    const maxOrder = Math.max(...sections.map(s => s.order), -1)
    const newSection: HomeSection = {
      ...section,
      id: `sec_${Date.now()}`,
      order: maxOrder + 1,
    }
    this.save([...sections, newSection])
    return newSection
  },

  update(id: string, updates: Partial<HomeSection>) {
    const sections = this.get().map(s => s.id === id ? { ...s, ...updates } : s)
    this.save(sections)
    return sections
  },

  delete(id: string) {
    // Prevent deleting core sections
    const core = ['hero', 'shopbar', 'subscription']
    if (core.includes(id)) return this.get()
    const sections = this.get().filter(s => s.id !== id)
    this.save(sections)
    return sections
  },

  reset() {
    this.save(defaultSections)
    return defaultSections
  }
}
