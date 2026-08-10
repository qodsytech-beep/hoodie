'use client'

import { useEffect, useState } from 'react'
import { siteSettings, defaultSettings, SiteSettings, DiscountCode, PaymentMethod } from '@/lib/siteSettings'
import toast from 'react-hot-toast'
import {
  Store, Phone, Globe, Image, Truck, Percent,
  Plus, Trash2, Save, RefreshCw, Bell, CreditCard, Palette
} from 'lucide-react'
import ImageInput from './ImageInput'

type Section = 'general' | 'topbar' | 'hero' | 'social' | 'shipping' | 'discounts' | 'announcements' | 'payments' | 'colors'

const sectionConfig = [
  { id: 'general' as Section, label: 'إعدادات المتجر', icon: Store },
  { id: 'topbar' as Section, label: 'الشريط العلوي', icon: Phone },
  { id: 'hero' as Section, label: 'البانر الرئيسي', icon: Image },
  { id: 'social' as Section, label: 'التواصل الاجتماعي', icon: Globe },
  { id: 'shipping' as Section, label: 'الشحن والتوصيل', icon: Truck },
  { id: 'payments' as Section, label: 'وسائل الدفع', icon: CreditCard },
  { id: 'discounts' as Section, label: 'كودات الخصم', icon: Percent },
  { id: 'announcements' as Section, label: 'الإعلانات', icon: Bell },
  { id: 'colors' as Section, label: 'ألوان المنتجات', icon: Palette },
]

