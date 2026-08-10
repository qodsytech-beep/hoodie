export interface StoreCategory {
  id: string
  slug: string         // يطابق product.category او product.subCategory
  label: string        // الاسم العربي
  faIcon: string       // مثال: "fa-solid fa-shirt"
  color?: string       // لون اختياري للخلفية
  order: number
  enabled: boolean
  parentId?: string | null // null = قسم رئيسي، string = id القسم الأب
}

const CATS_KEY = 'toko-store-categories'

export const defaultCategories: StoreCategory[] = [
  // الأقسام الرئيسية
  { id: 'cat-men', slug: 'men', label: 'رجال', faIcon: 'fa-solid fa-person', color: '#f0f9ff', order: 0, enabled: true, parentId: null },
  { id: 'cat-women', slug: 'women', label: 'نساء', faIcon: 'fa-solid fa-person-dress', color: '#fdf4ff', order: 1, enabled: true, parentId: null },
  { id: 'cat-kids', slug: 'kids', label: 'أطفال', faIcon: 'fa-solid fa-child', color: '#f0fdf4', order: 2, enabled: true, parentId: null },
  
  // الأقسام الفرعية (للرجال)
  { id: 'sub-m-tshirts', slug: 'tshirts', label: 'تيشيرت', faIcon: 'fa-solid fa-shirt', order: 0, enabled: true, parentId: 'cat-men' },
  { id: 'sub-m-pants', slug: 'pants', label: 'بناطيل', faIcon: 'fa-solid fa-person', order: 1, enabled: true, parentId: 'cat-men' },
  { id: 'sub-m-outfit', slug: 'outfits', label: 'طقم كامل', faIcon: 'fa-solid fa-layer-group', order: 2, enabled: true, parentId: 'cat-men' },

  // الأقسام الفرعية (للنساء)
  { id: 'sub-w-tshirts', slug: 'tshirts', label: 'تيشيرت', faIcon: 'fa-solid fa-shirt', order: 0, enabled: true, parentId: 'cat-women' },
  { id: 'sub-w-pants', slug: 'pants', label: 'بناطيل', faIcon: 'fa-solid fa-person', order: 1, enabled: true, parentId: 'cat-women' },
  { id: 'sub-w-outfit', slug: 'outfits', label: 'طقم كامل', faIcon: 'fa-solid fa-layer-group', order: 2, enabled: true, parentId: 'cat-women' },
]

// إيقونات Font Awesome الجاهزة للاختيار
export const FA_ICON_OPTIONS = [
  { value: 'fa-solid fa-shirt',         label: 'قميص' },
  { value: 'fa-solid fa-person',        label: 'شخص' },
  { value: 'fa-solid fa-vest-patches',  label: 'سترة' },
  { value: 'fa-solid fa-hat-cowboy',    label: 'قبعة' },
  { value: 'fa-solid fa-shoe-prints',   label: 'حذاء' },
  { value: 'fa-solid fa-glasses',       label: 'نظارة' },
  { value: 'fa-solid fa-ring',          label: 'خاتم' },
  { value: 'fa-solid fa-bag-shopping',  label: 'حقيبة' },
  { value: 'fa-solid fa-gem',           label: 'جوهرة' },
  { value: 'fa-solid fa-tag',           label: 'تاجيت' },
  { value: 'fa-solid fa-star',          label: 'نجمة' },
  { value: 'fa-solid fa-fire',          label: 'نار' },
  { value: 'fa-solid fa-heart',         label: 'قلب' },
  { value: 'fa-solid fa-crown',         label: 'تاج' },
  { value: 'fa-solid fa-bolt',          label: 'برق' },
  { value: 'fa-solid fa-palette',       label: 'فن' },
  { value: 'fa-solid fa-layer-group',   label: 'طبقات' },
  { value: 'fa-solid fa-tshirt',        label: 'تيشيرت' },
  { value: 'fa-solid fa-child',         label: 'طفل' },
  { value: 'fa-solid fa-person-dress',  label: 'فستان' },
]

export const categoriesDB = {
  get(): StoreCategory[] {
    if (typeof window === 'undefined') return defaultCategories
    try {
      const s = localStorage.getItem(CATS_KEY)
      if (s) return JSON.parse(s)
    } catch {}
    return defaultCategories
  },

  save(cats: StoreCategory[]) {
    if (typeof window === 'undefined') return
    try { 
      localStorage.setItem(CATS_KEY, JSON.stringify(cats)) 
      // Also persist to server
      fetch('/api/data/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cats)
      }).catch(err => console.warn('Could not save categories to server:', err))
    } catch {}
  },

  getEnabled(): StoreCategory[] {
    return this.get()
      .filter(c => c.enabled)
      .sort((a, b) => a.order - b.order)
  },

  add(cat: Omit<StoreCategory, 'id' | 'order'>): StoreCategory {
    const all = this.get()
    const maxOrder = all.length > 0 ? Math.max(...all.map(c => c.order)) : -1
    const newCat: StoreCategory = {
      ...cat,
      id: `cat-${Date.now()}`,
      order: maxOrder + 1,
    }
    this.save([...all, newCat])
    return newCat
  },

  update(id: string, updates: Partial<StoreCategory>): StoreCategory[] {
    const cats = this.get().map(c => c.id === id ? { ...c, ...updates } : c)
    this.save(cats)
    return cats
  },

  toggle(id: string): StoreCategory[] {
    const cats = this.get().map(c => c.id === id ? { ...c, enabled: !c.enabled } : c)
    this.save(cats)
    return cats
  },

  delete(id: string): StoreCategory[] {
    // Prevent deleting defaults
    const defaults = defaultCategories.map(c => c.id)
    if (defaults.includes(id)) return this.get()
    const cats = this.get().filter(c => c.id !== id)
    this.save(cats)
    return cats
  },

  moveUp(id: string): StoreCategory[] {
    const cats = [...this.get()].sort((a, b) => a.order - b.order)
    const idx = cats.findIndex(c => c.id === id)
    if (idx <= 0) return cats
    ;[cats[idx].order, cats[idx - 1].order] = [cats[idx - 1].order, cats[idx].order]
    this.save(cats)
    return [...cats].sort((a, b) => a.order - b.order)
  },

  moveDown(id: string): StoreCategory[] {
    const cats = [...this.get()].sort((a, b) => a.order - b.order)
    const idx = cats.findIndex(c => c.id === id)
    if (idx >= cats.length - 1) return cats
    ;[cats[idx].order, cats[idx + 1].order] = [cats[idx + 1].order, cats[idx].order]
    this.save(cats)
    return [...cats].sort((a, b) => a.order - b.order)
  },

  reset(): StoreCategory[] {
    this.save(defaultCategories)
    return defaultCategories
  }
}
