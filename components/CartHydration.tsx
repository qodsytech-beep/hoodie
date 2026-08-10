'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/lib/store'

// مكون لضمان تحميل السلة من localStorage عند بدء التطبيق
export default function CartHydration() {
  const setHasHydrated = useCartStore((state) => state.setHasHydrated)
  const _hasHydrated = useCartStore((state) => state._hasHydrated)

  useEffect(() => {
    // تحميل السلة من localStorage مرة واحدة فقط
    if (!_hasHydrated && typeof window !== 'undefined') {
      const saved = localStorage.getItem('toko-cart-items')
      if (saved) {
        try {
          const items = JSON.parse(saved)
          if (Array.isArray(items) && items.length > 0) {
            useCartStore.setState({ items, _hasHydrated: true })
            console.log('✅ Cart hydrated from localStorage:', items.length, 'items')
          } else {
            useCartStore.setState({ _hasHydrated: true })
          }
        } catch (error) {
          console.error('❌ Error hydrating cart:', error)
          useCartStore.setState({ _hasHydrated: true })
        }
      } else {
        useCartStore.setState({ _hasHydrated: true })
      }
    }
  }, [_hasHydrated, setHasHydrated])

  return null
}

