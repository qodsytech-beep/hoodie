'use client'

import Link from 'next/link'
import { Heart, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { Product } from '@/types'
import { useCartStore, useWishlistStore } from '@/lib/store'
import { useSiteSettings } from '@/lib/useSiteSettings'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null)
  
  const hasSale = product.originalPrice && product.originalPrice > product.price
  const discount = hasSale
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0

  const addItem = useCartStore(s => s.addItem)
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore()
  const isWished = isInWishlist(product.id)
  
  const settings = useSiteSettings()
  const colorMap = settings?.customColors?.reduce((acc, c) => ({ ...acc, [c.name]: c.hex }), {} as Record<string, string>) || {}

  const currentImage = activeImage || product.images[0] || 'https://via.placeholder.com/400x530'

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!product.inStock) {
      toast.error('المنتج غير متوفر حالياً')
      return
    }
    if (product.sizes.length > 0 && product.colors.length > 0) {
      addItem(product, product.sizes[0], product.colors[0], 1)
      toast.success('✓ تمت الإضافة إلى السلة')
    }
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isWished) {
      removeFromWishlist(product.id)
      toast('تمت الإزالة من المفضلة', { icon: '💔' })
    } else {
      addToWishlist(product)
      toast('تمت الإضافة إلى المفضلة', { icon: '❤️' })
    }
  }

  return (
    <div className="group relative">
      <Link href={`/products/${product.id}`} className="block">
        {/* Image Container */}
        <div className="relative overflow-hidden bg-neutral-100 aspect-[3/4]">
          {/* Images */}
          <img
            src={currentImage}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${!activeImage && product.images[1] ? 'group-hover:opacity-0' : ''}`}
          />
          {!activeImage && product.images[1] && (
            <img
              src={product.images[1]}
              alt={`${product.name} - 2`}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-105"
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
            {!product.inStock && (
              <span className="px-2 py-1 bg-neutral-700 text-white text-xs font-semibold rounded">
                نفد المخزون
              </span>
            )}
            {hasSale && product.inStock && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                -{discount}%
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            aria-label="إضافة للمفضلة"
            className={`absolute top-3 left-3 z-10 w-9 h-9 flex items-center justify-center rounded-full shadow-md transition-all duration-200
              ${isWished ? 'bg-red-500 text-white scale-110' : 'bg-white/90 text-neutral-600 hover:bg-white hover:text-red-500 hover:scale-110 opacity-0 group-hover:opacity-100'}`}
          >
            <Heart size={16} fill={isWished ? 'currentColor' : 'none'} />
          </button>

          {/* Add to Cart Overlay */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`w-full py-3 flex items-center justify-center gap-2 text-sm font-bold transition-colors
                ${product.inStock
                  ? 'bg-black text-white hover:bg-neutral-800'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'}`}
            >
              <ShoppingCart size={16} />
              {product.inStock ? 'أضف إلى السلة' : 'غير متوفر'}
            </button>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="pt-3 pb-1">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-sm font-medium text-neutral-800 mb-1 leading-snug hover:text-neutral-600 transition line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-neutral-900">
              {product.price.toLocaleString()} ج.م
            </span>
            {hasSale && (
              <span className="text-xs text-neutral-400 line-through">
                {product.originalPrice!.toLocaleString()} ج.م
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-2">
            {/* Sizes preview */}
            {product.sizes.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {product.sizes.slice(0, 3).map(size => (
                  <span key={size} className="text-[10px] text-neutral-500 border border-neutral-200 rounded px-1.5 py-0.5 leading-none">
                    {size}
                  </span>
                ))}
                {product.sizes.length > 3 && (
                  <span className="text-[10px] text-neutral-400">+{product.sizes.length - 3}</span>
                )}
              </div>
            )}
            
            {/* Colors preview */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex gap-1 flex-wrap items-center">
                {product.colors.slice(0, 4).map(color => {
                  const hex = colorMap[color.trim()]
                  const targetImg = product.colorImages?.[color]
                  
                  return hex ? (
                    <div
                      key={color}
                      onClick={(e) => {
                        e.preventDefault()
                        if (targetImg) setActiveImage(targetImg)
                      }}
                      onMouseEnter={() => { if (targetImg) setActiveImage(targetImg) }}
                      onMouseLeave={() => setActiveImage(null)}
                      className="w-3.5 h-3.5 rounded-full border border-neutral-200 shadow-sm cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: hex }}
                      title={color}
                    />
                  ) : (
                    <span 
                      key={color} 
                      onClick={(e) => {
                        e.preventDefault()
                        if (targetImg) setActiveImage(targetImg)
                      }}
                      onMouseEnter={() => { if (targetImg) setActiveImage(targetImg) }}
                      onMouseLeave={() => setActiveImage(null)}
                      className="text-[10px] text-neutral-500 bg-neutral-100 rounded px-1.5 py-0.5 leading-none cursor-pointer hover:bg-neutral-200 transition-colors"
                    >
                      {color}
                    </span>
                  )
                })}
                {product.colors.length > 4 && (
                  <span className="text-[10px] text-neutral-400">+{product.colors.length - 4}</span>
                )}
              </div>
            )}
          </div>
        </Link>
      </div>
    </div>
  )
}
