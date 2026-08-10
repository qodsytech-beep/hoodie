'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getAllProducts } from '@/lib/products'
import ProductCard from './ProductCard'
import { Product } from '@/types'
import ScrollAnimation from './ScrollAnimation'

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    getAllProducts().then(setProducts)
  }, [])

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
       
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <ScrollAnimation key={product.id} delay={index * 0.1}>
              <ProductCard product={product} />
            </ScrollAnimation>
          ))}
        </div>

        <ScrollAnimation delay={0.3}>
          <div className="text-center mt-12">
            <Link
              href="/products"
              className="inline-block text-black hover:text-neutral-700 font-semibold transition"
            >
              عرض الكل
            </Link>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  )
}

