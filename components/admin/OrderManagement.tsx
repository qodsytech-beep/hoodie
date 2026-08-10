'use client'

import { useEffect, useState, useRef } from 'react'
import { Eye, Printer, Search, Filter, RefreshCw, X, Phone, MapPin, Calendar } from 'lucide-react'
import { getAllOrders, updateOrderStatus } from '@/lib/cart'
import { Order } from '@/types'
import toast from 'react-hot-toast'

type StatusFilter = 'all' | Order['status']

const statusLabels: Record<string, string> = {
  all: 'الكل',
  pending: 'معلق',
  confirmed: 'مؤكد',
  shipped: 'تم الشحن',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-300',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
  shipped: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  delivered: 'bg-green-100 text-green-800 border-green-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
}

function PrintInvoice({ order, onClose }: { order: Order, onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const content = printRef.current
    if (!content) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8" />
        <title>فاتورة ${order.orderNumber}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; padding: 30px; color: #111; font-size: 14px; }
          .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 16px; margin-bottom: 20px; }
          .store-name { font-size: 28px; font-weight: bold; }
          .order-num { font-size: 13px; color: #555; margin-top: 4px; }
          .section { margin-bottom: 16px; }
          .section-title { font-weight: bold; font-size: 13px; color: #555; border-bottom: 1px solid #eee; padding-bottom: 4px; margin-bottom: 8px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th { background: #f5f5f5; padding: 8px; text-align: right; font-size: 12px; }
          td { padding: 8px; border-bottom: 1px solid #eee; font-size: 13px; }
          .total-row { font-weight: bold; font-size: 15px; border-top: 2px solid #111; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #888; }
          @media print { body { padding: 15px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="store-name">TOKO</div>
          <div class="order-num">فاتورة رقم: ${order.orderNumber}</div>
          <div class="order-num">التاريخ: ${new Date(order.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <div class="section">
          <div class="section-title">بيانات العميل</div>
          <div class="row"><span>الاسم:</span><span>${order.customerName}</span></div>
          <div class="row"><span>الهاتف:</span><span>${order.phone}</span></div>
          <div class="row"><span>العنوان:</span><span>${order.address}</span></div>
          <div class="row"><span>طريقة الدفع:</span><span>${order.paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 'دفع إلكتروني'}</span></div>
        </div>
        <div class="section">
          <div class="section-title">المنتجات</div>
          <table>
            <thead><tr><th>المنتج</th><th>المقاس / اللون</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.product.name}</td>
                  <td>${item.selectedSize} / ${item.selectedColor}</td>
                  <td>${item.quantity}</td>
                  <td>${item.product.price} ج.م</td>
                  <td>${item.product.price * item.quantity} ج.م</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="4">المجموع الكلي</td>
                <td>${order.total} ج.م</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="footer">شكراً لتسوقكم معنا • TOKO</div>
      </body>
      </html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 300)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800">تفاصيل الطلب #{order.orderNumber}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition"
            >
              <Printer size={16} /> طباعة فاتورة
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5" ref={printRef}>
          {/* Customer Info */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-slate-700 text-sm">بيانات العميل</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-500">الاسم:</span> <span className="font-semibold">{order.customerName}</span></div>
              <div className="flex items-center gap-1"><Phone size={13} className="text-slate-400" /><span className="font-semibold">{order.phone}</span></div>
              <div className="col-span-2 flex items-start gap-1"><MapPin size={13} className="text-slate-400 mt-0.5 flex-shrink-0" /><span className="font-semibold">{order.address}</span></div>
              <div><span className="text-slate-500">طريقة الدفع:</span> <span className="font-semibold">{order.paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 'دفع إلكتروني'}</span></div>
              <div className="flex items-center gap-1"><Calendar size={13} className="text-slate-400" /><span className="font-semibold">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span></div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h4 className="font-bold text-slate-700 text-sm mb-3">المنتجات</h4>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-4 p-3 bg-slate-50 rounded-xl">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" onError={e => (e.currentTarget.style.display='none')} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{item.product.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.selectedSize} / {item.selectedColor} × {item.quantity}</p>
                  </div>
                  <div className="text-left flex-shrink-0">
                    <p className="font-bold text-slate-800">{(item.product.price * item.quantity).toLocaleString()} ج.م</p>
                    <p className="text-xs text-slate-400">{item.product.price} ج.م / قطعة</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
            <span className="text-lg font-bold text-slate-800">المجموع الكلي</span>
            <span className="text-2xl font-bold text-slate-900">{order.total.toLocaleString()} ج.م</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  useEffect(() => {
    const timer = setTimeout(() => loadOrders(), 100)
    return () => clearTimeout(timer)
  }, [])

  const loadOrders = async () => {
    try {
      const data = await getAllOrders()
      setOrders([...data].reverse()) // newest first
    } catch { /* silent */ } finally { setLoading(false) }
  }

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      const updated = await updateOrderStatus(orderId, newStatus)
      if (updated) {
        toast.success('تم تحديث حالة الطلب')
        setOrders(prev => prev.map(o => o.id === orderId ? updated : o))
      } else {
        toast.error('حدث خطأ أثناء التحديث')
      }
    } catch {
      toast.error('حدث خطأ أثناء التحديث')
    }
  }

  const filtered = orders.filter(o => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter
    const q = searchQuery.toLowerCase()
    const matchesSearch = !q || o.customerName.toLowerCase().includes(q) || o.orderNumber.toLowerCase().includes(q) || o.phone.includes(q)
    return matchesStatus && matchesSearch
  })

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>
  }

  return (
    <div className="space-y-5">
      {selectedOrder && <PrintInvoice order={selectedOrder} onClose={() => setSelectedOrder(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">إدارة الطلبات</h2>
        <button onClick={loadOrders} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition">
          <RefreshCw size={15} /> تحديث
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(statusLabels) as StatusFilter[]).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${
              statusFilter === s ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
            }`}
          >
            {statusLabels[s]}
            <span className={`text-xs rounded-full px-1.5 min-w-[20px] text-center ${statusFilter === s ? 'bg-white/20' : 'bg-slate-100'}`}>
              {statusCounts[s]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="ابحث بالاسم أو رقم الطلب أو الهاتف..."
          className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X size={15} />
          </button>
        )}
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
          <Search size={32} className="mx-auto mb-3 opacity-30" />
          <p>{searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد طلبات'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-right font-semibold text-slate-500">رقم الطلب</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-500">العميل</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-500">الهاتف</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-500">المجموع</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-500">الحالة</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-500">التاريخ</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-500">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 font-semibold">{order.orderNumber}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{order.customerName}</td>
                    <td className="px-4 py-3 text-slate-600" dir="ltr">{order.phone}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{order.total.toLocaleString()} ج.م</td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={e => handleStatusChange(order.id, e.target.value as Order['status'])}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition ${statusColors[order.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}
                      >
                        <option value="pending">معلق</option>
                        <option value="confirmed">مؤكد</option>
                        <option value="shipped">تم الشحن</option>
                        <option value="delivered">تم التسليم</option>
                        <option value="cancelled">ملغي</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                        title="عرض التفاصيل وطباعة الفاتورة"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
            إجمالي النتائج: {filtered.length} طلب
          </div>
        </div>
      )}
    </div>
  )
}