export default function SiteSettingsPanel() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [activeSection, setActiveSection] = useState<Section>('general')
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Discount code form
  const [newCode, setNewCode] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    minOrderAmount: 0,
    maxUsage: 100,
    isActive: true,
  })

  // Colors form
  const [newColorName, setNewColorName] = useState('')
  const [newColorHex, setNewColorHex] = useState('#000000')

  useEffect(() => {
    setSettings(siteSettings.get())
  }, [])

  const updateField = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(r => setTimeout(r, 400))
    siteSettings.save(settings)
    setHasChanges(false)
    setIsSaving(false)
    toast.success('تم حفظ الإعدادات بنجاح')
    // Force reload to apply changes
    window.dispatchEvent(new Event('site-settings-updated'))
  }

  const handleAddDiscount = () => {
    if (!newCode.code.trim()) {
      toast.error('أدخل كود الخصم')
      return
    }
    if (newCode.value <= 0) {
      toast.error('أدخل قيمة الخصم')
      return
    }
    const added = siteSettings.addDiscountCode(newCode)
    setSettings(prev => ({
      ...prev,
      discountCodes: [...prev.discountCodes, added]
    }))
    setNewCode({ code: '', type: 'percentage', value: 0, minOrderAmount: 0, maxUsage: 100, isActive: true })
    toast.success('تم إضافة كود الخصم')
  }

  const handleDeleteDiscount = (id: string) => {
    siteSettings.deleteDiscountCode(id)
    setSettings(prev => ({
      ...prev,
      discountCodes: prev.discountCodes.filter(c => c.id !== id)
    }))
    toast.success('تم حذف الكود')
  }

  const handleToggleDiscount = (id: string) => {
    siteSettings.toggleDiscountCode(id)
    setSettings(prev => ({
      ...prev,
      discountCodes: prev.discountCodes.map(c =>
        c.id === id ? { ...c, isActive: !c.isActive } : c
      )
    }))
  }

  const handleAddColor = () => {
    if (!newColorName.trim()) { toast.error('أدخل اسم اللون'); return }
    if (!newColorHex.trim()) { toast.error('أدخل كود اللون'); return }
    const exists = settings.customColors?.some(c => c.name === newColorName.trim())
    if (exists) { toast.error('هذا اللون موجود بالفعل'); return }

    const updatedColors = [...(settings.customColors || []), { name: newColorName.trim(), hex: newColorHex }]
    updateField('customColors', updatedColors)
    setNewColorName('')
    setNewColorHex('#000000')
    toast.success('تم إضافة اللون')
  }

  const handleDeleteColor = (name: string) => {
    const updatedColors = (settings.customColors || []).filter(c => c.name !== name)
    updateField('customColors', updatedColors)
    toast.success('تم حذف اللون')
  }

  const inputClass = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition bg-white"
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5"

  return (
    <div className="flex gap-6 min-h-[600px]">
      {/* Left: Section Nav */}
      <div className="w-52 flex-shrink-0">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {sectionConfig.map(s => {
            const Icon = s.icon
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition text-right border-b border-slate-100 last:border-0
                  ${activeSection === s.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Icon size={16} className="flex-shrink-0" />
                <span>{s.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Right: Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-lg">
              {sectionConfig.find(s => s.id === activeSection)?.label}
            </h3>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition
                ${hasChanges ? 'bg-slate-900 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-400 cursor-default'}`}
            >
              {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>

          <div className="p-6 space-y-5">

            {/* General Settings */}
            {activeSection === 'general' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>اسم المتجر (يظهر في التاب)</label>
                    <input className={inputClass} value={settings.storeName} onChange={e => updateField('storeName', e.target.value)} placeholder="TOKO" />
                  </div>
                  <div>
                    <label className={labelClass}>العملة</label>
                    <input className={inputClass} value={settings.currency} onChange={e => updateField('currency', e.target.value)} placeholder="ج.م" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>أيقونة الموقع (Favicon URL)</label>
                    <ImageInput value={settings.faviconUrl || ''} onChange={val => updateField('faviconUrl', val)} placeholder="رفع أو لصق رابط..." />
                    <p className="text-xs text-slate-500 mt-1">في تبويب المتصفح.</p>
                  </div>
                  <div>
                    <label className={labelClass}>شعار المتجر (Logo URL)</label>
                    <ImageInput value={settings.storeLogoUrl || ''} onChange={val => updateField('storeLogoUrl', val)} placeholder="رفع أو لصق رابط..." />
                    <p className="text-xs text-slate-500 mt-1">يستبدل اسم المتجر باللوجو في الهيدر.</p>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>رقم الهاتف الرئيسي</label>
                  <input className={inputClass} value={settings.storePhone} onChange={e => updateField('storePhone', e.target.value)} placeholder="+20 100 000 0000" dir="ltr" />
                </div>
                <div>
                  <label className={labelClass}>البريد الإلكتروني</label>
                  <input className={inputClass} type="email" value={settings.storeEmail} onChange={e => updateField('storeEmail', e.target.value)} placeholder="info@toko.com" dir="ltr" />
                </div>
                <div>
                  <label className={labelClass}>العنوان</label>
                  <input className={inputClass} value={settings.storeAddress} onChange={e => updateField('storeAddress', e.target.value)} placeholder="القاهرة، مصر" />
                </div>
              </>
            )}

            {/* TopBar Settings */}
            {activeSection === 'topbar' && (
              <>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-slate-800">إظهار الشريط العلوي</p>
                    <p className="text-sm text-slate-500">الشريط الظاهر أعلى كل صفحة</p>
                  </div>
                  <button
                    onClick={() => updateField('topBarEnabled', !settings.topBarEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${settings.topBarEnabled ? 'bg-green-500' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${settings.topBarEnabled ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
                <div>
                  <label className={labelClass}>النص التسويقي (يسار)</label>
                  <input className={inputClass} value={settings.topBarText} onChange={e => updateField('topBarText', e.target.value)} placeholder="جودة مضمونة بضمان" />
                </div>
                <div>
                  <label className={labelClass}>رقم الهاتف في الشريط (يمين)</label>
                  <input className={inputClass} value={settings.topBarPhone} onChange={e => updateField('topBarPhone', e.target.value)} placeholder="+20 100 000 0000" dir="ltr" />
                </div>
                {/* Preview */}
                <div className="mt-4">
                  <p className="text-sm font-semibold text-slate-500 mb-2">معاينة:</p>
                  <div className={`${settings.topBarEnabled ? 'opacity-100' : 'opacity-40'} bg-neutral-800 text-white text-sm py-2 px-4 rounded-lg flex items-center justify-between`}>
                    <span>{settings.topBarPhone || '+20 100 000 0000'}</span>
                    <span>{settings.topBarText || 'جودة مضمونة بضمان'}</span>
                  </div>
                </div>
              </>
            )}

            {/* Hero Settings */}
            {activeSection === 'hero' && (
              <>
                <div>
                  <label className={labelClass}>العنوان الرئيسي</label>
                  <input className={inputClass} value={settings.heroTitle} onChange={e => updateField('heroTitle', e.target.value)} placeholder="وصلات جديدة" />
                </div>
                <div>
                  <label className={labelClass}>النص الثانوي</label>
                  <input className={inputClass} value={settings.heroSubtitle} onChange={e => updateField('heroSubtitle', e.target.value)} placeholder="أحدث تشكيلات الموسم" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>نص الزر</label>
                    <input className={inputClass} value={settings.heroButtonText} onChange={e => updateField('heroButtonText', e.target.value)} placeholder="تسوق الآن" />
                  </div>
                  <div>
                    <label className={labelClass}>رابط الزر</label>
                    <input className={inputClass} value={settings.heroButtonLink} onChange={e => updateField('heroButtonLink', e.target.value)} placeholder="/products" dir="ltr" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>صورة الخلفية (صورة البانر)</label>
                  <ImageInput value={settings.heroImage} onChange={val => updateField('heroImage', val)} placeholder="رفع أو لصق رابط..." />
                </div>
                {settings.heroImage && (
                  <div>
                    <p className="text-sm font-semibold text-slate-500 mb-2">معاينة الصورة:</p>
                    <div className="relative h-40 rounded-xl overflow-hidden border border-slate-200">
                      <img src={settings.heroImage} alt="Hero" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="text-center text-white">
                          <p className="font-bold text-xl">{settings.heroTitle}</p>
                          <p className="text-sm mt-1 opacity-80">{settings.heroSubtitle}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Social Settings */}
            {activeSection === 'social' && (
              <>
                <div>
                  <label className={labelClass}>رقم واتساب (مع كود الدولة)</label>
                  <input className={inputClass} value={settings.whatsappNumber} onChange={e => updateField('whatsappNumber', e.target.value)} placeholder="201000000000" dir="ltr" />
                  <p className="text-xs text-slate-400 mt-1">مثال: 201001234567 (بدون + أو مسافات)</p>
                </div>
                <div>
                  <label className={labelClass}>رابط فيسبوك</label>
                  <input className={inputClass} value={settings.facebookUrl} onChange={e => updateField('facebookUrl', e.target.value)} placeholder="https://facebook.com/yourpage" dir="ltr" />
                </div>
                <div>
                  <label className={labelClass}>رابط إنستغرام</label>
                  <input className={inputClass} value={settings.instagramUrl} onChange={e => updateField('instagramUrl', e.target.value)} placeholder="https://instagram.com/yourpage" dir="ltr" />
                </div>
                <div>
                  <label className={labelClass}>رابط تيك توك</label>
                  <input className={inputClass} value={settings.tiktokUrl} onChange={e => updateField('tiktokUrl', e.target.value)} placeholder="https://tiktok.com/@yourpage" dir="ltr" />
                </div>
              </>
            )}

            {/* Shipping Settings */}
            {activeSection === 'shipping' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>رسوم الشحن (ج.م)</label>
                    <input className={inputClass} type="number" min="0" value={settings.shippingFee} onChange={e => updateField('shippingFee', Number(e.target.value))} placeholder="0" />
                    <p className="text-xs text-slate-400 mt-1">0 = شحن مجاني دائماً</p>
                  </div>
                  <div>
                    <label className={labelClass}>شحن مجاني عند تجاوز (ج.م)</label>
                    <input className={inputClass} type="number" min="0" value={settings.freeShippingThreshold} onChange={e => updateField('freeShippingThreshold', Number(e.target.value))} placeholder="0" />
                    <p className="text-xs text-slate-400 mt-1">0 = لا يطبق</p>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>ملاحظة الشحن</label>
                  <textarea className={`${inputClass} resize-none`} rows={3} value={settings.shippingNote} onChange={e => updateField('shippingNote', e.target.value)} placeholder="يتم التوصيل لجميع محافظات مصر" />
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm font-semibold text-blue-800 mb-1">ملخص إعدادات الشحن:</p>
                  <p className="text-sm text-blue-700">
                    {settings.shippingFee === 0
                      ? '✓ شحن مجاني لجميع الطلبات'
                      : `رسوم الشحن: ${settings.shippingFee} ${settings.currency}`}
                    {settings.freeShippingThreshold > 0 && ` • شحن مجاني عند تجاوز ${settings.freeShippingThreshold} ${settings.currency}`}
                  </p>
                </div>
              </>
            )}

            {/* Discount Codes */}
            {activeSection === 'discounts' && (
              <>
                {/* Add New Code */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-4">إضافة كود خصم جديد</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>الكود</label>
                      <input className={inputClass} value={newCode.code} onChange={e => setNewCode(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="SALE20" dir="ltr" />
                    </div>
                    <div>
                      <label className={labelClass}>نوع الخصم</label>
                      <select className={inputClass} value={newCode.type} onChange={e => setNewCode(p => ({ ...p, type: e.target.value as any }))}>
                        <option value="percentage">نسبة مئوية (%)</option>
                        <option value="fixed">مبلغ ثابت (ج.م)</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>القيمة {newCode.type === 'percentage' ? '(%)' : '(ج.م)'}</label>
                      <input className={inputClass} type="number" min="1" value={newCode.value || ''} onChange={e => setNewCode(p => ({ ...p, value: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <label className={labelClass}>الحد الأدنى للطلب (ج.م)</label>
                      <input className={inputClass} type="number" min="0" value={newCode.minOrderAmount || ''} onChange={e => setNewCode(p => ({ ...p, minOrderAmount: Number(e.target.value) }))} placeholder="0" />
                    </div>
                    <div>
                      <label className={labelClass}>الحد الأقصى للاستخدام</label>
                      <input className={inputClass} type="number" min="1" value={newCode.maxUsage || ''} onChange={e => setNewCode(p => ({ ...p, maxUsage: Number(e.target.value) }))} placeholder="100" />
                    </div>
                  </div>
                  <button
                    onClick={handleAddDiscount}
                    className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition"
                  >
                    <Plus size={16} /> إضافة الكود
                  </button>
                </div>

                {/* Existing Codes */}
                <div className="space-y-3">
                  {settings.discountCodes.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <Percent size={32} className="mx-auto mb-2 opacity-50" />
                      <p>لا توجد كودات خصم حتى الآن</p>
                    </div>
                  ) : (
                    settings.discountCodes.map(code => (
                      <div key={code.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-800 text-sm bg-slate-100 px-2 py-0.5 rounded">{code.code}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${code.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                              {code.isActive ? 'مفعّل' : 'معطّل'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">
                            خصم {code.value}{code.type === 'percentage' ? '%' : ' ج.م'}
                            {code.minOrderAmount > 0 && ` • حد أدنى ${code.minOrderAmount} ج.م`}
                            {' • '}{code.usageCount}/{code.maxUsage} استخدام
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleDiscount(code.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${code.isActive ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                          >
                            {code.isActive ? 'تعطيل' : 'تفعيل'}
                          </button>
                          <button onClick={() => handleDeleteDiscount(code.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {/* Payment Methods */}
            {activeSection === 'payments' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-500">فعّل أو عطّل وسائل الدفع المتاحة لعملائك. التغييرات تُطبّق فوراً في صفحة الدفع.</p>
                {(settings.paymentMethods || []).map((method, idx) => (
                  <div key={method.id} className={`rounded-2xl border p-5 transition ${method.enabled ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{method.icon}</span>
                        <div>
                          <p className="font-bold text-slate-800">{method.name}</p>
                          <p className="text-xs text-slate-400">{method.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const updated = (settings.paymentMethods || []).map((m, i) =>
                            i === idx ? { ...m, enabled: !m.enabled } : m
                          )
                          updateField('paymentMethods', updated)
                        }}
                        className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${method.enabled ? 'bg-green-500' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${method.enabled ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                    {method.enabled && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">تعليمات الدفع (اختياري)</label>
                        <textarea
                          value={method.instructions || ''}
                          onChange={e => {
                            const updated = (settings.paymentMethods || []).map((m, i) =>
                              i === idx ? { ...m, instructions: e.target.value } : m
                            )
                            updateField('paymentMethods', updated)
                          }}
                          placeholder={`تعليمات لـ ${method.name}...`}
                          rows={2}
                          className={`${inputClass} resize-none text-sm`}
                        />
                      </div>
                    )}
                  </div>
                ))}
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-sm text-amber-700">
                    ✅ وسائل مفعّلة: <strong>{(settings.paymentMethods || []).filter(m => m.enabled).map(m => m.name).join(' • ') || 'لا شيء'}</strong>
                  </p>
                </div>
              </div>
            )}

            {/* Announcements */}
            {activeSection === 'announcements' && (
              <>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-slate-800">إظهار إشعار الموقع</p>
                    <p className="text-sm text-slate-500">شريط إشعار ملون يظهر أسفل النافبار</p>
                  </div>
                  <button
                    onClick={() => updateField('announcementEnabled', !settings.announcementEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${settings.announcementEnabled ? 'bg-green-500' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${settings.announcementEnabled ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
                <div>
                  <label className={labelClass}>نص الإشعار</label>
                  <textarea className={`${inputClass} resize-none`} rows={3} value={settings.announcementText} onChange={e => updateField('announcementText', e.target.value)} placeholder="مثال: خصم 20% على جميع المنتجات لفترة محدودة! 🔥" />
                </div>
                {settings.announcementEnabled && settings.announcementText && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-slate-500 mb-2">معاينة:</p>
                    <div className="bg-black text-white text-sm py-2.5 px-4 rounded-lg text-center font-medium">
                      📢 {settings.announcementText}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ================= COLORS ================= */}
            {activeSection === 'colors' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">ألوان المنتجات</h3>
                  <p className="text-sm text-slate-500">أضف الألوان ليتم عرضها في بطاقات المنتجات وتسهيل إضافتها في قسم تعديل المنتجات.</p>
                </div>

                {/* Add New Color */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm">إضافة لون جديد</h4>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className={labelClass}>اسم اللون (عربي)</label>
                      <input type="text" placeholder="مثال: أحمر قرمزي" value={newColorName} onChange={e => setNewColorName(e.target.value)} className={inputClass} />
                    </div>
                    <div className="w-24">
                      <label className={labelClass}>الدرجة</label>
                      <input type="color" value={newColorHex} onChange={e => setNewColorHex(e.target.value)} className="w-full h-11 p-1 rounded-xl cursor-pointer border border-slate-200" />
                    </div>
                  </div>
                  <button onClick={handleAddColor} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition w-full sm:w-auto">
                    إضافة
                  </button>
                </div>

                {/* Colors List */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {(settings.customColors || []).map((color, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 bg-white shadow-sm relative group">
                      <button onClick={() => handleDeleteColor(color.name)} className="absolute top-1 left-1 p-1.5 text-red-500 opacity-0 group-hover:opacity-100 transition hover:bg-red-50 rounded-lg">
                        <Trash2 size={14} />
                      </button>
                      <div className="w-10 h-10 rounded-full border shadow-inner mb-2" style={{ background: color.hex }}></div>
                      <span className="font-semibold text-sm text-slate-800">{color.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">{color.hex}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
