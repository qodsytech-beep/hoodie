'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useLanguageStore } from '@/lib/store'

export default function Offers() {
  const { language } = useLanguageStore()

  return (
    <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {language === 'ar' ? 'عروض خاصة محدودة!' : 'Limited Special Offers!'}
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            {language === 'ar'
              ? 'احصل على خصم حتى 50% على مجموعاتنا الجديدة'
              : 'Get up to 50% off on our new collections'}
          </p>
          <Link
            href="/products?offers=true"
            className="inline-flex items-center px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-neutral-100 transition transform hover:scale-105"
          >
            {language === 'ar' ? 'تسوق الآن' : 'Shop Now'}
            <ArrowLeft className="mr-2 ml-2" size={20} />
          </Link>
        </div>
      </div>
    </section>
  )
}

