'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { useLanguageStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import CartSkeletonLoader from './CartSkeletonLoader'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore()
  const { language } = useLanguageStore()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading to ensure cart is hydrated
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <CartSkeletonLoader />
  }

  const handleCheckout = () => {
    if (items.length === 0) return
    router.push('/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag size={64} className="mx-auto text-neutral-300 mb-4" />
        <h2 className="text-2xl font-bold mb-4">
          {language === 'ar' ? 'السلة فارغة' : 'Your cart is empty'}
        </h2>
        <p className="text-neutral-500 mb-8">
          {language === 'ar'
            ? 'ابدأ التسوق لإضافة منتجات إلى سلة التسوق'
            : 'Start shopping to add products to your cart'}
        </p>
        <Link
          href="/products"
          className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-neutral-800 transition"
        >
          {language === 'ar' ? 'تسوق الآن' : 'Shop Now'}
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      <h1 className="text-3xl font-bold mb-8 animate-slideInRight">{language === 'ar' ? 'سلة التسوق' : 'Shopping Cart'}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, index) => (
            <div
              key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
              className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row gap-4 animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-full sm:w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-100">
                <img
                  src={item.product.images[0] || 'https://via.placeholder.com/200'}
                  alt={language === 'ar' ? item.product.name : item.product.nameEn || item.product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    {language === 'ar' ? item.product.name : item.product.nameEn || item.product.name}
                  </h3>
                  <div className="text-sm text-neutral-600 space-y-1">
                    <p>
                      {language === 'ar' ? 'المقاس: ' : 'Size: '}
                      <span className="font-medium">{item.selectedSize}</span>
                    </p>
                    <p>
                      {language === 'ar' ? 'اللون: ' : 'Color: '}
                      <span className="font-medium">{item.selectedColor}</span>
                    </p>
                  </div>
                  <p className="text-lg font-bold text-black mt-2">
                    {item.product.price * item.quantity} {language === 'ar' ? 'ج.م' : 'EGP'}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 border border-neutral-300 rounded-lg">
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)
                      }
                      className="p-2 hover:bg-neutral-50 transition"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-2 font-semibold">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)
                      }
                      className="p-2 hover:bg-neutral-50 transition"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() =>
                      removeItem(item.product.id, item.selectedSize, item.selectedColor)
                    }
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6">{language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-neutral-700">
                <span>{language === 'ar' ? 'عدد المنتجات' : 'Items'}</span>
                <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between text-neutral-700">
                <span>{language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span>{getTotal()} {language === 'ar' ? 'ج.م' : 'EGP'}</span>
              </div>
              <div className="border-t border-neutral-200 pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>{language === 'ar' ? 'المجموع الكلي' : 'Total'}</span>
                  <span className="text-black">
                    {getTotal()} {language === 'ar' ? 'ج.م' : 'EGP'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full px-6 py-4 bg-black text-white rounded-lg font-semibold hover:bg-neutral-800 transition mb-4"
            >
              {language === 'ar' ? 'إتمام الطلب' : 'Proceed to Checkout'}
            </button>

            <Link
              href="/products"
              className="flex items-center justify-center gap-2 text-neutral-600 hover:text-neutral-900 transition"
            >
              <ArrowLeft size={18} />
              {language === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

