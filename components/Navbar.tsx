'use client'

import Link from 'next/link'
import { ShoppingCart, Menu, X, Search, Heart } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useCartStore, useWishlistStore } from '@/lib/store'
import { useSiteSettings } from '@/lib/useSiteSettings'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const settings = useSiteSettings()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const cartItems = useCartStore(s => s.getItemCount())
  const wishlistItems = useWishlistStore(s => s.items.length)
  const searchRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (isSearchOpen) setTimeout(() => searchRef.current?.focus(), 50)
  }, [isSearchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`)
    setIsSearchOpen(false)
    setSearchQuery('')
  }

  const navLinks = [
    { name: 'الرئيسية', href: '/' },
    { name: 'المتجر', href: '/products' },
    { name: 'تتبع الطلب', href: '/track-order' },
    { name: 'اتصل بنا', href: '/contact' },
    { name: 'من نحن', href: '/about' },
  ]

  return (
    <>
      <nav className="bg-black text-white sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 relative">

            {/* Left: Nav Links (desktop) & Menu (mobile) */}
            <div className="flex items-center">
              {/* Mobile menu */}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition mr-[-10px] ml-2">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              <div className="hidden md:flex items-center gap-6">
                {navLinks.slice(0, 3).map(link => (
                  <Link key={link.href} href={link.href}
                    className="text-white/80 hover:text-white font-medium transition text-sm">
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Center: Logo */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2 z-10 flex items-center justify-center max-w-[140px] sm:max-w-xs">
              {!settings ? (
                <span className="w-16 h-5 bg-white/20 rounded animate-pulse" />
              ) : settings.storeLogoUrl ? (
                <img src={settings.storeLogoUrl} alt={settings.storeName} className="max-h-10 sm:max-h-12 w-auto object-contain" />
              ) : (
                <span className="text-xl sm:text-2xl font-black text-white tracking-widest truncate">{settings.storeName}</span>
              )}
            </Link>

            {/* Right: Icons */}
            <div className="flex items-center gap-0 sm:gap-1 ml-[-10px] sm:ml-0">
              {/* Search */}
              <button onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 sm:p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition">
                <Search size={20} />
              </button>

              {/* Wishlist */}
              <Link href="/wishlist" className="relative p-2 sm:p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition hidden sm:flex" title="المفضلة">
                <Heart size={20} />
                {wishlistItems > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistItems > 9 ? '9+' : wishlistItems}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative p-2 sm:p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition">
                <ShoppingCart size={20} />
                {cartItems > 0 && (
                  <span className="absolute top-1 right-1 bg-white text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartItems > 9 ? '9+' : cartItems}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10 space-y-1">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href}
                  className="block px-3 py-2.5 text-white/80 hover:text-white hover:bg-white/10 font-medium rounded-lg transition text-sm"
                  onClick={() => setIsMenuOpen(false)}>
                  {link.name}
                </Link>
              ))}
            </div>
          )}

          {/* Search Bar */}
          {isSearchOpen && (
            <div className="py-3 border-t border-white/10">
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن منتج..."
                  className="flex-1 px-4 py-2.5 bg-white/10 text-white placeholder-white/40 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
                />
                <button type="submit"
                  className="px-5 py-2.5 bg-white text-black rounded-xl font-semibold text-sm hover:bg-neutral-100 transition">
                  بحث
                </button>
                <button type="button" onClick={() => { setIsSearchOpen(false); setSearchQuery('') }}
                  className="p-2.5 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition">
                  <X size={18} />
                </button>
              </form>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
