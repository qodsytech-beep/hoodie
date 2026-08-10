'use client'

import { useState } from 'react'
import { useSiteSettings } from '@/lib/useSiteSettings'
import { X } from 'lucide-react'

export default function AnnouncementBar() {
  const settings = useSiteSettings()
  const [dismissed, setDismissed] = useState(false)

  // Don't render until settings are loaded from localStorage
  if (!settings) return null
  if (!settings.announcementEnabled || !settings.announcementText || dismissed) return null

  return (
    <div className="bg-black text-white text-sm py-2.5 px-4 text-center relative">
      <span className="font-medium">{settings.announcementText}</span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition"
        aria-label="إغلاق"
      >
        <X size={16} />
      </button>
    </div>
  )
}
