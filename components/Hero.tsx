'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSiteSettings } from '@/lib/useSiteSettings'

export default function Hero() {
  const settings = useSiteSettings()

  // Don't render until settings are loaded — prevents flash of default image
  if (!settings) {
    return <div className="h-[600px] md:h-[700px] bg-neutral-900 animate-pulse" />
  }

  return (
    <section className="relative h-[600px] md:h-[700px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url('${settings.heroImage}')` }}
      />
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.58)' }} />

      <div className="relative h-full flex items-center justify-center">
        <motion.div
          className="text-center text-white px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {settings.heroTitle}
          </motion.h1>

          {settings.heroSubtitle && (
            <motion.p
              className="text-lg md:text-xl text-white/80 mb-8 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
            >
              {settings.heroSubtitle}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Link
              href={settings.heroButtonLink || '/products'}
              className="inline-block px-10 py-4 border-2 border-white text-white font-bold text-lg hover:bg-white hover:text-black transition-all duration-300 rounded-sm tracking-wide"
            >
              {settings.heroButtonText}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
