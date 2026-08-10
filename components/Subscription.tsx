'use client'

import { useState, useEffect } from 'react'
import { Facebook, Instagram } from 'lucide-react'
import toast from 'react-hot-toast'
import ScrollAnimation from './ScrollAnimation'
import { siteSettings, SiteSettings, defaultSettings } from '@/lib/siteSettings'

export default function Subscription() {
  const [email, setEmail] = useState('')
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)

  useEffect(() => {
    setSettings(siteSettings.get())
    const handler = () => setSettings(siteSettings.get())
    window.addEventListener('site-settings-updated', handler)
    return () => window.removeEventListener('site-settings-updated', handler)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      toast.success('تم الاشتراك بنجاح!')
      setEmail('')
    }
  }

  return (
    <section className="bg-black text-white py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <ScrollAnimation>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">اشترك مجاناً</h2>
          </ScrollAnimation>

          <ScrollAnimation delay={0.1}>
            <p className="text-lg mb-8 text-neutral-300">
              كن أول من يعرف عن المجموعات الجديدة والعروض الحصرية، يرجى إدخال بريدك الإلكتروني.
            </p>
          </ScrollAnimation>

          <ScrollAnimation delay={0.2}>
            <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-8">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="أدخل بريدك الإلكتروني"
                className="flex-1 px-4 py-3 bg-transparent border-b-2 border-white text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-400"
                required
              />
              <button type="submit" className="px-6 py-3 bg-white text-black font-semibold hover:bg-neutral-200 transition">
                →
              </button>
            </form>
          </ScrollAnimation>

          <ScrollAnimation delay={0.3}>
            <div className="mb-8">
              <span className="text-2xl font-bold">{settings.storeName}</span>
            </div>
          </ScrollAnimation>

          <ScrollAnimation delay={0.4}>
            <div className="flex items-center justify-center gap-4">
              {settings.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-white hover:text-neutral-300 transition">
                  <Facebook size={24} />
                </a>
              )}
              {settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-white hover:text-neutral-300 transition">
                  <Instagram size={24} />
                </a>
              )}
              {settings.tiktokUrl && (
                <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-white hover:text-neutral-300 transition">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              )}
              {settings.whatsappNumber && (
                <a
                  href={`https://wa.me/${settings.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-green-400 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                  </svg>
                </a>
              )}
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  )
}
