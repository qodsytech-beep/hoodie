'use client'

import { useState, useEffect } from 'react'
import { useCartStore } from '@/lib/store'
import { useLanguageStore } from '@/lib/store'
import { createOrder } from '@/lib/cart'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { CheckCircle, HelpCircle } from 'lucide-react'
import { governorates, cities } from '@/lib/governorates'
import { storage } from '@/lib/storage'
import { siteSettings } from '@/lib/siteSettings'
import SkeletonLoader from './SkeletonLoader'

// التحقق من رقم الهاتف المصري
function isValidEgyptianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s|-/g, '')
  return /^(010|011|012|015)\d{8}$/.test(cleaned)
}

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore()
  const { language } = useLanguageStore()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')

  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    governorate: '',
    postalCode: '',
    phone: '',
    paymentMethod: 'cod' as 'cod' | 'online',
    saveData: false,
    subscribeToNews: false,
  })

  useEffect(() => {
    // تحميل البيانات المحفوظة
    const savedData = storage.getCustomerData()
    if (savedData) {
      setFormData({
        email: savedData.email || '',
        firstName: savedData.firstName || '',
        lastName: savedData.lastName || '',
        address: savedData.address || '',
        city: savedData.city || '',
        governorate: savedData.governorate || '',
        postalCode: savedData.postalCode || '',
        phone: savedData.phone || '',
        paymentMethod: savedData.paymentMethod || 'cod',
        saveData: true,
        subscribeToNews: savedData.subscribeToNews || false,
      })

    }

    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <SkeletonLoader />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      toast.error(language === 'ar' ? 'السلة فارغة' : 'Cart is empty')
      return
    }

    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.address || !formData.city || !formData.governorate) {
      toast.error(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields')
      return
    }

    if (!isValidEgyptianPhone(formData.phone)) {
      toast.error(language === 'ar' ? 'رقم الهاتف غير صحيح (يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015)' : 'Invalid phone number (must start with 010, 011, 012 or 015)')
      return
    }

    setIsSubmitting(true)

    try {

      const fullAddress = `${formData.address}, ${formData.city}, ${formData.governorate}, مصر`
      const customerName = `${formData.firstName} ${formData.lastName}`
      
      const order = await createOrder({
        customerName: customerName,
        phone: formData.phone,
        address: fullAddress,
        items: items,
        total: getTotal(),
        paymentMethod: formData.paymentMethod,
      })



      // حفظ بيانات المستخدم إذا طلب ذلك
      if (formData.saveData) {
        const customerDataToSave = {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          governorate: formData.governorate,
          postalCode: formData.postalCode,
          phone: formData.phone,
          paymentMethod: formData.paymentMethod,
          subscribeToNews: formData.subscribeToNews,
        }
        storage.saveCustomerData(customerDataToSave)
        toast.success(language === 'ar' ? 'تم حفظ بياناتك للمرات القادمة' : 'Your data has been saved for future orders')
      } else {
        // إذا لم يطلب الحفظ، احذف البيانات القديمة
        storage.clearCustomerData()
      }

      // حفظ آخر رقم طلب لتتبعه تلقائياً
      storage.saveLastOrderNumber(order.orderNumber)

      setOrderNumber(order.orderNumber)
      setOrderComplete(true)
      clearCart()
      toast.success(language === 'ar' ? 'تم إتمام الطلب بنجاح!' : 'Order completed successfully!')
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error(language === 'ar' ? 'حدث خطأ، يرجى المحاولة مرة أخرى' : 'An error occurred, please try again')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-green-50 rounded-lg p-8 mb-8">
            <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
            <h2 className="text-3xl font-bold mb-4 text-green-800">
              {language === 'ar' ? 'شكراً لطلبك!' : 'Thank you for your order!'}
            </h2>
            <p className="text-lg text-green-700 mb-4">
              {language === 'ar'
                ? 'تم استلام طلبك بنجاح وسيتم التواصل معك قريباً'
                : 'Your order has been received and we will contact you soon'}
            </p>
            <div className="bg-white rounded-lg p-6 mt-6">
              <p className="text-sm text-neutral-600 mb-2">
                {language === 'ar' ? 'رقم الطلب:' : 'Order Number:'}
              </p>
              <p className="text-2xl font-bold text-black mb-4">{orderNumber}</p>
              <a
                href="/track-order"
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-neutral-800 transition"
              >
                {language === 'ar' ? 'تتبع طلبك' : 'Track Your Order'}
              </a>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/products')}
              className="px-8 py-4 bg-neutral-200 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-300 transition"
            >
              {language === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
            </button>
            <a
              href="/track-order"
              className="px-8 py-4 bg-black text-white rounded-lg font-semibold hover:bg-neutral-800 transition inline-flex items-center"
            >
              {language === 'ar' ? 'تتبع الطلب' : 'Track Order'}
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      <h1 className="text-3xl font-bold mb-8 animate-slideInRight">{language === 'ar' ? 'إتمام الطلب' : 'Checkout'}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Form */}
        <div className="lg:col-span-2">


          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6 animate-scaleIn">
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">
                * {language === 'ar' ? 'يرجى توضيح عنوانك قدر الإمكان' : 'Please clarify your address as much as possible'}
              </h3>
            </div>

            {/* Email/Mobile */}
            <div>
              <input
                type="text"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder={language === 'ar' ? 'رقم الموبايل أو الايميل' : 'Mobile number or Email'}
              />
              <label className="flex items-center mt-2 text-sm text-neutral-600">
                <input
                  type="checkbox"
                  checked={formData.subscribeToNews}
                  onChange={(e) => setFormData({ ...formData, subscribeToNews: e.target.checked })}
                  className="ml-2"
                />
                <span>{language === 'ar' ? 'ابقني مطلع عن طريق الايميل و الرسائل القصيرة علي اخر العروض و الاخبار' : 'Keep me updated via email and SMS on the latest offers and news'}</span>
              </label>
            </div>

            {/* Delivery Section */}
            <div>
              <h3 className="text-xl font-bold mb-4">{language === 'ar' ? 'Delivery' : 'Delivery'}</h3>
              
              {/* Country */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">
                  {language === 'ar' ? 'الدولة' : 'Country'}
                </label>
                <div className="w-full px-4 py-3 bg-neutral-100 border border-neutral-300 rounded-lg">
                  مصر
                </div>
              </div>

              {/* First Name and Last Name */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-cairo"
                    placeholder={language === 'ar' ? 'الأسم الأول' : 'First Name'}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-cairo"
                    placeholder={language === 'ar' ? 'الأسم الثاني' : 'Last Name'}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="mb-4">
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-cairo"
                  placeholder={language === 'ar' ? 'العنوان: المنطقة أو الحي أو القرية + اسم الشارع و علامة مميزة' : 'Address: Region or District or Village + Street name and a distinctive landmark'}
                />
              </div>

              {/* City, Governorate, Postal Code */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-cairo"
                    placeholder={language === 'ar' ? 'المدينة' : 'City'}
                  />
                </div>
                <div>
                  <select
                    required
                    value={formData.governorate}
                    onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-cairo"
                  >
                    <option value="">{language === 'ar' ? 'المحافظة' : 'Governorate'}</option>
                    {governorates.map((gov) => (
                      <option key={gov} value={gov}>
                        {gov}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-cairo"
                    placeholder={language === 'ar' ? 'الرمز البريدي أو أكتب ...' : 'Postal code or type ...'}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 pr-12 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-cairo"
                    placeholder={language === 'ar' ? 'رقم الموبايل' : 'Mobile number'}
                  />
                  <HelpCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                </div>
              </div>
            </div>

            {/* Save Data Checkbox */}
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.saveData}
                  onChange={(e) => {
                    const shouldSave = e.target.checked
                    setFormData({ ...formData, saveData: shouldSave })
                    
                    if (!shouldSave) {
                      // إذا تم إلغاء التحديد، احذف البيانات المحفوظة
                      storage.clearCustomerData()
                      toast.success(language === 'ar' ? 'تم حذف البيانات المحفوظة' : 'Saved data cleared')
                    }
                  }}
                  className="mt-1 w-5 h-5 text-black border-neutral-300 rounded focus:ring-black cursor-pointer"
                />
                <div className="flex-1">
                  <span className="font-semibold text-neutral-900 block mb-1">
                    {language === 'ar' ? 'احفظ بياناتي للمرات القادمة' : 'Save my data for next times'}
                  </span>
                  <p className="text-xs text-neutral-600">
                    {language === 'ar' 
                      ? 'سيتم حفظ معلوماتك (الاسم، العنوان، الهاتف) لتعبئة النموذج تلقائياً في المرة القادمة'
                      : 'Your information (name, address, phone) will be saved to auto-fill the form next time'}
                  </p>
                </div>
              </label>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-semibold mb-4">
                {language === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
              </label>
              <div className="space-y-3">
                {(() => {
                  const methods = (siteSettings.get().paymentMethods || []).filter(m => m.enabled)
                  if (methods.length === 0) {
                    return (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                        ⚠️ لا توجد وسائل دفع متاحة حالياً
                      </div>
                    )
                  }
                  return methods.map(method => (
                    <label key={method.id} className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition ${
                      formData.paymentMethod === method.id
                        ? 'border-black bg-slate-50'
                        : 'border-neutral-200 hover:border-neutral-400'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={formData.paymentMethod === method.id}
                        onChange={() => setFormData({ ...formData, paymentMethod: method.id as any })}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{method.icon}</span>
                          <span className="font-bold text-neutral-900">{method.name}</span>
                        </div>
                        <p className="text-sm text-neutral-500 mt-0.5">{method.description}</p>
                        {method.instructions && formData.paymentMethod === method.id && (
                          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-xs text-blue-700 leading-relaxed">{method.instructions}</p>
                          </div>
                        )}
                      </div>
                    </label>
                  ))
                })()}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-4 bg-black text-white rounded-lg font-semibold hover:bg-neutral-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? language === 'ar'
                  ? 'جاري المعالجة...'
                  : 'Processing...'
                : language === 'ar'
                ? 'استكمال الدفع'
                : 'Complete Payment'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6">{language === 'ar' ? 'ملخص الطلب' : 'Order Summary'}</h2>

            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.selectedSize}`} className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                    <img
                      src={item.product.images[0] || 'https://via.placeholder.com/100'}
                      alt={language === 'ar' ? item.product.name : item.product.nameEn || item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {language === 'ar' ? item.product.name : item.product.nameEn || item.product.name}
                    </p>
                    <p className="text-xs text-neutral-600">
                      {item.selectedSize} - {item.selectedColor} x {item.quantity}
                    </p>
                    <p className="text-sm font-semibold text-black">
                      {item.product.price * item.quantity} {language === 'ar' ? 'ج.م' : 'EGP'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-200 pt-4">
              <div className="flex justify-between text-xl font-bold mb-4">
                <span>{language === 'ar' ? 'المجموع الكلي' : 'Total'}</span>
                <span className="text-black">
                  {getTotal()} {language === 'ar' ? 'ج.م' : 'EGP'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

