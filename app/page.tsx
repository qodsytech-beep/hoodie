'use client'

import { useEffect, useState } from 'react'
import Hero from '@/components/Hero'
import ShopNowBar from '@/components/ShopNowBar'
import FeaturedSlider from '@/components/FeaturedSlider'
import CategorySection from '@/components/CategorySection'
import Subscription from '@/components/Subscription'
import { HomeSection } from '@/lib/homeSections'
import { useHomeSections } from '@/lib/useHomeSections'
import Link from 'next/link'

/** بانر إعلاني ديناميكي */
function DynamicBanner({ section }: { section: HomeSection }) {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <Link href={section.bannerLink || '/products'}>
          <div
            className="rounded-2xl py-8 px-8 text-center text-white font-bold text-lg hover:opacity-90 transition cursor-pointer"
            style={{ background: section.bannerBg || '#000' }}
          >
            {section.bannerText}
          </div>
        </Link>
      </div>
    </section>
  )
}

function HomeSkeleton() {
  return (
    <div className="w-full min-h-screen bg-white">
      {/* Hero Skeleton */}
      <div className="w-full h-[70vh] md:h-[85vh] bg-slate-100 animate-pulse relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <div className="w-64 md:w-96 h-12 bg-slate-200/50 rounded-lg mb-4 animate-pulse" />
          <div className="w-48 h-6 bg-slate-200/50 rounded-lg mb-8 animate-pulse" />
          <div className="w-40 h-12 bg-slate-200/50 rounded-full animate-pulse" />
        </div>
      </div>
      
      {/* Slider Skeleton */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="w-64 h-10 bg-slate-100 rounded-lg mx-auto mb-8 animate-pulse" />
          <div className="flex gap-4 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[70%] sm:w-[45%] md:w-[30%] lg:w-[23%]">
                <div className="aspect-[3/4] bg-slate-100 rounded-xl animate-pulse mb-3" />
                <div className="w-3/4 h-4 bg-slate-100 rounded animate-pulse mb-2" />
                <div className="w-1/2 h-4 bg-slate-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default function Home() {
  const sections = useHomeSections()

  // Show skeleton instead of empty div while loading
  if (!sections || sections.length === 0) {
    return <HomeSkeleton />
  }

  const renderSection = (section: HomeSection) => {
    if (!section.enabled) return null

    switch (section.type) {
      case 'hero':
        return <Hero key={section.id} />
      case 'shopbar':
        return <ShopNowBar key={section.id} />
      case 'featured':
        return <FeaturedSlider key={section.id} />
      case 'category':
        return <CategorySection key={section.id} category={section.category!} title={section.title || section.category!} />
      case 'subscription':
        return <Subscription key={section.id} />
      case 'banner':
        return <DynamicBanner key={section.id} section={section} />
      default:
        return null
    }
  }

  return (
    <div className="w-full">
      {sections.map(renderSection)}
    </div>
  )
}
