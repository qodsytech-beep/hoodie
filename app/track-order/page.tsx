import { Suspense } from 'react'
import OrderTracking from '@/components/OrderTracking'

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">جاري التحميل...</div>}>
      <OrderTracking />
    </Suspense>
  )
}

