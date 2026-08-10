'use client'

import { useEffect, useState, useMemo, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getAllProducts } from '@/lib/products'
import { useCategories } from '@/lib/useCategories'
import { useSiteSettings } from '@/lib/useSiteSettings'
import { Product } from '@/types'
import ProductCard from '@/components/ProductCard'
import {
  Search, SlidersHorizontal, Grid3X3, LayoutList, X,
  ChevronDown, ChevronUp, RotateCcw, ArrowUpDown, Check
} from 'lucide-react'
import { useCartStore, useWishlistStore } from '@/lib/store'
import toast from 'react-hot-toast'

// ─── SORT OPTIONS ───────────────────────────
const SORT_OPTIONS = [
  { value: 'newest',     label: 'الأحدث',            icon: 'fa-solid fa-clock-rotate-left' },
  { value: 'popular',   label: 'الأكثر شعبية',       icon: 'fa-solid fa-fire' },
  { value: 'price-asc', label: 'السعر: الأقل أولاً', icon: 'fa-solid fa-arrow-up-short-wide' },
  { value: 'price-desc',label: 'السعر: الأعلى أولاً',icon: 'fa-solid fa-arrow-down-wide-short' },
  { value: 'discount',  label: 'أعلى خصم',            icon: 'fa-solid fa-tag' },
  { value: 'name',      label: 'أبجدي (أ–ي)',         icon: 'fa-solid fa-arrow-down-a-z' },
]

const ALL_SIZES = ['XS','S','M','L','XL','XXL','3XL','28','30','32','34','36','38','40']
const PAGE_SIZE = 12

