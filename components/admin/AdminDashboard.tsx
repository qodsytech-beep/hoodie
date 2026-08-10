'use client'

import { useEffect, useState } from 'react'
import { BarChart3, Package, ShoppingCart, LogOut, Menu, X, Settings, UserCog, ExternalLink, Star, LayoutDashboard } from 'lucide-react'
import ProductManagement from './ProductManagement'
import OrderManagement from './OrderManagement'
import Statistics from './Statistics'
import SiteSettings from './SiteSettings'
import ProfileSettings from './ProfileSettings'
import ReviewsManagement from './ReviewsManagement'
import SectionsManager from './SectionsManager'
import CategoriesManager from './CategoriesManager'

type Tab = 'stats' | 'products' | 'orders' | 'reviews' | 'sections' | 'categories' | 'settings' | 'profile'

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('stats')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router_push = (path: string) => { window.location.href = path }

  useEffect(() => {
    try {
      const raw = localStorage.getItem('adminAuth')
      if (!raw) { router_push('/admin/login'); return }
      const session = JSON.parse(raw)
      if (!session.auth || !session.expiry || Date.now() > session.expiry) {
        localStorage.removeItem('adminAuth')
        router_push('/admin/login')
        return
      }
      setIsAuthenticated(true)
    } catch {
      localStorage.removeItem('adminAuth')
      router_push('/admin/login')
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    router_push('/admin/login')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
      </div>
    )
  }

  const groups = [
    {
      label: 'التحليلات',
      tabs: [
        { id: 'stats' as Tab, label: 'الإحصائيات', icon: BarChart3 },
      ]
    },
    {
      label: 'إدارة المحتوى',
      tabs: [
        { id: 'products' as Tab, label: 'المنتجات', icon: Package },
        { id: 'orders' as Tab, label: 'الطلبات', icon: ShoppingCart },
        { id: 'reviews' as Tab, label: 'المراجعات', icon: Star },
      ]
    },
    {
      label: 'تخصيص الموقع',
      tabs: [
        { id: 'sections' as Tab, label: 'أقسام الرئيسية', icon: LayoutDashboard },
        { id: 'categories' as Tab, label: 'الفئات', icon: Package },
        { id: 'settings' as Tab, label: 'إعدادات الموقع', icon: Settings },
      ]
    },
    {
      label: 'الحساب',
      tabs: [
        { id: 'profile' as Tab, label: 'إعدادات الحساب', icon: UserCog },
      ]
    },
  ]

  const allTabs = groups.flatMap(g => g.tabs)

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 right-0 h-screen w-64 bg-slate-900 text-white z-40 flex flex-col
        transform transition-transform duration-300 ease-in-out
        lg:sticky lg:top-0 lg:translate-x-0 overflow-y-auto
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {typeof window !== 'undefined' && JSON.parse(localStorage.getItem('toko-site-settings') || '{}').storeLogoUrl ? (
              <img src={JSON.parse(localStorage.getItem('toko-site-settings') || '{}').storeLogoUrl} alt="Logo" className="max-h-9 w-auto object-contain bg-white p-1 rounded-lg" />
            ) : (
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-base">
                  {typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('toko-site-settings') || '{}').storeName?.[0]?.toUpperCase() || 'T') : 'T'}
                </span>
              </div>
            )}
            <div>
              <p className="font-bold text-white leading-tight">
                {typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('toko-site-settings') || '{}').storeName || 'TOKO') : 'TOKO'} Admin
              </p>
              <p className="text-white/40 text-xs">لوحة التحكم</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/40 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        {/* Navigation by groups */}
        <nav className="flex-1 p-3 overflow-y-auto space-y-4">
          {groups.map(group => (
            <div key={group.label}>
              <p className="text-white/30 text-xs font-bold uppercase tracking-widest px-3 mb-1">{group.label}</p>
              <div className="space-y-0.5">
                {group.tabs.map(tab => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setSidebarOpen(false) }}
                      className={`
                        w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-right
                        ${isActive ? 'bg-white text-slate-900 shadow-md' : 'text-white/60 hover:text-white hover:bg-white/8'}
                      `}
                    >
                      <Icon size={17} className="flex-shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/10 space-y-0.5">
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/8 text-sm font-medium transition">
            <ExternalLink size={16} /> <span>عرض الموقع</span>
          </a>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-red-400/80 hover:text-red-300 hover:bg-red-500/10 text-sm font-medium transition">
            <LogOut size={16} /> <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-5 py-3.5 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition">
            <Menu size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-slate-900">{allTabs.find(t => t.id === activeTab)?.label}</h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button onClick={() => { setActiveTab('profile'); setSidebarOpen(false) }}
            className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition" title="إعدادات الحساب">
            <UserCog size={18} />
          </button>
          <button onClick={handleLogout}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition font-medium">
            <LogOut size={15} /> خروج
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 p-5 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'stats' && <Statistics />}
            {activeTab === 'products' && <ProductManagement />}
            {activeTab === 'orders' && <OrderManagement />}
            {activeTab === 'reviews' && <ReviewsManagement />}
            {activeTab === 'sections' && <SectionsManager />}
            {activeTab === 'categories' && <CategoriesManager />}
            {activeTab === 'settings' && <SiteSettings />}
            {activeTab === 'profile' && <ProfileSettings />}
          </div>
        </main>
      </div>
    </div>
  )
}
