'use client'

import { useEffect, useState } from 'react'
import { storage } from '@/lib/storage'
import { useRouter } from 'next/navigation'

export default function ResetProductsPage() {
  const [status, setStatus] = useState<'idle' | 'resetting' | 'success' | 'error'>('idle')
  const router = useRouter()

  const handleReset = () => {
    setStatus('resetting')
    try {
      storage.resetProducts()
      setStatus('success')
      setTimeout(() => {
        router.push('/products')
      }, 2000)
    } catch (error) {
      console.error('Error resetting products:', error)
      setStatus('error')
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">إعادة تعيين المنتجات</h1>
        <p className="text-neutral-600 mb-6 text-center">
          سيتم حذف جميع المنتجات الحالية واستبدالها بالمنتجات الافتراضية الجديدة
        </p>
        
        {status === 'idle' && (
          <button
            onClick={handleReset}
            className="w-full py-3 bg-black text-white font-semibold hover:bg-neutral-800 transition"
          >
            إعادة التعيين
          </button>
        )}
        
        {status === 'resetting' && (
          <div className="text-center py-4">
            <p className="text-neutral-600">جاري إعادة التعيين...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center py-4">
            <p className="text-green-600 font-semibold">تم إعادة التعيين بنجاح!</p>
            <p className="text-sm text-neutral-600 mt-2">سيتم إعادة التوجيه...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center py-4">
            <p className="text-red-600 font-semibold">حدث خطأ أثناء إعادة التعيين</p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-4 px-4 py-2 bg-neutral-200 text-black rounded hover:bg-neutral-300 transition"
            >
              المحاولة مرة أخرى
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

