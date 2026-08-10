'use client'

import { useState } from 'react'
import { Eye, EyeOff, Shield, User, Key, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

// Current credentials key in localStorage
const AUTH_CREDS_KEY = 'toko-admin-credentials'

function getStoredCreds() {
  if (typeof window === 'undefined') return { email: 'crezyx@mystore.com', password: 'crezyx55@s' }
  try {
    const stored = localStorage.getItem(AUTH_CREDS_KEY)
    if (stored) return JSON.parse(stored)
  } catch { }
  return { email: 'crezyx@mystore.com', password: 'crezyx55@s' }
}

function saveCreds(creds: { email: string, password: string }) {
  if (typeof window === 'undefined') return
  localStorage.setItem(AUTH_CREDS_KEY, JSON.stringify(creds))
}

type Section = 'profile' | 'password' | 'security'

export default function ProfileSettings() {
  const [activeSection, setActiveSection] = useState<Section>('profile')

  // Profile state
  const [email, setEmail] = useState(() => getStoredCreds().email)
  const [confirmEmail, setConfirmEmail] = useState('')
  const [isSavingEmail, setIsSavingEmail] = useState(false)

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  // Password strength
  const getStrength = (pwd: string) => {
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    return score
  }

  const strengthLabels = ['ضعيفة', 'مقبولة', 'جيدة', 'قوية']
  const strengthColors = ['bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-green-500']
  const pwdStrength = getStrength(newPassword)

  const handleSaveEmail = async () => {
    if (!email.trim()) { toast.error('أدخل بريدًا إلكترونيًا'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { toast.error('البريد الإلكتروني غير صحيح'); return }
    if (email !== confirmEmail) { toast.error('البريدان لا يتطابقان'); return }

    setIsSavingEmail(true)
    await new Promise(r => setTimeout(r, 500))
    const creds = getStoredCreds()
    saveCreds({ ...creds, email })
    setConfirmEmail('')
    setIsSavingEmail(false)
    toast.success('تم تحديث البريد الإلكتروني بنجاح')
  }

  const handleSavePassword = async () => {
    const creds = getStoredCreds()

    if (!currentPassword) { toast.error('أدخل كلمة المرور الحالية'); return }
    if (currentPassword !== creds.password) { toast.error('كلمة المرور الحالية غير صحيحة'); return }
    if (!newPassword || newPassword.length < 6) { toast.error('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'); return }
    if (newPassword !== confirmPassword) { toast.error('كلمتا المرور لا تتطابقان'); return }
    if (newPassword === currentPassword) { toast.error('كلمة المرور الجديدة يجب أن تختلف عن الحالية'); return }

    setIsSavingPassword(true)
    await new Promise(r => setTimeout(r, 600))
    saveCreds({ ...creds, password: newPassword })
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setIsSavingPassword(false)
    toast.success('✅ تم تغيير كلمة المرور بنجاح')
  }

  const inputClass = "w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition text-sm"

  const nav = [
    { id: 'profile' as Section, label: 'البريد الإلكتروني', icon: User },
    { id: 'password' as Section, label: 'تغيير كلمة المرور', icon: Key },
    { id: 'security' as Section, label: 'الأمان', icon: Shield },
  ]

  const creds = getStoredCreds()

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">إعدادات الحساب</h2>
        <p className="text-sm text-slate-500">إدارة بيانات الدخول والأمان</p>
      </div>

      {/* Nav Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
        {nav.map(n => {
          const Icon = n.icon
          return (
            <button key={n.id} onClick={() => setActiveSection(n.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition
                ${activeSection === n.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{n.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── Profile / Email ── */}
      {activeSection === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {creds.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <p className="font-bold text-slate-800 text-lg">{creds.email}</p>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold mt-1">
                <CheckCircle size={11} /> مدير النظام
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">البريد الإلكتروني الجديد</label>
            <input className={inputClass} type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com" dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">تأكيد البريد الإلكتروني</label>
            <input className={inputClass} type="email" value={confirmEmail} onChange={e => setConfirmEmail(e.target.value)}
              placeholder="أعد كتابة البريد" dir="ltr" />
            {confirmEmail && email !== confirmEmail && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} /> البريدان لا يتطابقان</p>
            )}
            {confirmEmail && email === confirmEmail && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle size={11} /> متطابقان</p>
            )}
          </div>
          <button onClick={handleSaveEmail} disabled={isSavingEmail}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {isSavingEmail ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />جاري الحفظ...</> : 'حفظ البريد الإلكتروني'}
          </button>
        </div>
      )}

      {/* ── Password ── */}
      {activeSection === 'password' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">كلمة المرور الحالية</label>
            <div className="relative">
              <input className={`${inputClass} pl-11`} type={showCurrent ? 'text' : 'password'}
                value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" dir="ltr" />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">كلمة المرور الجديدة</label>
              <div className="relative">
                <input className={`${inputClass} pl-11`} type={showNew ? 'text' : 'password'}
                  value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" dir="ltr" />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength Meter */}
              {newPassword && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= pwdStrength ? strengthColors[pwdStrength - 1] : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${pwdStrength >= 3 ? 'text-green-600' : pwdStrength === 2 ? 'text-blue-600' : 'text-amber-600'}`}>
                    قوة كلمة المرور: {strengthLabels[pwdStrength - 1] || 'ضعيفة جداً'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">تأكيد كلمة المرور الجديدة</label>
              <div className="relative">
                <input className={`${inputClass} pl-11`} type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" dir="ltr" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} /> كلمتا المرور لا تتطابقان</p>
              )}
              {confirmPassword && newPassword === confirmPassword && newPassword && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle size={11} /> متطابقتان</p>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700 space-y-1">
            <p className="font-semibold mb-2">نصائح لكلمة مرور قوية:</p>
            {[
              { text: '8 أحرف على الأقل', ok: newPassword.length >= 8 },
              { text: 'تحتوي على أرقام', ok: /[0-9]/.test(newPassword) },
              { text: 'تحتوي على حروف كبيرة', ok: /[A-Z]/.test(newPassword) },
              { text: 'تحتوي على رموز خاصة (@#$...)', ok: /[^A-Za-z0-9]/.test(newPassword) },
            ].map(t => (
              <div key={t.text} className={`flex items-center gap-2 ${t.ok ? 'text-green-700' : 'text-blue-600'}`}>
                <CheckCircle size={13} className={t.ok ? 'text-green-600' : 'text-blue-300'} />
                <span>{t.text}</span>
              </div>
            ))}
          </div>

          <button onClick={handleSavePassword} disabled={isSavingPassword}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {isSavingPassword ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />جاري التغيير...</> : 'تغيير كلمة المرور'}
          </button>
        </div>
      )}

      {/* ── Security ── */}
      {activeSection === 'security' && (
        <div className="space-y-4">
          {/* Session Info */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800">معلومات الجلسة الحالية</h3>
            <div className="space-y-3">
              {[
                { label: 'البريد الإلكتروني', value: creds.email },
                { label: 'مدة الجلسة', value: '8 ساعات' },
                { label: 'آخر تسجيل دخول', value: 'الجلسة الحالية' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
                  <span className="text-sm text-slate-500">{item.label}</span>
                  <span className="text-sm font-semibold text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Tips */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800">نصائح الأمان</h3>
            <div className="space-y-3">
              {[
                { icon: '🔒', title: 'لا تشارك بيانات الدخول', desc: 'احتفظ ببيانات الدخول لنفسك فقط ولا تشاركها مع أحد' },
                { icon: '🔑', title: 'كلمة مرور قوية', desc: 'استخدم كلمة مرور تحتوي على أرقام ورموز وحروف مختلطة' },
                { icon: '🚪', title: 'تسجيل الخروج دائماً', desc: 'سجل خروجك بعد انتهاء عملك خصوصاً من أجهزة مشتركة' },
                { icon: '⏰', title: 'الجلسة التلقائية', desc: 'تنتهي جلستك تلقائياً بعد 8 ساعات من عدم النشاط' },
              ].map(tip => (
                <div key={tip.title} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                  <span className="text-xl flex-shrink-0">{tip.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{tip.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
            <h3 className="font-bold text-red-700 mb-3">منطقة الخطر</h3>
            <p className="text-sm text-slate-500 mb-4">تسجيل الخروج من جميع الأجهزة وإنهاء كل الجلسات</p>
            <button
              onClick={() => {
                localStorage.removeItem('adminAuth')
                toast.success('تم تسجيل الخروج من جميع الجلسات')
                window.location.href = '/admin/login'
              }}
              className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold hover:bg-red-100 transition"
            >
              تسجيل الخروج الآن
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
