'use client'

import { useEffect, useState } from 'react'
import ProductDetails from '@/components/ProductDetails'
import RelatedProducts from '@/components/RelatedProducts'
import ProductReviews from '@/components/ProductReviews'
import Subscription from '@/components/Subscription'
import { getProductById, getRelatedProducts } from '@/lib/products'
import { Product } from '@/types'

import { useSiteSettings } from '@/lib/useSiteSettings'

function ProductDetailsSkeleton() {
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Images Skeleton */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="aspect-square bg-slate-100 rounded-xl mb-3 animate-pulse" />
            <div className="flex gap-2 pb-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-20 h-20 bg-slate-100 rounded-lg animate-pulse flex-shrink-0" />
              ))}
            </div>
          </div>

          {/* Details Skeleton */}
          <div>
            <div className="w-1/3 h-4 bg-slate-100 rounded mb-4 animate-pulse" />
            <div className="w-20 h-3 bg-slate-100 rounded mb-2 animate-pulse" />
            <div className="w-3/4 h-8 bg-slate-100 rounded mb-4 animate-pulse" />
            <div className="w-1/2 h-4 bg-slate-100 rounded mb-6 animate-pulse" />
            <div className="w-1/3 h-8 bg-slate-100 rounded mb-6 animate-pulse" />
            
            <div className="w-full h-12 bg-slate-50 rounded-xl mb-6 animate-pulse" />
            
            <div className="mb-6">
              <div className="w-16 h-4 bg-slate-100 rounded mb-3 animate-pulse" />
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => <div key={i} className="w-14 h-11 bg-slate-100 rounded-lg animate-pulse" />)}
              </div>
            </div>

            <div className="mb-6">
              <div className="w-16 h-4 bg-slate-100 rounded mb-3 animate-pulse" />
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => <div key={i} className="w-8 h-8 bg-slate-100 rounded-full animate-pulse" />)}
              </div>
            </div>

            <div className="mb-6">
              <div className="w-16 h-4 bg-slate-100 rounded mb-3 animate-pulse" />
              <div className="w-32 h-11 bg-slate-100 rounded-xl animate-pulse" />
            </div>

            <div className="flex gap-3 mb-4">
              <div className="flex-1 h-14 bg-slate-100 rounded-xl animate-pulse" />
              <div className="flex-1 h-14 bg-slate-200 rounded-xl animate-pulse" />
            </div>
            
            <div className="w-full h-24 bg-slate-50 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const settings = useSiteSettings()

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const productData = await getProductById(params.id)
        setProduct(productData)
        if (productData) {
          const related = await getRelatedProducts(productData.category, params.id)
          setRelatedProducts(related)
        }
      } catch (error) {
        console.error('Error loading product:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [params.id])
  
  if (loading || !settings) {
    return <ProductDetailsSkeleton />
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">المنتج غير موجود</h1>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <ProductDetails product={product} />
      <RelatedProducts products={relatedProducts} />
      <div id="reviews-section">
        <ProductReviews productId={product.id} />
      </div>
      <Subscription />
    </div>
  )
}

