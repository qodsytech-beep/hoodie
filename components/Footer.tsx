'use client'

import Link from 'next/link'
import { useSiteSettings } from '@/lib/useSiteSettings'
import { Facebook, Instagram, Phone, MapPin, Mail } from 'lucide-react'

export default function Footer() {
  const settings = useSiteSettings()

  // Don't render until settings are loaded
  if (!settings) return <div className="h-64 bg-neutral-900 animate-pulse" />

  const whatsappUrl = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent('مرحباً، أحتاج مساعدة')}`
    : null

  return (
    <footer className="bg-neutral-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand */}
          <div>
            {settings.storeLogoUrl ? (
              <img src={settings.storeLogoUrl} alt={settings.storeName} className="h-10 w-auto object-contain mb-4" />
            ) : (
              <h3 className="text-2xl font-bold mb-3">{settings.storeName}</h3>
            )}
            <p className="text-neutral-400 text-sm leading-relaxed mb-4">
              ملابس عصرية بجودة مضمونة. نوصل لجميع محافظات مصر.
            </p>
            {/* Social */}
            <div className="flex items-center gap-3">
              {settings.facebookUrl && (
                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-neutral-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                  <Facebook size={16} />
                </a>
              )}
              {settings.instagramUrl && (
                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-neutral-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors">
                  <Instagram size={16} />
                </a>
              )}
              {settings.tiktokUrl && (
                <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-neutral-800 hover:bg-neutral-600 rounded-lg flex items-center justify-center transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              )}
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 bg-neutral-800 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-neutral-300 mb-4">روابط سريعة</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/products', label: 'المتجر' },
                { href: '/track-order', label: 'تتبع الطلب' },
                { href: '/returns', label: 'سياسة الاسترداد' },
                { href: '/shipping', label: 'سياسة الشحن' },
                { href: '/terms', label: 'شروط الخدمة' },
                { href: '/contact', label: 'اتصل بنا' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-neutral-400 hover:text-white transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-neutral-300 mb-4">تواصل معنا</h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              {settings.storePhone && (
                <li className="flex items-center gap-2">
                  <Phone size={14} className="flex-shrink-0 text-neutral-500" />
                  <span>{settings.storePhone}</span>
                </li>
              )}
              {settings.storeEmail && (
                <li className="flex items-center gap-2">
                  <Mail size={14} className="flex-shrink-0 text-neutral-500" />
                  <span>{settings.storeEmail}</span>
                </li>
              )}
              {settings.storeAddress && (
                <li className="flex items-center gap-2">
                  <MapPin size={14} className="flex-shrink-0 text-neutral-500" />
                  <span>{settings.storeAddress}</span>
                </li>
              )}
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800 py-4">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} {settings.storeName}. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white transition">سياسة الخصوصية</Link>
            <Link href="/terms" className="hover:text-white transition">شروط الخدمة</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
