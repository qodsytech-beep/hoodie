import { Review } from '@/types'

const REVIEWS_KEY = 'toko-product-reviews'

function load(): Review[] {
  if (typeof window === 'undefined') return []
  try {
    const s = localStorage.getItem(REVIEWS_KEY)
    return s ? JSON.parse(s) : []
  } catch { return [] }
}

function save(reviews: Review[]) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews)) } catch { }
}

export const reviewsDB = {
  getAll(): Review[] { return load() },

  getByProduct(productId: string): Review[] {
    return load().filter(r => r.productId === productId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  add(review: Omit<Review, 'id' | 'createdAt'>): Review {
    const all = load()
    const newReview: Review = {
      ...review,
      id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    }
    save([...all, newReview])
    return newReview
  },

  delete(id: string): void {
    save(load().filter(r => r.id !== id))
  },

  approve(id: string): void {
    const all = load().map(r => r.id === id ? { ...r, approved: true } : r)
    save(all)
  },

  getStats(productId: string): { avg: number; count: number; distribution: Record<number, number> } {
    const reviews = load().filter(r => r.productId === productId)
    if (reviews.length === 0) return { avg: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    let total = 0
    reviews.forEach(r => { dist[r.rating] = (dist[r.rating] || 0) + 1; total += r.rating })
    return { avg: +(total / reviews.length).toFixed(1), count: reviews.length, distribution: dist }
  },
}
