'use client'

import { useEffect, useState } from 'react'
import ProductDetails from '@/components/ProductDetails'
import RelatedProducts from '@/components/RelatedProducts'
import ProductReviews from '@/components/ProductReviews'
import Subscription from '@/components/Subscription'
import { getProductById, getRelatedProducts } from '@/lib/products'
import { Product } from '@/types'

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

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
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg">جاري التحميل...</p>
      </div>
    )
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