// ═══════════════════════════════════════════
//  SMOOTH DUAL RANGE SLIDER
// ═══════════════════════════════════════════
function DualSlider({
  min, max, low, high,
  onChange,
}: {
  min: number; max: number; low: number; high: number
  onChange: (low: number, high: number) => void
}) {
  const pctLow = ((low - min) / (max - min)) * 100
  const pctHigh = ((high - min) / (max - min)) * 100

  return (
    <div className="pt-2 pb-1">
      {/* Slider Track Wrapper - LTR to keep math predictable */}
      <div className="relative h-2 rounded-full bg-slate-200 mx-2" dir="ltr">
        {/* Active fill */}
        <div
          className="absolute top-0 h-2 rounded-full bg-slate-900"
          style={{ left: `${pctLow}%`, right: `${100 - pctHigh}%` }}
        />

        {/* Inputs overlay */}
        <input
          type="range" min={min} max={max} step={50} value={low}
          onChange={e => onChange(Math.max(+e.target.value, min), high)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-auto"
          style={{ zIndex: low > max - 100 ? 5 : 3 }}
        />
        <input
          type="range" min={min} max={max} step={50} value={high}
          onChange={e => onChange(low, Math.min(+e.target.value, max))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-auto"
          style={{ zIndex: 4 }}
        />

        {/* Visual Thumbs */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white border-[3px] border-slate-900 rounded-full shadow-lg pointer-events-none z-10"
          style={{ left: `${pctLow}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white border-[3px] border-slate-900 rounded-full shadow-lg pointer-events-none z-10"
          style={{ left: `${pctHigh}%` }}
        />
      </div>

      {/* Numeric inputs */}
      <div className="flex items-center gap-2 mt-4" dir="rtl">
        <div className="flex-1 relative">
          <label className="block text-[10px] text-slate-400 font-semibold mb-1 tracking-wide">الحد الأدنى</label>
          <input
            type="number" value={low} min={min} max={high} step={50}
            onChange={e => onChange(Math.max(+e.target.value, min), high)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white font-semibold"
          />
          <span className="absolute left-2 bottom-2 text-xs text-slate-400">ج</span>
        </div>
        <div className="w-5 h-px bg-slate-300 mt-5 flex-shrink-0" />
        <div className="flex-1 relative">
          <label className="block text-[10px] text-slate-400 font-semibold mb-1 tracking-wide">الحد الأعلى</label>
          <input
            type="number" value={high} min={low} max={max} step={50}
            onChange={e => onChange(low, Math.min(+e.target.value, max))}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white font-semibold"
          />
          <span className="absolute left-2 bottom-2 text-xs text-slate-400">ج</span>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════
//  FILTER SECTION ACCORDION
// ═══════════════════════════════════════════
function FilterSection({ title, icon, badge, children, defaultOpen = true }: {
  title: string; icon?: string; badge?: number; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full py-3 text-sm font-bold text-slate-800 hover:text-slate-600 transition group">
        {icon && <i className={`${icon} text-slate-500 w-4`} />}
        <span className="flex-1 text-right">{title}</span>
        {badge != null && badge > 0 && (
          <span className="bg-slate-900 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{badge}</span>
        )}
        {open
          ? <ChevronUp  size={14} className="text-slate-400 flex-shrink-0" />
          : <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />}
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  )
}

// ═══════════════════════════════════════════
//  ACTIVE FILTER CHIP
// ═══════════════════════════════════════════
function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-full">
      {label}
      <button onClick={onRemove} className="hover:opacity-70 transition"><X size={11} /></button>
    </span>
  )
}

// ═══════════════════════════════════════════
//  LIST CARD
// ═══════════════════════════════════════════
function ListCard({ product, catLabel }: { product: Product; catLabel: string }) {
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const addItem = useCartStore(s => s.addItem)
  const hasSale = product.originalPrice && product.originalPrice > product.price
  const disc = hasSale ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) : 0
  
  const settings = useSiteSettings()
  const colorMap = settings?.customColors?.reduce((acc, c) => ({ ...acc, [c.name]: c.hex }), {} as Record<string, string>) || {}

  return (
    <a href={`/products/${product.id}`}
      className="flex gap-4 bg-white border border-slate-100 rounded-2xl p-4 hover:border-slate-300 hover:shadow-md transition-all group">
      <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
        <img src={activeImage || product.images[0]} alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => ((e.target as HTMLImageElement).style.display = 'none')} />
        {hasSale && <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded">-{disc}%</span>}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
            <span className="text-white text-xs font-bold">نفد</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col py-1">
        <div className="flex-1">
          <p className="text-xs text-slate-400 mb-0.5">{catLabel}</p>
          <h3 className="font-bold text-slate-800 text-sm sm:text-base mb-1.5 line-clamp-2">{product.name}</h3>
          <p className="text-slate-500 text-xs sm:text-sm mb-2 line-clamp-2 hidden sm:block">{product.description}</p>
          <div className="flex gap-4 flex-wrap mt-2">
            <div className="flex gap-1 flex-wrap">
              {product.sizes.slice(0, 5).map(s => (
                <span key={s} className="text-[10px] border border-slate-200 rounded px-1.5 py-0.5 text-slate-500">{s}</span>
              ))}
              {product.sizes.length > 5 && <span className="text-[10px] text-slate-400">+{product.sizes.length - 5}</span>}
            </div>
            
            {product.colors && product.colors.length > 0 && (
              <div className="flex gap-1 flex-wrap items-center">
                {product.colors.slice(0, 5).map(color => {
                  const hex = colorMap[color.trim()]
                  const targetImg = product.colorImages?.[color]

                  return hex ? (
                    <div 
                      key={color} 
                      onClick={(e) => {
                        e.preventDefault()
                        if (targetImg) setActiveImage(targetImg)
                      }}
                      onMouseEnter={() => { if (targetImg) setActiveImage(targetImg) }}
                      onMouseLeave={() => setActiveImage(null)}
                      className="w-3.5 h-3.5 rounded-full border border-neutral-200 shadow-sm cursor-pointer hover:scale-110 transition-transform" 
                      style={{ backgroundColor: hex }} 
                      title={color} 
                    />
                  ) : (
                    <span 
                      key={color} 
                      onClick={(e) => {
                        e.preventDefault()
                        if (targetImg) setActiveImage(targetImg)
                      }}
                      onMouseEnter={() => { if (targetImg) setActiveImage(targetImg) }}
                      onMouseLeave={() => setActiveImage(null)}
                      className="text-[10px] text-slate-500 bg-slate-100 rounded px-1.5 py-0.5 leading-none cursor-pointer hover:bg-slate-200 transition-colors"
                    >
                      {color}
                    </span>
                  )
                })}
                {product.colors.length > 5 && <span className="text-[10px] text-slate-400">+{product.colors.length - 5}</span>}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="text-lg font-black text-slate-900">{product.price.toLocaleString()} ج.م</span>
            {hasSale && <span className="text-xs text-slate-400 line-through mr-2">{product.originalPrice!.toLocaleString()}</span>}
          </div>
          <button onClick={e => {
            e.preventDefault()
            if (!product.inStock) { toast.error('غير متوفر'); return }
            addItem(product, product.sizes[0] || '', product.colors[0] || '', 1)
            toast.success('✓ أضيف للسلة')
          }}
            disabled={!product.inStock}
            className="px-4 py-2 bg-slate-900 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-slate-700 transition disabled:opacity-40">
            أضف للسلة
          </button>
        </div>
      </div>
    </a>
  )
}

// ═══════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════
function ProductsContent() {
  const searchParams  = useSearchParams()
  const settings      = useSiteSettings()

  const [allProducts, setAll]     = useState<Product[]>([])
  const categories                = useCategories().filter(c => c.enabled).sort((a, b) => a.order - b.order)
  const [loading,     setLoading] = useState(true)
  const [viewMode,    setView]    = useState<'grid' | 'list'>('grid')
  const [drawerOpen,  setDrawer]  = useState(false)
  const [page,        setPage]    = useState(1)
  const [sortDD,      setSortDD]  = useState(false)

  /* ── filter state ── */
  const [search,      setSearch]   = useState(searchParams?.get('q') || '')
  const [category,    setCat]      = useState(searchParams?.get('category') || 'all')
  const [subCategory, setSubCat]   = useState(searchParams?.get('subCategory') || 'all')
  const [sort,        setSort]     = useState('newest')
  const [priceLimits, setLimits]   = useState<[number, number]>([0, 5000])
  const [priceRange,  setPrice]    = useState<[number, number]>([0, 5000])
  const [sizes,       setSizes]    = useState<string[]>([])
  const [colors,      setColors]   = useState<string[]>([])
  const [inStock,     setInStock]  = useState(false)
  const [onSale,      setOnSale]   = useState(false)
  const [featured,    setFeatured] = useState(false)

  // load
  useEffect(() => {
    getAllProducts().then(data => {
      setAll(data)
      if (data.length) {
        const prices = data.map(p => p.price)
        const lo = Math.floor(Math.min(...prices) / 50) * 50
        const hi = Math.ceil(Math.max(...prices)  / 50) * 50 + 50
        setLimits([lo, hi]); setPrice([lo, hi])
      }
      setLoading(false)
    })
  }, [])

  /* ── derived ── */
  const catLabel = (slug: string) => categories.find(c => c.slug === slug)?.label || slug

  const availSizes = useMemo(() => {
    const s = new Set<string>()
    allProducts.forEach(p => p.sizes.forEach(sz => s.add(sz)))
    return ALL_SIZES.filter(sz => s.has(sz))
  }, [allProducts])

  const availColors = useMemo(() => {
    const c = new Set<string>()
    allProducts.forEach(p => p.colors.forEach(cl => c.add(cl)))
    return Array.from(c).sort()
  }, [allProducts])

  const catCounts = useMemo(() => {
    const m: Record<string, number> = { all: allProducts.length }
    allProducts.forEach(p => { 
      m[p.category] = (m[p.category] || 0) + 1 
      if (p.subCategory) {
        m[`${p.category}-${p.subCategory}`] = (m[`${p.category}-${p.subCategory}`] || 0) + 1 
      }
    })
    return m
  }, [allProducts])
  
  const parentCategories = categories.filter(c => !c.parentId)
  const childCategories = categories.filter(c => c.parentId)

  const filtered = useMemo(() => allProducts
    .filter(p => {
      if (category !== 'all' && p.category !== category) return false
      if (subCategory !== 'all' && p.subCategory !== subCategory) return false
      if (inStock  && !p.inStock) return false
      if (onSale   && !(p.originalPrice && p.originalPrice > p.price)) return false
      if (featured && !p.featured) return false
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false
      if (sizes.length  && !sizes.some(s  => p.sizes.includes(s)))  return false
      if (colors.length && !colors.some(c => p.colors.includes(c))) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)
      }
      return true
    })
    .sort((a, b) => {
      switch (sort) {
        case 'price-asc':  return a.price - b.price
        case 'price-desc': return b.price - a.price
        case 'name':       return a.name.localeCompare(b.name, 'ar')
        case 'discount': {
          const da = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0
          const db = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0
          return db - da
        }
        case 'popular':  return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })
  , [allProducts, category, subCategory, inStock, onSale, featured, priceRange, sizes, colors, search, sort])

  const paginated = filtered.slice(0, page * PAGE_SIZE)
  const hasMore   = paginated.length < filtered.length

  const toggleSize  = (s: string) => { setSizes(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]); setPage(1) }
  const toggleColor = (c: string) => { setColors(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]); setPage(1) }

  const clearAll = useCallback(() => {
    setSearch(''); setCat('all'); setSubCat('all'); setSort('newest'); setPrice(priceLimits)
    setSizes([]); setColors([]); setInStock(false); setOnSale(false); setFeatured(false); setPage(1)
  }, [priceLimits])

  const activeCount = [
    category !== 'all', subCategory !== 'all', inStock, onSale, featured,
    priceRange[0] > priceLimits[0] || priceRange[1] < priceLimits[1],
    sizes.length > 0, colors.length > 0, sort !== 'newest', search.trim() !== ''
  ].filter(Boolean).length

  const chips: { label: string; clear: () => void }[] = [
    ...(category !== 'all'  ? [{ label: catLabel(category), clear: () => { setCat('all'); setSubCat('all') } }] : []),
    ...(subCategory !== 'all' ? [{ label: catLabel(subCategory), clear: () => setSubCat('all') }] : []),
    ...(inStock              ? [{ label: 'متوفر فقط',   clear: () => setInStock(false) }] : []),
    ...(onSale               ? [{ label: 'تخفيضات',     clear: () => setOnSale(false) }]  : []),
    ...(featured             ? [{ label: 'مميز فقط',    clear: () => setFeatured(false) }] : []),
    ...((priceRange[0] > priceLimits[0] || priceRange[1] < priceLimits[1])
      ? [{ label: `${priceRange[0]}–${priceRange[1]} ج.م`, clear: () => setPrice(priceLimits) }] : []),
    ...sizes.map(s  => ({ label: `مقاس ${s}`,  clear: () => toggleSize(s) })),
    ...colors.map(c => ({ label: `لون: ${c}`,  clear: () => toggleColor(c) })),
    ...(search.trim() ? [{ label: `"${search}"`, clear: () => setSearch('') }] : []),
  ]

  // Color map helper
  const COLOR_HEX = settings?.customColors?.reduce((acc, c) => ({ ...acc, [c.name.toLowerCase()]: c.hex }), {} as Record<string, string>) || {}
  const hex = (c: string) => COLOR_HEX[c.toLowerCase()] || '#e5e7eb'

  if (loading) return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-6">
        <div className="w-60 hidden lg:block space-y-3">
          {[...Array(5)].map((_,i)=><div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse"/>)}
        </div>
        <div className="flex-1 grid grid-cols-3 gap-4">
          {[...Array(9)].map((_,i)=><div key={i} className="aspect-[3/4] bg-slate-100 rounded-xl animate-pulse"/>)}
        </div>
      </div>
    </div>
  )

  // ── Filter panel ──────────────────────────
  const filterPanelContent = (
    <div>
      {/* Category */}
      <FilterSection title="الفئة" icon="fa-solid fa-layer-group" badge={category !== 'all' ? 1 : 0}>
        {/* ALL */}
        <button onClick={() => { setCat('all'); setSubCat('all'); setPage(1) }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition mb-1 ${
            category === 'all' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
          }`}>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-border-all w-4 text-center" />
            <span>جميع المنتجات</span>
          </div>
          <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${category === 'all' ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
            {catCounts.all || 0}
          </span>
        </button>
        {/* Dynamic Parent & Child cats */}
        {parentCategories.map(parent => (
          <div key={parent.id} className="mb-1">
            <button onClick={() => { setCat(parent.slug); setSubCat('all'); setPage(1) }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition ${
                category === parent.slug && subCategory === 'all' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
              }`}>
              <div className="flex items-center gap-2">
                <i className={`${parent.faIcon} w-4 text-center`} />
                <span>{parent.label}</span>
              </div>
              <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${category === parent.slug && subCategory === 'all' ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                {catCounts[parent.slug] || 0}
              </span>
            </button>
            {/* Children if parent is selected */}
            {category === parent.slug && (
              <div className="ml-4 mt-1 border-l-2 border-slate-200 pl-2 space-y-1">
                {childCategories.filter(c => c.parentId === parent.id).map(child => (
                  <button key={child.id} onClick={() => { setSubCat(child.slug); setPage(1) }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
                      subCategory === child.slug ? 'bg-slate-800 text-white font-bold' : 'text-slate-500 hover:bg-slate-100'
                    }`}>
                    <div className="flex items-center gap-2">
                      <i className={`${child.faIcon} w-3 text-center text-xs`} />
                      <span className="text-xs">{child.label}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${subCategory === child.slug ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>
                      {catCounts[`${parent.slug}-${child.slug}`] || 0}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </FilterSection>

      {/* Price */}
      <FilterSection title="نطاق السعر" icon="fa-solid fa-money-bill-wave"
        badge={priceRange[0] > priceLimits[0] || priceRange[1] < priceLimits[1] ? 1 : 0}>
        <DualSlider
          min={priceLimits[0]} max={priceLimits[1]}
          low={priceRange[0]}  high={priceRange[1]}
          onChange={(lo, hi) => { setPrice([lo, hi]); setPage(1) }}
        />
      </FilterSection>

      {/* Sizes */}
      {availSizes.length > 0 && (
        <FilterSection title="المقاس" icon="fa-solid fa-ruler" badge={sizes.length}>
          <div className="flex flex-wrap gap-1.5">
            {availSizes.map(s => (
              <button key={s} onClick={() => toggleSize(s)}
                className={`min-w-[42px] h-10 px-2.5 text-xs font-bold rounded-xl border-2 transition active:scale-95 ${
                  sizes.includes(s)
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'border-slate-200 text-slate-600 hover:border-slate-800 hover:bg-slate-50'
                }`}>
                {s}
              </button>
            ))}
          </div>
          {sizes.length > 0 && (
            <button onClick={() => setSizes([])} className="mt-2 text-xs text-red-500 hover:text-red-700 font-medium">
              مسح المقاسات
            </button>
          )}
        </FilterSection>
      )}

      {/* Colors */}
      {availColors.length > 0 && (
        <FilterSection title="اللون" icon="fa-solid fa-palette" badge={colors.length}>
          <div className="flex flex-wrap gap-2.5">
            {availColors.map(c => {
              const h = hex(c)
              const isLt = ['#fff','#d2b48c','#fbbf24','#f9a8d4'].includes(h)
              const sel  = colors.includes(c)
              return (
                <button key={c} onClick={() => toggleColor(c)} title={c}
                  className={`relative w-9 h-9 rounded-full border-[3px] transition-all duration-150 hover:scale-110 active:scale-95 ${
                    sel ? 'border-slate-900 scale-110 shadow-lg' : 'border-transparent shadow-sm hover:border-slate-400'
                  }`}
                  style={{ background: h, outline: h === '#fff' ? '1px solid #e2e8f0' : 'none' }}>
                  {sel && <Check size={13} className={`absolute inset-0 m-auto ${isLt ? 'text-slate-800' : 'text-white'}`} strokeWidth={3} />}
                </button>
              )
            })}
          </div>
          {colors.length > 0 && (
            <p className="mt-2 text-xs text-slate-500">{colors.join(' • ')}</p>
          )}
        </FilterSection>
      )}

      {/* Extra toggles */}
      <FilterSection title="خيارات إضافية" icon="fa-solid fa-sliders" badge={[inStock,onSale,featured].filter(Boolean).length}>
        <div className="space-y-2">
          {[
            { label: 'متوفر فقط',   sub:'عرض المنتجات المتاحة فقط', val: inStock,  set: setInStock,  icon: 'fa-solid fa-circle-check text-green-500' },
            { label: 'تخفيضات فقط', sub:'عروض وخصومات',             val: onSale,   set: setOnSale,   icon: 'fa-solid fa-fire text-red-500' },
            { label: 'منتجات مميزة',sub:'الأكثر شعبية',              val: featured, set: setFeatured, icon: 'fa-solid fa-star text-amber-500' },
          ].map(t => (
            <button key={t.label} onClick={() => { t.set(!t.val); setPage(1) }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm transition active:scale-[0.98] ${
                t.val ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
              }`}>
              <i className={`${t.icon} w-4 text-center text-base ${t.val ? '!text-white' : ''}`} />
              <div className="flex-1 text-right">
                <p className="font-bold">{t.label}</p>
                <p className={`text-xs ${t.val ? 'text-white/70' : 'text-slate-400'}`}>{t.sub}</p>
              </div>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                t.val ? 'border-white bg-white' : 'border-slate-300'
              }`}>
                {t.val && <Check size={12} className="text-slate-900" strokeWidth={3} />}
              </div>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Reset */}
      {activeCount > 0 && (
        <div className="pt-4">
          <button onClick={clearAll}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-bold hover:bg-red-100 transition active:scale-[0.98]">
            <i className="fa-solid fa-rotate-left" />
            مسح كل الفلاتر ({activeCount})
          </button>
        </div>
      )}
    </div>
  )

  // ── Render ────────────────────────────────
  return (
    <div className="bg-white min-h-screen" dir="rtl">

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <div className="relative bg-white w-[320px] h-full flex flex-col shadow-2xl"
            style={{ animation: 'slideInRight .25s ease' }}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <i className="fa-solid fa-sliders text-slate-600" /> الفلاتر
              </h2>
              <button onClick={() => setDrawer(false)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {filterPanelContent}
            </div>
            <div className="p-4 border-t border-slate-100 bg-white">
              <button onClick={() => setDrawer(false)}
                className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-700 transition">
                <i className="fa-solid fa-check ml-2" />
                عرض {filtered.length} منتج
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes slideInRight { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>

      <div className="container mx-auto px-4 py-6">

        {/* Top bar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1 min-w-52 max-w-sm">
            <i className="fa-solid fa-magnifying-glass absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input type="text" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="ابحث عن منتج، لون، مقاس..."
              className="w-full pr-9 pl-9 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white" />
            {search && (
              <button onClick={() => { setSearch(''); setPage(1) }}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Mobile filter button */}
          <button onClick={() => setDrawer(true)}
            className={`lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition ${
              activeCount > 0 ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-700 hover:border-slate-400'
            }`}>
            <i className="fa-solid fa-sliders" />
            فلتر
            {activeCount > 0 && <span className="bg-white text-slate-900 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">{activeCount}</span>}
          </button>

          {/* Sort dropdown */}
          <div className="relative">
            <button onClick={() => setSortDD(!sortDD)}
              className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-slate-400 bg-white min-w-[160px] justify-between transition">
              <div className="flex items-center gap-2">
                <i className={`${SORT_OPTIONS.find(s=>s.value===sort)?.icon || 'fa-solid fa-sort'} text-slate-500`} />
                {SORT_OPTIONS.find(s=>s.value===sort)?.label || 'ترتيب'}
              </div>
              <ChevronDown size={14} className={`text-slate-400 transition-transform ${sortDD ? 'rotate-180' : ''}`} />
            </button>
            {sortDD && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setSortDD(false)} />
                <div className="absolute top-full mt-2 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 min-w-[200px] py-2 overflow-hidden">
                  {SORT_OPTIONS.map(opt => (
                    <button key={opt.value}
                      onClick={() => { setSort(opt.value); setSortDD(false); setPage(1) }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-right transition ${
                        sort === opt.value ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-50'
                      }`}>
                      <i className={`${opt.icon} w-4 text-center`} />
                      <span className="flex-1">{opt.label}</span>
                      {sort === opt.value && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* View mode */}
          <div className="flex border border-slate-200 rounded-xl overflow-hidden">
            <button onClick={() => setView('grid')}
              className={`p-2.5 transition ${viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
              <Grid3X3 size={16} />
            </button>
            <button onClick={() => setView('list')}
              className={`p-2.5 transition ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
              <LayoutList size={16} />
            </button>
          </div>
        </div>

        {/* Active chips */}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-slate-100">
            <span className="text-xs text-slate-400 self-center">الفلاتر:</span>
            {chips.map((chip, i) => <Chip key={i} label={chip.label} onRemove={chip.clear} />)}
            <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-700 font-semibold self-center">مسح الكل</button>
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 sticky top-20">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <i className="fa-solid fa-sliders text-slate-500" /> الفلاتر
                </h2>
                {activeCount > 0 && (
                  <span className="text-[10px] bg-slate-900 text-white font-black px-2 py-0.5 rounded-full">{activeCount}</span>
                )}
              </div>
              {filterPanelContent}
            </div>
          </aside>

          {/* Products area */}
          <div className="flex-1 min-w-0">
            {/* Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">
                {filtered.length === 0 ? 'لا توجد نتائج' : (
                  <>عرض <strong className="text-slate-800">{Math.min(paginated.length, filtered.length)}</strong> من <strong className="text-slate-800">{filtered.length}</strong> منتج</>
                )}
              </p>
              {allProducts.length !== filtered.length && filtered.length > 0 && (
                <span className="text-xs text-slate-400">{allProducts.length - filtered.length} منتج مخفي بالفلتر</span>
              )}
            </div>

            {/* Empty */}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <i className="fa-solid fa-box-open text-4xl text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">لا توجد منتجات</h3>
                <p className="text-slate-400 text-sm mb-5 max-w-xs">جرّب تعديل الفلاتر أو البحث بكلمات مختلفة</p>
                <button onClick={clearAll}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-700 transition">
                  <i className="fa-solid fa-rotate-left ml-2" /> مسح الفلاتر
                </button>
              </div>
            )}

            {/* Grid */}
            {viewMode === 'grid' && filtered.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginated.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}

            {/* List */}
            {viewMode === 'list' && filtered.length > 0 && (
              <div className="space-y-3">
                {paginated.map(p => <ListCard key={p.id} product={p} catLabel={catLabel(p.category)} />)}
              </div>
            )}

            {/* Load more */}
            {hasMore && (
              <div className="text-center mt-8">
                <button onClick={() => setPage(n => n + 1)}
                  className="px-8 py-3 border-2 border-slate-900 text-slate-900 font-bold rounded-xl hover:bg-slate-900 hover:text-white transition">
                  <i className="fa-solid fa-chevron-down ml-2" />
                  عرض المزيد ({filtered.length - paginated.length} منتج)
                </button>
              </div>
            )}

            {!hasMore && filtered.length > PAGE_SIZE && (
              <p className="text-center text-slate-300 text-sm mt-8">
                <i className="fa-solid fa-circle-check ml-1" /> تم عرض جميع المنتجات
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="aspect-[3/4] bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}
