'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getProductsByCategory } from '@/lib/products'
import ProductCard from './ProductCard'
import { Product } from '@/types'
import ScrollAnimation from './ScrollAnimation'

import { useCategories } from '@/lib/useCategories'

interface CategorySectionProps {
  category: string
  title: string
  limit?: number
}

export default function CategorySection({ category, title, limit }: CategorySectionProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const sliderRef = useRef<HTMLDivElement>(null)
  const categories = useCategories()

  useEffect(() => {
    getProductsByCategory(category).then((data) => {
      if (limit) {
        setProducts(data.slice(0, limit))
      } else {
        setProducts(data)
      }
      setLoading(false)
    })
    
  }, [category, limit])

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth * 0.8
      if (direction === 'right') {
        sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      } else {
        sliderRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
      }
    }
  }

  // Determine the correct href for the "View All" link
  let viewAllHref = `/products?category=${category}`
  const catObj = categories.find(c => c.slug === category)
  if (catObj && catObj.parentId) {
    const parentObj = categories.find(c => c.id === catObj.parentId)
    if (parentObj) {
      // User wants both parent and child selected in the products filter
      viewAllHref = `/products?category=${parentObj.slug}&subCategory=${catObj.slug}`
    }
  }

  if (loading) {
    return (
      <section className="py-12 bg-neutral-50 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="w-64 h-10 bg-slate-200 rounded-lg animate-pulse" />
            <div className="w-24 h-6 bg-slate-200 rounded animate-pulse hidden md:block" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[70%] sm:w-[45%] md:w-[30%] lg:w-[23%]">
                <div className="aspect-[3/4] bg-slate-200 rounded-xl animate-pulse mb-3" />
                <div className="w-3/4 h-4 bg-slate-200 rounded animate-pulse mb-2" />
                <div className="w-1/2 h-4 bg-slate-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <ScrollAnimation>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-black">
              {title}
            </h2>
            <Link
              href={viewAllHref}
              className="text-black hover:text-neutral-700 font-semibold transition flex items-center gap-2"
            >
              عرض الكل
              <span>→</span>
            </Link>
          </div>
        </ScrollAnimation>

        <div className="relative group/slider" dir="rtl">
          <div className="overflow-hidden">
            <div
              ref={sliderRef}
              className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 hide-scrollbar scroll-smooth"
            >
              {products.map((product) => (
                <div key={product.id} className="snap-start flex-shrink-0 w-[70%] sm:w-[45%] md:w-[30%] lg:w-[23%]">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          {products.length > 2 && (
            <>
              <button
                onClick={() => scroll('left')}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-black hover:text-neutral-600 transition-all duration-300 z-10 hover:scale-110 active:scale-95 hidden md:flex items-center justify-center opacity-0 group-hover/slider:opacity-100 bg-white/80 rounded-full shadow-md w-12 h-12"
                aria-label="التالي"
              >
                <ChevronRight size={32} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => scroll('right')}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-black hover:text-neutral-600 transition-all duration-300 z-10 hover:scale-110 active:scale-95 hidden md:flex items-center justify-center opacity-0 group-hover/slider:opacity-100 bg-white/80 rounded-full shadow-md w-12 h-12"
                aria-label="السابق"
              >
                <ChevronLeft size={32} strokeWidth={1.5} />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

