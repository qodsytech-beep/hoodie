'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  ShoppingBag, DollarSign, TrendingUp, Package,
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react'
import { getAllOrders } from '@/lib/cart'
import { getAllProducts } from '@/lib/products'
import { Order, Product } from '@/types'

// ──────────────────────── SVG Charts ─────────────────────────

/** Area/Line Chart */
function AreaChart({ data, color = '#0f172a', fillColor = 'rgba(15,23,42,0.08)', height = 100 }: {
  data: number[], color?: string, fillColor?: string, height?: number
}) {
  const w = 600, h = height
  const max = Math.max(...data, 1)
  const min = 0
  const pad = { l: 0, r: 0, t: 8, b: 4 }
  const innerW = w - pad.l - pad.r
  const innerH = h - pad.t - pad.b

  const pts = data.map((v, i) => ({
    x: pad.l + (i / (data.length - 1)) * innerW,
    y: pad.t + innerH - ((v - min) / (max - min)) * innerH,
  }))

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaD = `${pathD} L${pts[pts.length - 1].x},${h} L${pts[0].x},${h} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#grad-${color.replace('#', '')})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
      ))}
    </svg>
  )
}

/** Bar Chart */
function BarChart({ data, labels, color = '#0f172a' }: {
  data: number[], labels: string[], color?: string
}) {
  const max = Math.max(...data, 1)
  const barW = 85 / data.length

  return (
    <svg viewBox="0 0 100 60" className="w-full h-full" preserveAspectRatio="none">
      {data.map((v, i) => {
        const barH = (v / max) * 48
        const x = i * (100 / data.length) + barW * 0.15
        const y = 52 - barH
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW * 0.7} height={barH || 1}
              fill={v > 0 ? color : '#e2e8f0'} rx="1.5"
              className="transition-all duration-700"
            />
          </g>
        )
      })}
    </svg>
  )
}

/** Donut Chart */
function DonutChart({ segments, size = 140 }: {
  segments: { value: number, color: string, label: string }[], size?: number
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1
  const r = 40, cx = 50, cy = 50
  const circumference = 2 * Math.PI * r

  let offset = 0
  const slices = segments.map(seg => {
    const dash = (seg.value / total) * circumference
    const gap = circumference - dash
    const slice = { dash, gap, offset: offset, ...seg }
    offset += dash
    return slice
  })

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      {/* Background circle */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="14" />
      {slices.map((s, i) => (
        s.value > 0 && (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={s.color} strokeWidth="14"
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={-s.offset}
            strokeLinecap="butt"
          />
        )
      ))}
      {/* Center hole */}
      <circle cx={cx} cy={cy} r="26" fill="white" />
    </svg>
  )
}

// ──────────────────────── Helpers ─────────────────────────

function formatCurrency(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}م`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}ك`
  return n.toLocaleString()
}

function KpiCard({ title, value, subtitle, icon: Icon, iconBg, iconColor, trend, trendLabel }: {
  title: string, value: string, subtitle?: string,
  icon: any, iconBg: string, iconColor: string,
  trend?: 'up' | 'down' | 'flat', trendLabel?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start justify-between gap-3 hover:shadow-md transition-shadow">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
        {trendLabel && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-slate-400'
          }`}>
            {trend === 'up' ? <ArrowUpRight size={13} /> : trend === 'down' ? <ArrowDownRight size={13} /> : <Minus size={13} />}
            <span>{trendLabel}</span>
          </div>
        )}
        {subtitle && !trendLabel && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
      <div className={`${iconBg} p-3 rounded-xl flex-shrink-0`}>
        <Icon size={22} className={iconColor} />
      </div>
    </div>
  )
}

// ──────────────────────── Main Component ─────────────────────────

