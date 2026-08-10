'use client'

import Link from 'next/link'
import { useLanguageStore } from '@/lib/store'

const categories = [
  {
    id: 'men',
    name: 'رجال',
    nameEn: 'Men',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600',
    href: '/products?category=men',
  },
  {
    id: 'women',
    name: 'نساء',
    nameEn: 'Women',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600',
    href: '/products?category=women',
  },
  {
    id: 'tshirts',
    name: 'تيشيرتات',
    nameEn: 'T-Shirts',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
    href: '/products?category=tshirts',
  },
  {
    id: 'pants',
    name: 'بناطيل',
    nameEn: 'Pants',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600',
    href: '/products?category=pants',
  },
  {
    id: 'sweatshirts',
    name: 'سويتشيرتات',
    nameEn: 'Sweatshirts',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600',
    href: '/products?category=sweatshirts',
  },
  {
    id: 'accessories',
    name: 'إكسسوارات',
    nameEn: 'Accessories',
    image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600',
    href: '/products?category=accessories',
  },
]

export default function Categories() {
  const { language } = useLanguageStore()

  return (
    <section className="py-16 bg-neutral-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {language === 'ar' ? 'تصفح الأقسام' : 'Browse Categories'}
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={category.href}
              className="group relative aspect-square overflow-hidden rounded-lg bg-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
              <img
                src={category.image}
                alt={language === 'ar' ? category.name : category.nameEn || category.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                <h3 className="text-white font-bold text-lg">
                  {language === 'ar' ? category.name : category.nameEn || category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

