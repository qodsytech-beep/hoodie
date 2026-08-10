'use client'

import { Star } from 'lucide-react'
import { useLanguageStore } from '@/lib/store'

const reviews = [
  {
    id: 1,
    name: 'أحمد محمد',
    nameEn: 'Ahmed Mohamed',
    rating: 5,
    comment: 'جودة ممتازة وتصميم عصري. أنصح الجميع بشراء المنتجات من توكو.',
    commentEn: 'Excellent quality and modern design. I recommend everyone to buy from TOKO.',
  },
  {
    id: 2,
    name: 'فاطمة علي',
    nameEn: 'Fatima Ali',
    rating: 5,
    comment: 'خدمة عملاء رائعة وتوصيل سريع. المنتجات كما هو موضح تمامًا.',
    commentEn: 'Great customer service and fast delivery. Products are exactly as described.',
  },
  {
    id: 3,
    name: 'محمد خالد',
    nameEn: 'Mohamed Khalid',
    rating: 4,
    comment: 'أسعار معقولة وجودة جيدة. سأشتري مرة أخرى بالتأكيد.',
    commentEn: 'Reasonable prices and good quality. I will definitely buy again.',
  },
]

export default function Reviews() {
  const { language } = useLanguageStore()

  return (
    <section className="py-16 bg-neutral-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {language === 'ar' ? 'آراء عملائنا' : 'Customer Reviews'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}
                  />
                ))}
              </div>
              <p className="text-neutral-700 mb-4">
                {language === 'ar' ? review.comment : review.commentEn}
              </p>
              <p className="font-semibold text-neutral-900">
                {language === 'ar' ? review.name : review.nameEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

