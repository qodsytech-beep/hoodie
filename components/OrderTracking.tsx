'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Package, CheckCircle, Clock, Truck, XCircle } from 'lucide-react'
import { getOrderById } from '@/lib/cart'
import { Order } from '@/types'
import { useLanguageStore } from '@/lib/store'
import toast from 'react-hot-toast'

export default function OrderTracking() {
  const searchParams = useSearchParams()
  const [orderNumber, setOrderNumber] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const { language } = useLanguageStore()

  // دالة مشتركة للبحث عن الطلب
  const searchForOrder = async (orderNum: string) => {
    if (!orderNum.trim() || typeof window === 'undefined') return null

    setLoading(true)
    try {
      const normalizedOrderNum = orderNum.trim().toUpperCase()
      console.log('🔍 Searching for order:', normalizedOrderNum)
      
      // انتظار بسيط لضمان تحميل localStorage
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const allOrders = await import('@/lib/cart').then(m => m.getAllOrders())
      console.log('📦 Total orders in storage:', allOrders.length)
      console.log('📋 Order numbers:', allOrders.map(o => o.orderNumber))
      
      const foundOrder = allOrders.find(o => o.orderNumber === normalizedOrderNum)
      
      if (foundOrder) {
        console.log('✅ Order found:', foundOrder.orderNumber, 'Status:', foundOrder.status)
        setOrder(foundOrder)
        return foundOrder
      } else {
        console.log('❌ Order not found:', normalizedOrderNum)
        setOrder(null)
        return null
      }
    } catch (error) {
      console.error('❌ Error searching order:', error)
      setOrder(null)
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // تحميل رقم الطلب من URL أو آخر طلب محفوظ
    const loadOrder = async () => {
      if (typeof window === 'undefined') {
        setInitialLoad(false)
        return
      }
      
      // أولوية لرقم الطلب في URL
      const orderFromUrl = searchParams?.get('order')
      let orderNumToSearch = orderFromUrl
      
      // إذا لم يكن هناك رقم في URL، جرب آخر طلب محفوظ
      if (!orderNumToSearch) {
        const { storage } = await import('@/lib/storage')
        const lastOrderNumber = storage.getLastOrderNumber()
        if (lastOrderNumber) {
          console.log('📋 Found last order number:', lastOrderNumber)
          orderNumToSearch = lastOrderNumber
        }
      }
      
      if (orderNumToSearch) {
        const normalizedOrderNum = orderNumToSearch.trim().toUpperCase()
        setOrderNumber(normalizedOrderNum)
        
        // البحث تلقائياً بعد تأخير بسيط لضمان تحميل localStorage
        setTimeout(async () => {
          await searchForOrder(normalizedOrderNum)
          setInitialLoad(false)
        }, 300)
      } else {
        setInitialLoad(false)
      }
    }
    
    loadOrder()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!orderNumber.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال رقم الطلب' : 'Please enter order number')
      return
    }

    const normalizedOrderNum = orderNumber.trim().toUpperCase()
    const foundOrder = await searchForOrder(normalizedOrderNum)
    
    if (foundOrder) {
      // حفظ رقم الطلب في URL للوصول السريع
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', `/track-order?order=${normalizedOrderNum}`)
      }
      toast.success(language === 'ar' ? 'تم العثور على الطلب' : 'Order found')
    } else {
      toast.error(language === 'ar' ? 'لم يتم العثور على الطلب' : 'Order not found')
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-500" size={24} />
      case 'confirmed':
        return <CheckCircle className="text-blue-500" size={24} />
      case 'shipped':
        return <Truck className="text-black" size={24} />
      case 'delivered':
        return <CheckCircle className="text-green-500" size={24} />
      case 'cancelled':
        return <XCircle className="text-red-500" size={24} />
      default:
        return <Package className="text-neutral-500" size={24} />
    }
  }

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return language === 'ar' ? 'قيد الانتظار' : 'Pending'
      case 'confirmed':
        return language === 'ar' ? 'تم التأكيد' : 'Confirmed'
      case 'shipped':
        return language === 'ar' ? 'تم الشحن' : 'Shipped'
      case 'delivered':
        return language === 'ar' ? 'تم التسليم' : 'Delivered'
      case 'cancelled':
        return language === 'ar' ? 'ملغي' : 'Cancelled'
      default:
        return status
    }
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'shipped':
        return 'bg-neutral-100 text-black border-black'
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-300'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center animate-slideInRight">
          {language === 'ar' ? 'تتبع طلبك' : 'Track Your Order'}
        </h1>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 animate-scaleIn">
          {!order && !loading && (
            <div className="mb-4 p-4 bg-neutral-50 rounded-lg border border-primary-200">
              <p className="text-sm text-black">
                {language === 'ar' 
                  ? '📦 يتم عرض آخر طلب لك تلقائياً إذا كان متاحاً. يمكنك البحث عن طلب آخر باستخدام رقم الطلب أدناه.'
                  : '📦 Your last order will be displayed automatically if available. You can search for another order using the order number below.'}
              </p>
            </div>
          )}
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                placeholder={language === 'ar' ? 'أدخل رقم الطلب (مثال: TOKO-12345678)' : 'Enter order number (e.g., TOKO-12345678)'}
                className="w-full px-4 py-3 pr-12 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-cairo"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-neutral-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{language === 'ar' ? 'جاري البحث...' : 'Searching...'}</span>
                </>
              ) : (
                <>
                  <Search size={20} />
                  <span>{language === 'ar' ? 'بحث' : 'Search'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Details */}
        {order && !loading && (
          <div className="space-y-6 animate-fadeIn" key={order.id}>
            {/* Order Status Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold mb-2">
                    {language === 'ar' ? 'رقم الطلب' : 'Order Number'}
                  </h2>
                  <p className="text-2xl font-bold text-black">{order.orderNumber}</p>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="font-semibold">{getStatusText(order.status)}</span>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="border-t border-neutral-200 pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  {language === 'ar' ? 'حالة الطلب' : 'Order Status'}
                </h3>
                <div className="relative">
                  <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-neutral-200"></div>
                  <div className="space-y-6 relative">
                    {[
                      { status: 'pending', label: language === 'ar' ? 'قيد الانتظار' : 'Pending', description: language === 'ar' ? 'طلبك قيد المراجعة' : 'Your order is being reviewed' },
                      { status: 'confirmed', label: language === 'ar' ? 'تم التأكيد' : 'Confirmed', description: language === 'ar' ? 'تم تأكيد طلبك' : 'Your order has been confirmed' },
                      { status: 'shipped', label: language === 'ar' ? 'تم الشحن' : 'Shipped', description: language === 'ar' ? 'تم شحن طلبك' : 'Your order has been shipped' },
                      { status: 'delivered', label: language === 'ar' ? 'تم التسليم' : 'Delivered', description: language === 'ar' ? 'تم تسليم طلبك' : 'Your order has been delivered' },
                    ].map((step, index) => {
                      const isActive = getStatusIndex(order.status) >= index
                      const isCurrent = getStatusIndex(order.status) === index
                      
                      return (
                        <div key={step.status} className="flex items-start gap-4 relative">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                            isActive 
                              ? isCurrent
                                ? 'bg-black border-primary-600 text-white'
                                : 'bg-green-500 border-green-500 text-white'
                              : 'bg-white border-neutral-300 text-neutral-400'
                          }`}>
                            {isActive ? (
                              <CheckCircle size={20} />
                            ) : (
                              <div className="w-3 h-3 rounded-full bg-current"></div>
                            )}
                          </div>
                          <div className="flex-1 pt-1">
                            <p className={`font-semibold ${isActive ? 'text-neutral-900' : 'text-neutral-400'}`}>
                              {step.label}
                            </p>
                            <p className={`text-sm ${isActive ? 'text-neutral-600' : 'text-neutral-400'}`}>
                              {step.description}
                            </p>
                            {isCurrent && (
                              <p className="text-xs text-black mt-1">
                                {language === 'ar' ? 'الحالة الحالية' : 'Current Status'}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {language === 'ar' ? 'معلومات العميل' : 'Customer Information'}
                </h3>
                <div className="space-y-3 text-neutral-700">
                  <div>
                    <span className="font-semibold">{language === 'ar' ? 'الاسم: ' : 'Name: '}</span>
                    <span>{order.customerName}</span>
                  </div>
                  <div>
                    <span className="font-semibold">{language === 'ar' ? 'رقم الهاتف: ' : 'Phone: '}</span>
                    <span>{order.phone}</span>
                  </div>
                  <div>
                    <span className="font-semibold">{language === 'ar' ? 'العنوان: ' : 'Address: '}</span>
                    <span className="block mt-1">{order.address}</span>
                  </div>
                  <div>
                    <span className="font-semibold">{language === 'ar' ? 'طريقة الدفع: ' : 'Payment: '}</span>
                    <span>{order.paymentMethod === 'cod' ? (language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery') : (language === 'ar' ? 'دفع إلكتروني' : 'Online Payment')}</span>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-neutral-700">
                    <span>{language === 'ar' ? 'عدد المنتجات' : 'Items'}</span>
                    <span>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-700">
                    <span>{language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <span>{order.total} {language === 'ar' ? 'ج.م' : 'EGP'}</span>
                  </div>
                  <div className="border-t border-neutral-200 pt-3">
                    <div className="flex justify-between text-xl font-bold">
                      <span>{language === 'ar' ? 'المجموع الكلي' : 'Total'}</span>
                      <span className="text-black">{order.total} {language === 'ar' ? 'ج.م' : 'EGP'}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-neutral-200">
                    <div className="text-sm text-neutral-600">
                      <span>{language === 'ar' ? 'تاريخ الطلب: ' : 'Order Date: '}</span>
                      <span>{new Date(order.createdAt).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">
                {language === 'ar' ? 'المنتجات' : 'Products'}
              </h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b border-neutral-200 last:border-0">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                      <img
                        src={item.product.images[0] || 'https://via.placeholder.com/100'}
                        alt={language === 'ar' ? item.product.name : item.product.nameEn || item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">
                        {language === 'ar' ? item.product.name : item.product.nameEn || item.product.name}
                      </h4>
                      <p className="text-sm text-neutral-600 mb-2">
                        {language === 'ar' ? 'المقاس: ' : 'Size: '}{item.selectedSize} | {language === 'ar' ? 'اللون: ' : 'Color: '}{item.selectedColor} | {language === 'ar' ? 'الكمية: ' : 'Quantity: '}{item.quantity}
                      </p>
                      <p className="font-semibold text-black">
                        {item.product.price * item.quantity} {language === 'ar' ? 'ج.م' : 'EGP'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!order && !loading && orderNumber && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center animate-fadeIn">
            <Package size={64} className="mx-auto text-neutral-300 mb-4" />
            <h3 className="text-xl font-bold mb-2">
              {language === 'ar' ? 'لم يتم العثور على الطلب' : 'Order Not Found'}
            </h3>
            <p className="text-neutral-600 mb-4">
              {language === 'ar' 
                ? 'يرجى التحقق من رقم الطلب والمحاولة مرة أخرى'
                : 'Please check the order number and try again'}
            </p>
            <button
              onClick={() => handleSearch()}
              className="px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-neutral-800 transition"
            >
              {language === 'ar' ? 'إعادة البحث' : 'Search Again'}
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center animate-fadeIn">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-600">
              {language === 'ar' ? 'جاري البحث عن الطلب...' : 'Searching for order...'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function getStatusIndex(status: Order['status']): number {
  switch (status) {
    case 'pending':
      return 0
    case 'confirmed':
      return 1
    case 'shipped':
      return 2
    case 'delivered':
      return 3
    case 'cancelled':
      return -1
    default:
      return 0
  }
}

