import { create } from 'zustand'
import { CartItem, Product } from '@/types'
import Cookies from 'js-cookie'

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, size: string, color: string, quantity?: number) => void
  removeItem: (productId: string, size: string, color: string) => void
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
}

// دوال مساعدة لحفظ وقراءة السلة من localStorage
const CART_STORAGE_KEY = 'toko-cart-items'

function saveCartToStorage(items: CartItem[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch { /* silent */ }
}

function loadCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* silent */ }
  return []
}

interface WishlistStore {
  items: Product[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
}

interface LanguageStore {
  language: 'ar' | 'en'
  setLanguage: (lang: 'ar' | 'en') => void
}

export const useCartStore = create<CartStore>()((set, get) => ({
      items: [],
      _hasHydrated: false,
      setHasHydrated: (state) => {
        set({ _hasHydrated: state })
      },
      addItem: (product, size, color, quantity = 1) => {
        const items = get().items
        const existingIndex = items.findIndex(
          (item) =>
            item.product.id === product.id &&
            item.selectedSize === size &&
            item.selectedColor === color
        )

        let updatedItems: CartItem[]
        if (existingIndex >= 0) {
          updatedItems = [...items]
          updatedItems[existingIndex].quantity += quantity
        } else {
          updatedItems = [...items, { product, quantity, selectedSize: size, selectedColor: color }]
        }
        
        set({ items: updatedItems })
        saveCartToStorage(updatedItems)
      },
      removeItem: (productId, size, color) => {
        const updatedItems = get().items.filter(
          (item) =>
            !(item.product.id === productId && item.selectedSize === size && item.selectedColor === color)
        )
        set({ items: updatedItems })
        saveCartToStorage(updatedItems)
      },
      updateQuantity: (productId, size, color, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size, color)
          return
        }
        const items = get().items
        const updatedItems = items.map((item) =>
          item.product.id === productId && item.selectedSize === size && item.selectedColor === color
            ? { ...item, quantity }
            : item
        )
        set({ items: updatedItems })
        saveCartToStorage(updatedItems)
      },
      clearCart: () => {
        set({ items: [] })
        saveCartToStorage([])
      },
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0)
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    })
)

// تحميل السلة من localStorage عند بدء التطبيق (سيتم استدعاؤه من CartHydration component)

const WISHLIST_STORAGE_KEY = 'toko-wishlist-items'

function saveWishlistToStorage(items: Product[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items))
  } catch { /* silent */ }
}

function loadWishlistFromStorage(): Product[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch { /* silent */ }
  return []
}

export const useWishlistStore = create<WishlistStore>()((set, get) => ({
      items: [],
      addItem: (product) => {
        if (!get().isInWishlist(product.id)) {
          const updatedItems = [...get().items, product]
          set({ items: updatedItems })
          saveWishlistToStorage(updatedItems)
        }
      },
      removeItem: (productId) => {
        const updatedItems = get().items.filter((item) => item.id !== productId)
        set({ items: updatedItems })
        saveWishlistToStorage(updatedItems)
      },
      isInWishlist: (productId) => {
        return get().items.some((item) => item.id === productId)
      },
    })
)

// تحميل قائمة الأمنيات من localStorage عند بدء التطبيق
if (typeof window !== 'undefined') {
  const savedWishlist = loadWishlistFromStorage()
  if (savedWishlist.length > 0) {
    useWishlistStore.setState({ items: savedWishlist })
  }
}

export const useLanguageStore = create<LanguageStore>()((set) => ({
  language: (typeof window !== 'undefined' ? Cookies.get('language') : 'ar') as 'ar' | 'en' || 'ar',
  setLanguage: (lang) => {
    if (typeof window !== 'undefined') {
      Cookies.set('language', lang, { expires: 365 })
    }
    set({ language: lang })
  },
}))

