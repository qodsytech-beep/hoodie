'use client'

import { useEffect, useState, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getFeaturedProducts } from '@/lib/products'
import ProductCard from './ProductCard'
import { Product } from '@/types'
import ScrollAnimation from './ScrollAnimation'

export default function FeaturedSlider() {
  const [products, setProducts] = useState<Product[]>([])
  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getFeaturedProducts().then(setProducts)
  }, [])

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

  if (products.length === 0) return null

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <ScrollAnimation>
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-8 text-center">
            المنتجات المميزة
          </h2>
        </ScrollAnimation>

        <div className="relative group" dir="rtl">
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
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-black hover:text-neutral-600 transition-all duration-300 z-10 hover:scale-110 active:scale-95 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 bg-white/80 rounded-full shadow-md w-12 h-12"
                aria-label="التالي"
              >
                <ChevronRight size={32} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => scroll('right')}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-black hover:text-neutral-600 transition-all duration-300 z-10 hover:scale-110 active:scale-95 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 bg-white/80 rounded-full shadow-md w-12 h-12"
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

