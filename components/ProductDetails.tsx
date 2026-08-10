'use client'

import { useState, useEffect } from 'react'
import { Minus, Plus, Star, Share2, Package, Heart, ShoppingCart, Truck, RotateCcw, Shield } from 'lucide-react'
import { Product } from '@/types'
import { useCartStore, useWishlistStore } from '@/lib/store'
import { reviewsDB } from '@/lib/reviews'
import { useSiteSettings } from '@/lib/useSiteSettings'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface ProductDetailsProps {
  product: Product
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || '')
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || '')
  const [quantity, setQuantity] = useState(1)
  const [reviewStats, setReviewStats] = useState({ avg: 0, count: 0 })
  const [imgZoomed, setImgZoomed] = useState(false)

  const addItem = useCartStore(s => s.addItem)
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore()
  const isWished = isInWishlist(product.id)
  const settings = useSiteSettings()

  // Update selected image when color changes
  useEffect(() => {
    if (product.colorImages && selectedColor && product.colorImages[selectedColor]) {
      const imgUrl = product.colorImages[selectedColor]
      const index = product.images.findIndex(img => img === imgUrl)
      if (index !== -1) {
        setSelectedImage(index)
      }
    }
  }, [selectedColor, product.colorImages, product.images])

  useEffect(() => {
    const stats = reviewsDB.getStats(product.id)
    setReviewStats({ avg: stats.avg, count: stats.count })
  }, [product.id])

  if (!settings) return null

  const hasSale = product.originalPrice && product.originalPrice > product.price
  const discountPct = hasSale
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0

  const shippingFee = settings.shippingFee || 0
  const freeThreshold = settings.freeShippingThreshold || 0

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes.length > 0) { toast.error('يرجى اختيار المقاس'); return }
    if (!product.inStock) { toast.error('المنتج غير متوفر حالياً'); return }
    addItem(product, selectedSize, selectedColor, quantity)
    toast.success(`✓ تمت الإضافة إلى السلة (${quantity} قطعة)`)
  }

  const handleBuyNow = () => {
    if (!selectedSize && product.sizes.length > 0) { toast.error('يرجى اختيار المقاس'); return }
    if (!product.inStock) { toast.error('المنتج غير متوفر حالياً'); return }
    addItem(product, selectedSize, selectedColor, quantity)
    window.location.href = '/checkout'
  }

  const handleWishlist = () => {
    if (isWished) { removeFromWishlist(product.id); toast('تمت الإزالة من المفضلة', { icon: '💔' }) }
    else { addToWishlist(product); toast('تمت الإضافة إلى المفضلة', { icon: '❤️' }) }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, text: product.description, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('تم نسخ الرابط')
    }
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">

          {/* ──── Images ──── */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <style>{`@keyframes imageFade { from { opacity: 0.4; } to { opacity: 1; } }`}</style>
            {/* Main Image */}
            <div
              className={`relative aspect-square mb-3 overflow-hidden bg-neutral-100 cursor-zoom-in rounded-xl ${imgZoomed ? 'cursor-zoom-out' : ''}`}
              onClick={() => setImgZoomed(!imgZoomed)}
            >
              <img
                key={selectedImage}
                src={product.images[selectedImage] || 'https://via.placeholder.com/600'}
                alt={product.name}
                style={{ animation: 'imageFade 0.4s ease-out' }}
                className={`w-full h-full object-cover transition-transform duration-500 ${imgZoomed ? 'scale-150' : 'scale-100'}`}
              />
              {/* Out of stock overlay */}
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-white text-black font-bold px-4 py-2 rounded-xl text-sm">نفد المخزون</span>
                </div>
              )}
              {/* Discount badge */}
              {hasSale && (
                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                  -{discountPct}%
                </div>
              )}
              {/* Wishlist */}
              <button
                onClick={e => { e.stopPropagation(); handleWishlist() }}
                className={`absolute top-3 left-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition ${
                  isWished ? 'bg-red-500 text-white' : 'bg-white text-neutral-500 hover:text-red-500'
                }`}
              >
                <Heart size={16} fill={isWished ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-20 h-20 overflow-hidden rounded-lg border-2 transition ${
                      selectedImage === i ? 'border-black' : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ──── Details ──── */}
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-neutral-400 mb-3">
              <Link href="/" className="hover:text-black transition">الرئيسية</Link>
              <span>/</span>
              <Link href="/products" className="hover:text-black transition">المنتجات</Link>
              <span>/</span>
              <span className="text-neutral-600">{product.name}</span>
            </div>

            <p className="text-sm font-semibold text-neutral-400 uppercase tracking-widest mb-2">{settings.storeName}</p>
            <h1 className="text-3xl font-bold text-black mb-3 leading-snug">{product.name}</h1>

            {/* Rating Stars — Real from reviews */}
            <button
              onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 mb-5 group"
            >
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={16} className={`transition-colors ${s <= Math.round(reviewStats.avg) ? 'text-amber-400 fill-amber-400' : 'text-neutral-200 fill-neutral-200'}`} />
                ))}
              </div>
              <span className="text-sm text-neutral-500 group-hover:text-black transition">
                {reviewStats.count > 0 ? `${reviewStats.avg} (${reviewStats.count} مراجعة)` : 'لا توجد مراجعات بعد'}
              </span>
            </button>

            {/* Price */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-3xl font-bold text-black">{product.price.toLocaleString()} {settings.currency}</span>
              {hasSale && (
                <>
                  <span className="text-xl text-neutral-400 line-through">{product.originalPrice!.toLocaleString()} {settings.currency}</span>
                  <span className="px-2.5 py-1 bg-red-100 text-red-600 text-sm font-bold rounded-lg">وفّر {(product.originalPrice! - product.price).toLocaleString()} {settings.currency}</span>
                </>
              )}
            </div>

            {/* Shipping note */}
            <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6 p-3 bg-slate-50 rounded-xl">
              <Truck size={16} className="text-neutral-400 flex-shrink-0" />
              <span>
                {shippingFee === 0
                  ? 'شحن مجاني لجميع الطلبات'
                  : settings.freeShippingThreshold > 0
                    ? `رسوم الشحن ${shippingFee} ${settings.currency || 'ج.م'} • مجاني عند تجاوز ${settings.freeShippingThreshold.toLocaleString()} ${settings.currency || 'ج.م'}`
                    : `رسوم الشحن ${shippingFee} ${settings.currency || 'ج.م'}`}
              </span>
            </div>

            {/* Size Selection */}
            {product.sizes.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-black">المقاس</label>
                  <span className="text-sm text-neutral-500 font-medium bg-neutral-100 px-2 py-0.5 rounded">{selectedSize}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[52px] h-11 px-3 border-2 text-sm font-semibold transition rounded-lg ${
                        selectedSize === size
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-neutral-200 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-bold text-black mb-2">اللون: <span className="font-normal text-neutral-500">{selectedColor || 'اختر اللون'}</span></label>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map(color => {
                    const colorMap = settings?.customColors?.reduce((acc, c) => ({ ...acc, [c.name]: c.hex }), {} as Record<string, string>) || {}
                    const hex = colorMap[color.trim()]
                    return hex ? (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        title={color}
                        className={`w-8 h-8 rounded-full border-2 transition ${selectedColor === color ? 'border-black scale-110' : 'border-neutral-200 hover:border-neutral-500'}`}
                        style={{ background: hex }}
                      />
                    ) : (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 h-8 border-2 text-xs font-semibold transition rounded-lg ${
                          selectedColor === color
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-black border-neutral-200 hover:border-black'
                        }`}
                      >
                        {color}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-black mb-2">الكمية</label>
              <div className="flex items-center gap-0 border-2 border-neutral-200 w-fit rounded-xl overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-11 h-11 flex items-center justify-center hover:bg-neutral-100 transition text-xl font-bold">−</button>
                <span className="w-12 text-center text-base font-bold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-11 h-11 flex items-center justify-center hover:bg-neutral-100 transition text-xl font-bold">+</button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 border-2 border-black text-black font-bold rounded-xl hover:bg-black hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={18} />
                {product.inStock ? 'أضف للسلة' : 'غير متوفر'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="flex-1 py-3.5 bg-black text-white font-bold rounded-xl hover:bg-neutral-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                اشترِ الآن
              </button>
            </div>

            {/* Wishlist + Share */}
            <div className="flex gap-3 mb-8">
              <button onClick={handleWishlist} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition ${isWished ? 'bg-red-50 text-red-600 border-red-200' : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'}`}>
                <Heart size={15} fill={isWished ? 'currentColor' : 'none'} />
                {isWished ? 'في المفضلة' : 'أضف للمفضلة'}
              </button>
              <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 text-sm font-semibold hover:border-neutral-400 transition">
                <Share2 size={15} />
                مشاركة
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mb-8 p-4 bg-slate-50 rounded-2xl">
              {[
                { icon: Truck, text: 'توصيل سريع', sub: 'لجميع المحافظات' },
                { icon: RotateCcw, text: 'إرجاع مجاني', sub: 'خلال 14 يوم' },
                { icon: Shield, text: 'دفع آمن', sub: '100% مضمون' },
              ].map(b => {
                const Icon = b.icon
                return (
                  <div key={b.text} className="text-center">
                    <Icon size={20} className="mx-auto mb-1 text-neutral-700" />
                    <p className="text-xs font-bold text-neutral-800">{b.text}</p>
                    <p className="text-xs text-neutral-400">{b.sub}</p>
                  </div>
                )
              })}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-black mb-3">الوصف</h2>
              <p className="text-neutral-600 leading-relaxed text-sm">
                {product.description || 'منتج عالي الجودة، مصنوع من أفضل الخامات.'}
              </p>
            </div>

            {/* Details */}
            {(product.material || product.country) && (
              <div className="mb-6 border border-slate-100 rounded-xl divide-y divide-slate-100">
                {[
                  { label: 'الخامة', value: product.material },
                  { label: 'بلد المنشأ', value: product.country },
                  { label: 'الفئة', value: product.category },
                ].filter(r => r.value).map(row => (
                  <div key={row.label} className="flex justify-between px-4 py-3 text-sm">
                    <span className="text-neutral-500">{row.label}</span>
                    <span className="font-medium text-neutral-800">{row.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Track order */}
            <Link href="/track-order" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-black transition">
              <Package size={15} />
              تتبع طلبك
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
