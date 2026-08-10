'use client'

import { useEffect, useState } from 'react'
import { homeSectionsDB, HomeSection, sectionLabels, sectionIcons, defaultSections } from '@/lib/homeSections'
import toast from 'react-hot-toast'
import {
  ChevronUp, ChevronDown, Eye, EyeOff, Plus, Trash2,
  RotateCcw, GripVertical, Settings, Save
} from 'lucide-react'

import { categoriesDB, StoreCategory } from '@/lib/categories'

export default function SectionsManager() {
  const [sections, setSections] = useState<HomeSection[]>([])
  const [addType, setAddType] = useState<'category' | 'banner'>('category')
  const [newCat, setNewCat] = useState('pants')
  const [newTitle, setNewTitle] = useState('')
  const [newBannerText, setNewBannerText] = useState('')
  const [newBannerLink, setNewBannerLink] = useState('/products')
  const [newBannerBg, setNewBannerBg] = useState('#000000')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [availableCats, setAvailableCats] = useState<StoreCategory[]>([])

  useEffect(() => {
    setSections(homeSectionsDB.get().sort((a, b) => a.order - b.order))
    const cats = categoriesDB.get()
    setAvailableCats(cats)
    if (cats.length > 0 && newCat === 'pants') {
      setNewCat(cats[0].slug)
    }
  }, [])

  const refresh = () => setSections(homeSectionsDB.get().sort((a, b) => a.order - b.order))

  const handleToggle = (id: string) => {
    homeSectionsDB.toggle(id)
    refresh()
    toast.success('تم التحديث')
  }

  const handleMoveUp = (id: string) => {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === id)
      if (idx <= 0) return prev
      const newSections = [...prev]
      ;[newSections[idx], newSections[idx - 1]] = [newSections[idx - 1], newSections[idx]]
      newSections.forEach((s, i) => s.order = i)
      return newSections
    })
  }

  const handleMoveDown = (id: string) => {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === id)
      if (idx >= prev.length - 1) return prev
      const newSections = [...prev]
      ;[newSections[idx], newSections[idx + 1]] = [newSections[idx + 1], newSections[idx]]
      newSections.forEach((s, i) => s.order = i)
      return newSections
    })
  }

  const handleSaveOrder = () => {
    homeSectionsDB.save(sections)
    toast.success('تم حفظ الترتيب بنجاح')
    window.dispatchEvent(new Event('home-sections-updated'))
  }

  const handleDelete = (id: string, type: string) => {
    const core = ['hero', 'shopbar', 'subscription']
    if (core.includes(id)) { toast.error('لا يمكن حذف هذا القسم'); return }
    if (!confirm('هل تريد حذف هذا القسم؟')) return
    homeSectionsDB.delete(id)
    refresh()
    toast.success('تم الحذف')
  }

  const handleSaveTitle = (id: string) => {
    homeSectionsDB.update(id, { title: editTitle })
    setEditingId(null)
    refresh()
    toast.success('تم الحفظ')
  }

  const handleAdd = () => {
    if (addType === 'category') {
      if (!newTitle.trim()) { toast.error('أدخل عنوان القسم'); return }
      homeSectionsDB.add({ type: 'category', enabled: true, category: newCat, title: newTitle })
      toast.success(`تم إضافة قسم ${newTitle}`)
    } else {
      if (!newBannerText.trim()) { toast.error('أدخل نص البانر'); return }
      homeSectionsDB.add({
        type: 'banner', enabled: true,
        bannerText: newBannerText, bannerLink: newBannerLink, bannerBg: newBannerBg,
        title: newBannerText
      })
      toast.success('تم إضافة البانر')
    }
    setNewTitle(''); setNewBannerText(''); setShowAddForm(false)
    refresh()
  }

  const handleReset = () => {
    if (!confirm('هل تريد إعادة ضبط جميع الأقسام للإعدادات الافتراضية؟')) return
    homeSectionsDB.reset()
    refresh()
    toast.success('تم إعادة الضبط')
    window.dispatchEvent(new Event('home-sections-updated'))
  }

  const coreIds = ['hero', 'shopbar', 'subscription']

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">إدارة أقسام الصفحة الرئيسية</h2>
          <p className="text-sm text-slate-500">رتّب وفعّل وأضف وأحذف أقسام الصفحة الرئيسية</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSaveOrder}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition"
          >
            <Save size={16} /> حفظ الترتيب
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition"
          >
            <Plus size={16} /> إضافة قسم
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition"
          >
            <RotateCcw size={15} /> استعادة
          </button>
        </div>
      </div>

      {/* Add Section Form */}
      {showAddForm && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
          <h3 className="font-bold text-slate-800">إضافة قسم جديد</h3>

          <div className="flex gap-2">
            {[
              { val: 'category', label: '📦 قسم منتجات' },
              { val: 'banner', label: '📣 بانر إعلاني' },
            ].map(t => (
              <button
                key={t.val}
                onClick={() => setAddType(t.val as any)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${addType === t.val ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {addType === 'category' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">الفئة</label>
                <select
                  value={newCat}
                  onChange={e => setNewCat(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {availableCats.map(c => (
                    <option key={c.id} value={c.slug}>
                      {c.parentId ? '↳ ' : ''}{c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">عنوان القسم</label>
                <input
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="مثال: تشكيلة الشتاء"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          )}

          {addType === 'banner' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">نص البانر</label>
                <input
                  value={newBannerText}
                  onChange={e => setNewBannerText(e.target.value)}
                  placeholder="مثال: 🔥 خصم 30% على كل المنتجات!"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">رابط الزر</label>
                  <input
                    value={newBannerLink}
                    onChange={e => setNewBannerLink(e.target.value)}
                    placeholder="/products"
                    dir="ltr"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">لون الخلفية</label>
                  <div className="flex gap-2">
                    <input type="color" value={newBannerBg} onChange={e => setNewBannerBg(e.target.value)}
                      className="w-10 h-10 border border-slate-200 rounded-xl cursor-pointer" />
                    <span className="text-sm text-slate-500 flex items-center">{newBannerBg}</span>
                  </div>
                </div>
              </div>
              {/* Preview */}
              <div className="rounded-xl overflow-hidden border border-slate-200">
                <div style={{ background: newBannerBg }} className="py-3 px-6 text-center text-white font-bold text-sm">
                  {newBannerText || 'نص البانر هنا...'}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={handleAdd}
              className="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition">
              إضافة
            </button>
            <button onClick={() => setShowAddForm(false)}
              className="px-5 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-100 transition">
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Sections List */}
      <div className="space-y-2">
        {sections.map((section, idx) => {
          const isCore = coreIds.includes(section.id)
          const isEditing = editingId === section.id
          return (
            <div
              key={section.id}
              className={`flex items-center gap-3 p-4 rounded-2xl border transition ${
                section.enabled
                  ? 'bg-white border-slate-200 shadow-sm'
                  : 'bg-slate-50 border-slate-100 opacity-60'
              }`}
            >
              {/* Drag Handle (visual) */}
              <GripVertical size={18} className="text-slate-300 flex-shrink-0" />

              {/* Icon + Label */}
              <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                {sectionIcons[section.type]}
              </div>

              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="flex-1 px-3 py-1 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      autoFocus
                      onKeyDown={e => e.key === 'Enter' && handleSaveTitle(section.id)}
                    />
                    <button onClick={() => handleSaveTitle(section.id)}
                      className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-semibold">حفظ</button>
                    <button onClick={() => setEditingId(null)}
                      className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">إلغاء</button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-800 text-sm">{section.title || sectionLabels[section.type]}</p>
                      {isCore && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">أساسي</span>}
                    </div>
                    <p className="text-xs text-slate-400">
                      {sectionLabels[section.type]}
                      {section.category && ` • ${section.category}`}
                      {' • الترتيب: '}{idx + 1}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Edit title */}
                {(section.type === 'category' || section.type === 'featured' || section.type === 'banner') && !isEditing && (
                  <button
                    onClick={() => { setEditingId(section.id); setEditTitle(section.title || '') }}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                    title="تعديل العنوان"
                  >
                    <Settings size={14} />
                  </button>
                )}

                {/* Move Up */}
                <button
                  onClick={() => handleMoveUp(section.id)}
                  disabled={idx === 0}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronUp size={16} />
                </button>

                {/* Move Down */}
                <button
                  onClick={() => handleMoveDown(section.id)}
                  disabled={idx === sections.length - 1}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronDown size={16} />
                </button>

                {/* Toggle */}
                <button
                  onClick={() => handleToggle(section.id)}
                  className={`p-2 rounded-lg transition ${section.enabled ? 'text-green-600 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-100'}`}
                  title={section.enabled ? 'إخفاء' : 'إظهار'}
                >
                  {section.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>

                {/* Delete */}
                {!isCore && (
                  <button
                    onClick={() => handleDelete(section.id, section.type)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="حذف"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
        <p className="text-sm text-blue-700 font-medium">
          💡 <strong>ملاحظة:</strong> التغييرات تُطبّق فور فتح الصفحة الرئيسية من المتجر. استخدم "عرض الموقع" للمعاينة.
        </p>
      </div>
    </div>
  )
}
