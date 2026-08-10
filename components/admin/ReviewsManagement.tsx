'use client'

import { useEffect, useState } from 'react'
import { Star, Trash2, Search, X, RefreshCw, MessageSquare } from 'lucide-react'
import { reviewsDB } from '@/lib/reviews'
import { Review } from '@/types'
import toast from 'react-hot-toast'

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={13} className={s <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} />
      ))}
    </div>
  )
}

export default function ReviewsManagement() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all')

  const load = () => {
    const all = reviewsDB.getAll().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    setReviews(all)
  }

  useEffect(() => { load() }, [])

  const handleDelete = (id: string) => {
    if (!confirm('هل تريد حذف هذه المراجعة؟')) return
    reviewsDB.delete(id)
    load()
    toast.success('تم حذف المراجعة')
  }

  const filtered = reviews.filter(r => {
    if (ratingFilter !== 'all' && r.rating !== ratingFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return r.customerName.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q)
    }
    return true
  })

  const avgRating = reviews.length
    ? +(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  reviews.forEach(r => dist[r.rating] = (dist[r.rating] || 0) + 1)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">إدارة المراجعات</h2>
          <p className="text-sm text-slate-500">{reviews.length} مراجعة • متوسط التقييم: {avgRating}/5</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition">
          <RefreshCw size={15} /> تحديث
        </button>
      </div>

      {/* Stats Cards */}
      {reviews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[5, 4, 3, 2, 1].map(n => (
            <button
              key={n}
              onClick={() => setRatingFilter(ratingFilter === n ? 'all' : n)}
              className={`p-3 rounded-xl border text-center transition ${
                ratingFilter === n ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 hover:border-slate-400'
              }`}
            >
              <div className="flex justify-center mb-1">
                <Stars value={n} />
              </div>
              <p className={`text-xl font-bold ${ratingFilter === n ? 'text-white' : 'text-slate-800'}`}>{dist[n] || 0}</p>
              <p className={`text-xs ${ratingFilter === n ? 'text-white/70' : 'text-slate-400'}`}>{n} نجوم</p>
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ابحث في المراجعات..."
          className="w-full pr-9 pl-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X size={15} />
          </button>
        )}
      </div>

      {/* Reviews */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-14 text-center text-slate-400">
          <MessageSquare size={36} className="mx-auto mb-3 opacity-30" />
          <p>{reviews.length === 0 ? 'لا توجد مراجعات بعد' : 'لا توجد نتائج'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(review => (
            <div key={review.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {review.customerName?.[0]?.toUpperCase() || 'E'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <p className="font-bold text-slate-800">{review.customerName}</p>
                      <Stars value={review.rating} />
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        review.rating >= 4 ? 'bg-green-100 text-green-700' :
                        review.rating === 3 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {review.rating >= 4 ? 'إيجابية' : review.rating === 3 ? 'محايدة' : 'سلبية'}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-2">{review.comment}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{new Date(review.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      <span>•</span>
                      <span>المنتج: #{review.productId.slice(-6)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition flex-shrink-0"
                  title="حذف"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-xs text-slate-400 text-center">{filtered.length} مراجعة</p>
      )}
    </div>
  )
}
