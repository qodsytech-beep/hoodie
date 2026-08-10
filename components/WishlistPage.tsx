'use client'

import Link from 'next/link'
import { Heart, ShoppingCart, ArrowLeft } from 'lucide-react'
import { useWishlistStore } from '@/lib/store'
import { useCartStore } from '@/lib/store'
import { useLanguageStore } from '@/lib/store'
import ProductCard from './ProductCard'

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore()
  const addItem = useCartStore((state) => state.addItem)
  const { language } = useLanguageStore()

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart size={64} className="mx-auto text-neutral-300 mb-4" />
        <h2 className="text-2xl font-bold mb-4">
          {language === 'ar' ? 'قائمة الأمنيات فارغة' : 'Your wishlist is empty'}
        </h2>
        <p className="text-neutral-500 mb-8">
          {language === 'ar'
            ? 'ابدأ بإضافة المنتجات التي تحبها إلى قائمة الأمنيات'
            : 'Start adding products you love to your wishlist'}
        </p>
        <Link
          href="/products"
          className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
        >
          {language === 'ar' ? 'تسوق الآن' : 'Shop Now'}
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{language === 'ar' ? 'قائمة الأمنيات' : 'Wishlist'}</h1>
        <Link
          href="/products"
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition"
        >
          <ArrowLeft size={18} />
          <span>{language === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

