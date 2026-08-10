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

export default function Home() {
  const sections = useHomeSections()

  // Fallback to empty div before hydration to prevent flashing default images
  if (!sections || sections.length === 0) {
    return (
      <div className="w-full min-h-screen bg-white"></div>
    )
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
