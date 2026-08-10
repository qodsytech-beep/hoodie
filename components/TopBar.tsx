'use client'

import { MapPin, Phone } from 'lucide-react'
import { useSiteSettings } from '@/lib/useSiteSettings'

export default function TopBar() {
  const settings = useSiteSettings()

  // Don't render until settings are loaded from localStorage
  if (!settings) return null
  if (!settings.topBarEnabled) return null

  return (
    <div className="bg-neutral-800 text-white text-xs sm:text-sm py-2">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-1.5 sm:gap-4">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {settings.storeAddress && (
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-neutral-400" />
                <span>{settings.storeAddress}</span>
              </div>
            )}
            {settings.topBarPhone && (
              <div className="flex items-center gap-1.5">
                <Phone size={13} className="text-neutral-400" />
                <span dir="ltr">{settings.topBarPhone}</span>
              </div>
            )}
          </div>
          {settings.topBarText && (
            <div className="hidden md:block font-medium text-neutral-300">
              {settings.topBarText}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
