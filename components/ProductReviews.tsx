'use client'

import { useEffect, useState } from 'react'
import { Star, ThumbsUp, User, Send, CheckCircle } from 'lucide-react'
import { reviewsDB } from '@/lib/reviews'
import { Review } from '@/types'
import toast from 'react-hot-toast'

function StarRating({ value, onChange, size = 24 }: {
  value: number, onChange?: (v: number) => void, size?: number
}) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className={`transition-transform ${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
        >
          <Star
            size={size}
            className={`transition-colors ${
              star <= (hover || value)
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-200 fill-slate-200'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function RatingBar({ count, total, stars }: { count: number, total: number, stars: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-slate-500 w-4 text-center flex-shrink-0">{stars}</span>
      <Star size={12} className="text-amber-400 fill-amber-400 flex-shrink-0" />
      <div className="flex-1 bg-slate-100 rounded-full h-2">
        <div className="bg-amber-400 h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-slate-400 w-6 text-left flex-shrink-0">{count}</span>
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.createdAt).toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
  return (
    <div className="border border-slate-100 rounded-2xl p-5 hover:border-slate-200 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {review.customerName?.[0]?.toUpperCase() || 'E'}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{review.customerName}</p>
            <p className="text-xs text-slate-400">{date}</p>
          </div>
        </div>
        <StarRating value={review.rating} size={16} />
      </div>
      <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>
    </div>
  )
}

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState({ avg: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } })
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState({
    customerName: '',
    rating: 0,
    comment: '',
  })

  const loadReviews = () => {
    const r = reviewsDB.getByProduct(productId)
    const s = reviewsDB.getStats(productId)
    setReviews(r)
    setStats(s)
  }

  useEffect(() => {
    loadReviews()
  }, [productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.customerName.trim()) { toast.error('أدخل اسمك'); return }
    if (form.rating === 0) { toast.error('اختر تقييماً'); return }
    if (!form.comment.trim() || form.comment.trim().length < 10) {
      toast.error('اكتب مراجعة (10 أحرف على الأقل)'); return
    }

    setIsSubmitting(true)
    await new Promise(r => setTimeout(r, 500))

    reviewsDB.add({ productId, ...form })
    loadReviews()
    setForm({ customerName: '', rating: 0, comment: '' })
    setShowForm(false)
    setSubmitted(true)
    setIsSubmitting(false)
    toast.success('شكراً! تم إضافة مراجعتك بنجاح')

    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <section className="py-14 border-t border-slate-100">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">المراجعات والتقييمات</h2>
            <p className="text-slate-500 text-sm mt-1">{stats.count} مراجعة من العملاء</p>
          </div>
          {!showForm && !submitted && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition"
            >
              <Star size={16} className="fill-white" />
              اكتب مراجعة
            </button>
          )}
        </div>

        {/* Success message */}
        {submitted && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700">
            <CheckCircle size={20} />
            <p className="font-semibold">تم إضافة مراجعتك بنجاح! شكراً لك.</p>
          </div>
        )}

        {/* Review Form */}
        {showForm && (
          <div className="mb-8 bg-slate-50 rounded-2xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-5 text-lg">✍️ أضف مراجعتك</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">اسمك</label>
                <input
                  type="text"
                  value={form.customerName}
                  onChange={e => setForm(p => ({ ...p, customerName: e.target.value }))}
                  placeholder="اكتب اسمك هنا"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                  maxLength={60}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">تقييمك</label>
                <div className="flex items-center gap-3">
                  <StarRating value={form.rating} onChange={v => setForm(p => ({ ...p, rating: v }))} size={32} />
                  {form.rating > 0 && (
                    <span className="text-sm font-medium text-slate-600">
                      {['', 'سيء', 'مقبول', 'جيد', 'ممتاز', 'رائع'][form.rating]}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">مراجعتك</label>
                <textarea
                  value={form.comment}
                  onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                  placeholder="شاركنا تجربتك مع هذا المنتج..."
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm resize-none"
                />
                <p className="text-xs text-slate-400 mt-1 text-left">{form.comment.length}/500</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition disabled:opacity-50"
                >
                  {isSubmitting
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />جاري الإرسال...</>
                    : <><Send size={15} />إرسال المراجعة</>
                  }
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setForm({ customerName: '', rating: 0, comment: '' }) }}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-100 transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stats + Reviews */}
        {stats.count > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center sticky top-24">
                <p className="text-6xl font-black text-slate-900 mb-1">{stats.avg}</p>
                <StarRating value={Math.round(stats.avg)} size={20} />
                <p className="text-sm text-slate-400 mt-2">{stats.count} مراجعة</p>

                <div className="mt-5 space-y-2 text-left">
                  {[5, 4, 3, 2, 1].map(n => (
                    <RatingBar key={n} stars={n} count={stats.distribution[n] || 0} total={stats.count} />
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-4">
              {reviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-14 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex justify-center mb-3">
              <StarRating value={0} size={28} />
            </div>
            <p className="text-slate-500 font-medium">لا توجد مراجعات بعد</p>
            <p className="text-slate-400 text-sm mt-1">كن أول من يراجع هذا المنتج!</p>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition"
              >
                اكتب أول مراجعة
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
