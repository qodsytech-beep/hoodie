'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'

// Default credentials - can be overridden by stored ones
const DEFAULT_EMAIL = 'crezyx@mystore.com'
const DEFAULT_PASSWORD = 'crezyx55@s'
const AUTH_CREDS_KEY = 'toko-admin-credentials'

function getAdminCreds() {
  if (typeof window === 'undefined') return { email: DEFAULT_EMAIL, password: DEFAULT_PASSWORD }
  try {
    const stored = localStorage.getItem(AUTH_CREDS_KEY)
    if (stored) return JSON.parse(stored)
  } catch { }
  return { email: DEFAULT_EMAIL, password: DEFAULT_PASSWORD }
}

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if account is locked
    if (lockedUntil && Date.now() < lockedUntil) {
      const secondsLeft = Math.ceil((lockedUntil - Date.now()) / 1000)
      toast.error(`محاولات كثيرة. انتظر ${secondsLeft} ثانية.`)
      return
    }

    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 600))

    const creds = getAdminCreds()
    if (email === creds.email && password === creds.password) {
      // Store auth with expiry (30 days if rememberMe, else 8 hours)
      const expiry = Date.now() + (rememberMe ? 30 * 24 : 8) * 60 * 60 * 1000
      localStorage.setItem('adminAuth', JSON.stringify({ auth: true, expiry }))
      setAttemptCount(0)
      toast.success('مرحباً بك في لوحة التحكم')
      router.push('/admin')
    } else {
      const newAttempts = attemptCount + 1
      setAttemptCount(newAttempts)

      if (newAttempts >= 5) {
        const lockTime = Date.now() + 5 * 60 * 1000 // 5 minutes
        setLockedUntil(lockTime)
        toast.error('تم تأمين الحساب مؤقتاً لمدة 5 دقائق')
      } else {
        toast.error(`البيانات غير صحيحة (${5 - newAttempts} محاولات متبقية)`)
      }
    }

    setIsLoading(false)
  }

  const isLocked = lockedUntil ? Date.now() < lockedUntil : false

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 25px 25px, white 2px, transparent 0)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="relative max-w-md w-full">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 mb-4">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">لوحة التحكم</h1>
          <p className="text-slate-400 text-sm">دخول مخصص للمشرفين فقط</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLocked || isLoading}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition disabled:opacity-50"
                placeholder="أدخل بريدك الإلكتروني"
                dir="ltr"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLocked || isLoading}
                  className="w-full px-4 py-3 pl-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition disabled:opacity-50"
                  placeholder="أدخل كلمة المرور"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/10 text-white focus:ring-white/30"
              />
              <label htmlFor="rememberMe" className="text-sm text-slate-300 select-none cursor-pointer">
                تذكرني (لمدة 30 يوماً)
              </label>
            </div>

            {/* Lock Warning */}
            {isLocked && (
              <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                <ShieldCheck size={16} />
                <span>الحساب مقفل مؤقتاً. حاول مرة أخرى بعد قليل.</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isLocked}
              className="w-full py-3.5 bg-white text-slate-900 rounded-xl font-bold text-base hover:bg-slate-100 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin" />
                  <span>جاري التحقق...</span>
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-600 mt-6">
            هذه الصفحة مخصصة للمشرفين فقط
          </p>
        </div>
      </div>
    </div>
  )
}