export default function Statistics() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const [o, p] = await Promise.all([getAllOrders(), getAllProducts()])
        setOrders(o)
        setProducts(p)
      } catch { } finally { setLoading(false) }
    }, 80)
    return () => clearTimeout(t)
  }, [])

  const analytics = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const now = new Date()

    // Build daily data
    const dailyData = Array.from({ length: days }, (_, i) => {
      const d = new Date(now); d.setDate(d.getDate() - (days - 1 - i))
      const dayStr = d.toDateString()
      const dayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === dayStr)
      return {
        date: d,
        label: d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' }),
        shortLabel: d.toLocaleDateString('ar-EG', { weekday: 'short' }),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((s, o) => s + o.total, 0),
      }
    })

    // Compare: current period vs previous
    const currentRevenue = dailyData.reduce((s, d) => s + d.revenue, 0)
    const prevStart = new Date(now); prevStart.setDate(prevStart.getDate() - days * 2)
    const prevEnd = new Date(now); prevEnd.setDate(prevEnd.getDate() - days)
    const prevOrders = orders.filter(o => {
      const d = new Date(o.createdAt)
      return d >= prevStart && d <= prevEnd
    })
    const prevRevenue = prevOrders.reduce((s, o) => s + o.total, 0)
    const revenueTrend = prevRevenue === 0 ? 0 : ((currentRevenue - prevRevenue) / prevRevenue) * 100

    // Order status
    const statusCounts = {
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    }

    // Category sales
    const categorySales: Record<string, { count: number, revenue: number }> = {}
    orders.forEach(o => o.items.forEach(item => {
      const cat = item.product.category || 'أخرى'
      if (!categorySales[cat]) categorySales[cat] = { count: 0, revenue: 0 }
      categorySales[cat].count += item.quantity
      categorySales[cat].revenue += item.product.price * item.quantity
    }))

    // Top products
    const productSales: Record<string, { name: string, count: number, revenue: number, img: string }> = {}
    orders.forEach(o => o.items.forEach(item => {
      const id = item.product.id
      if (!productSales[id]) productSales[id] = { name: item.product.name, count: 0, revenue: 0, img: item.product.images?.[0] || '' }
      productSales[id].count += item.quantity
      productSales[id].revenue += item.product.price * item.quantity
    }))
    const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

    // Today
    const todayStr = now.toDateString()
    const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === todayStr)
    const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0)

    return {
      dailyData, currentRevenue, prevRevenue, revenueTrend,
      statusCounts, categorySales, topProducts,
      todayOrders: todayOrders.length, todayRevenue,
      totalOrders: orders.length,
      deliveredRevenue: orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.total, 0),
    }
  }, [orders, products, timeRange])

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-slate-100" />)}
      </div>
    )
  }

  const { dailyData, currentRevenue, revenueTrend, statusCounts, categorySales, topProducts, todayOrders, todayRevenue, totalOrders, deliveredRevenue } = analytics

  const donutSegments = [
    { value: statusCounts.delivered, color: '#22c55e', label: 'تم التسليم' },
    { value: statusCounts.shipped, color: '#6366f1', label: 'تم الشحن' },
    { value: statusCounts.confirmed, color: '#3b82f6', label: 'مؤكد' },
    { value: statusCounts.pending, color: '#f59e0b', label: 'معلق' },
    { value: statusCounts.cancelled, color: '#ef4444', label: 'ملغي' },
  ]
  const donutTotal = donutSegments.reduce((s, d) => s + d.value, 0)

  const catNames: Record<string, string> = { tshirts: 'تيشيرتات', pants: 'بناطيل', sweatshirts: 'سويتشيرتات' }
  const catColors = ['#0f172a', '#374151', '#6b7280', '#9ca3af', '#d1d5db']
  const catEntries = Object.entries(categorySales).sort((a, b) => b[1].revenue - a[1].revenue)
  const maxCatRevenue = Math.max(...catEntries.map(([, v]) => v.revenue), 1)

  const revenueData = dailyData.map(d => d.revenue)
  const ordersData = dailyData.map(d => d.orders)
  const labels = dailyData.map(d => timeRange === '7d' ? d.shortLabel : d.label)

  return (
    <div className="space-y-5">

      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">لوحة الإحصائيات</h2>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {(['7d', '30d', '90d'] as const).map(r => (
            <button key={r} onClick={() => setTimeRange(r)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${timeRange === r ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {r === '7d' ? '7 أيام' : r === '30d' ? '30 يوم' : '90 يوم'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="إجمالي الإيرادات" value={`${formatCurrency(currentRevenue)} ج.م`}
          icon={DollarSign} iconBg="bg-emerald-50" iconColor="text-emerald-600"
          trend={revenueTrend > 0 ? 'up' : revenueTrend < 0 ? 'down' : 'flat'}
          trendLabel={`${Math.abs(revenueTrend).toFixed(1)}% عن الفترة السابقة`}
        />
        <KpiCard
          title="إجمالي الطلبات" value={totalOrders.toString()}
          subtitle={`${todayOrders} طلب اليوم`}
          icon={ShoppingBag} iconBg="bg-blue-50" iconColor="text-blue-600"
        />
        <KpiCard
          title="إيرادات اليوم" value={`${todayRevenue.toLocaleString()} ج.م`}
          subtitle={`${todayOrders} طلب`}
          icon={TrendingUp} iconBg="bg-violet-50" iconColor="text-violet-600"
        />
        <KpiCard
          title="إجمالي المنتجات" value={products.length.toString()}
          subtitle={`${products.filter(p => p.inStock).length} متوفر`}
          icon={Package} iconBg="bg-orange-50" iconColor="text-orange-600"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Area Chart - Revenue */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800">الإيرادات</h3>
              <p className="text-sm text-slate-400">آخر {timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'} يوم</p>
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(currentRevenue)} ج.م</p>
              <p className={`text-xs font-medium flex items-center justify-end gap-1 ${revenueTrend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {revenueTrend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(revenueTrend).toFixed(1)}%
              </p>
            </div>
          </div>
          <AreaChart data={revenueData} height={130} />
          {/* X-axis labels - show every N */}
          <div className="flex justify-between mt-2">
            {dailyData.filter((_, i) => {
              const step = timeRange === '7d' ? 1 : timeRange === '30d' ? 4 : 12
              return i % step === 0 || i === dailyData.length - 1
            }).map((d, i) => (
              <span key={i} className="text-xs text-slate-400">{timeRange === '7d' ? d.shortLabel : d.date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}</span>
            ))}
          </div>
        </div>

        {/* Donut Chart - Order Status */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-4">حالة الطلبات</h3>
          <div className="flex flex-col items-center">
            <div className="relative">
              <DonutChart segments={donutSegments} size={150} />
              <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ transform: 'rotate(0deg)' }}>
                <span className="text-2xl font-bold text-slate-900">{donutTotal}</span>
                <span className="text-xs text-slate-400">طلب</span>
              </div>
            </div>
            <div className="w-full space-y-2 mt-4">
              {donutSegments.filter(s => s.value > 0).map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-slate-600">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{s.value}</span>
                    <span className="text-xs text-slate-400">({donutTotal > 0 ? ((s.value / donutTotal) * 100).toFixed(0) : 0}%)</span>
                  </div>
                </div>
              ))}
              {donutTotal === 0 && <p className="text-center text-slate-400 text-sm py-2">لا توجد طلبات</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Bar Chart - Orders per day */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800">الطلبات اليومية</h3>
              <p className="text-sm text-slate-400">{totalOrders} طلب إجمالي</p>
            </div>
          </div>

          <div className="relative h-28">
            <BarChart data={ordersData} labels={labels} color="#0f172a" />
          </div>

          {/* Labels */}
          <div className="flex justify-between mt-1">
            {dailyData.filter((_, i) => {
              const step = timeRange === '7d' ? 1 : timeRange === '30d' ? 5 : 15
              return i % step === 0 || i === dailyData.length - 1
            }).map((d, i) => (
              <span key={i} className="text-xs text-slate-400">{d.date.getDate()}/{d.date.getMonth() + 1}</span>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
            {[
              { label: 'معلق', val: statusCounts.pending, c: 'text-amber-600' },
              { label: 'شحن', val: statusCounts.shipped, c: 'text-indigo-600' },
              { label: 'تسليم', val: statusCounts.delivered, c: 'text-green-600' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className={`text-xl font-bold ${s.c}`}>{s.val}</p>
                <p className="text-xs text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Category Sales Donut + Bars */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-4">مبيعات الفئات</h3>
          {catEntries.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm">لا توجد بيانات</div>
          ) : (
            <div className="flex gap-6 items-center">
              {/* Mini donut */}
              <div className="relative flex-shrink-0">
                <DonutChart
                  segments={catEntries.map(([k], i) => ({
                    value: categorySales[k].revenue,
                    color: catColors[i % catColors.length],
                    label: catNames[k] || k,
                  }))}
                  size={110}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-xs text-slate-400 text-center leading-tight">مبيعات<br/>الفئات</p>
                </div>
              </div>
              {/* Bars */}
              <div className="flex-1 space-y-3">
                {catEntries.slice(0, 4).map(([k, v], i) => (
                  <div key={k}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700">{catNames[k] || k}</span>
                      <span className="text-slate-500">{v.revenue.toLocaleString()} ج.م</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-700"
                        style={{ width: `${(v.revenue / maxCatRevenue) * 100}%`, background: catColors[i % catColors.length] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-bold text-slate-800 mb-5">أفضل المنتجات مبيعاً</h3>
        {topProducts.length === 0 ? (
          <p className="text-center text-slate-400 py-8">لا توجد بيانات مبيعات</p>
        ) : (
          <div className="space-y-4">
            {topProducts.map((p, i) => {
              const maxRevenue = topProducts[0]?.revenue || 1
              return (
                <div key={i} className="flex items-center gap-4">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-amber-100 text-amber-700' :
                    i === 1 ? 'bg-slate-200 text-slate-700' :
                    i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                  }`}>{i + 1}</span>
                  {p.img && (
                    <img src={p.img} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-slate-100"
                      onError={e => (e.currentTarget.style.display = 'none')} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{p.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                        <div className="bg-slate-800 h-1.5 rounded-full transition-all duration-700"
                          style={{ width: `${(p.revenue / maxRevenue) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-slate-900">{p.revenue.toLocaleString()} ج.م</p>
                    <p className="text-xs text-slate-400">{p.count} قطعة</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent Orders Mini Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-bold text-slate-800 mb-4">آخر الطلبات</h3>
        {orders.length === 0 ? (
          <p className="text-center text-slate-400 py-8">لا توجد طلبات</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['رقم الطلب', 'العميل', 'المبلغ', 'الحالة', 'التاريخ'].map(h => (
                    <th key={h} className="pb-3 text-right font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[...orders].reverse().slice(0, 6).map(o => (
                  <tr key={o.id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-mono text-xs text-slate-500">{o.orderNumber}</td>
                    <td className="py-3 font-medium text-slate-800">{o.customerName}</td>
                    <td className="py-3 font-bold">{o.total.toLocaleString()} ج.م</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        o.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        o.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                        o.status === 'shipped' ? 'bg-indigo-100 text-indigo-700' :
                        o.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {o.status === 'pending' ? 'معلق' : o.status === 'confirmed' ? 'مؤكد' :
                         o.status === 'shipped' ? 'تم الشحن' : o.status === 'delivered' ? 'تم التسليم' : 'ملغي'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 text-xs">{new Date(o.createdAt).toLocaleDateString('ar-EG')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
