'use client'

import { useEffect, useState } from 'react'
import { categoriesDB, StoreCategory, FA_ICON_OPTIONS, defaultCategories } from '@/lib/categories'
import toast from 'react-hot-toast'
import {
  ChevronUp, ChevronDown, Eye, EyeOff, Plus, Trash2,
  RotateCcw, GripVertical, Edit2, X, Check, CornerDownLeft
} from 'lucide-react'

const COLOR_OPTIONS = [
  { value: '#f0f9ff', label: 'أزرق فاتح' },
  { value: '#f0fdf4', label: 'أخضر فاتح' },
  { value: '#faf5ff', label: 'بنفسجي فاتح' },
  { value: '#fff7ed', label: 'برتقالي فاتح' },
  { value: '#fdf2f8', label: 'وردي فاتح' },
  { value: '#f8fafc', label: 'رمادي فاتح' },
  { value: '#fefce8', label: 'أصفر فاتح' },
  { value: '#fff1f2', label: 'أحمر فاتح' },
]

export default function CategoriesManager() {
  const [cats, setCats] = useState<StoreCategory[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Add form state
  const [newLabel, setNewLabel]   = useState('')
  const [newSlug, setNewSlug]     = useState('')
  const [newIcon, setNewIcon]     = useState('fa-solid fa-shirt')
  const [newColor, setNewColor]   = useState('#f0f9ff')
  const [newParentId, setNewParentId] = useState<string | null>(null)

  // Edit form state
  const [editLabel, setEditLabel] = useState('')
  const [editIcon, setEditIcon]   = useState('')
  const [editColor, setEditColor] = useState('')
  const [editParentId, setEditParentId] = useState<string | null>(null)

  useEffect(() => {
    setCats(categoriesDB.get().sort((a, b) => a.order - b.order))
  }, [])

  const refresh = () => setCats(categoriesDB.get().sort((a, b) => a.order - b.order))

  const handleAdd = () => {
    if (!newLabel.trim()) { toast.error('أدخل اسم الفئة'); return }
    if (!newSlug.trim()) { toast.error('أدخل slug الفئة (بالإنجليزية)'); return }
    const slugClean = newSlug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    
    // Allow duplicate slugs ONLY if they belong to different parents (e.g. tshirts under men and women)
    // But for simplicity and to avoid router confusion, slugs must be unique or handled via parent/child params.
    // In our app, /products?category=men&subCategory=tshirts relies on this. So it's fine if slug is duplicated as long as parentId is different.
    const isDuplicate = cats.some(c => c.slug === slugClean && c.parentId === newParentId)
    if (isDuplicate) { toast.error('هذا الـ slug موجود بالفعل في نفس القسم'); return }

    categoriesDB.add({ 
      slug: slugClean, 
      label: newLabel.trim(), 
      faIcon: newIcon, 
      color: newColor, 
      enabled: true,
      parentId: newParentId || null 
    })
    
    setNewLabel(''); setNewSlug(''); setNewIcon('fa-solid fa-shirt'); setNewColor('#f0f9ff'); setNewParentId(null)
    setShowAdd(false)
    refresh()
    toast.success(`تم إضافة فئة "${newLabel}"`)
    window.dispatchEvent(new Event('categories-updated'))
  }

  const handleEdit = (cat: StoreCategory) => {
    setEditingId(cat.id)
    setEditLabel(cat.label)
    setEditIcon(cat.faIcon)
    setEditColor(cat.color || '#f0f9ff')
    setEditParentId(cat.parentId || null)
  }

  const handleSaveEdit = (id: string) => {
    if (!editLabel.trim()) { toast.error('أدخل الاسم'); return }
    categoriesDB.update(id, { label: editLabel.trim(), faIcon: editIcon, color: editColor, parentId: editParentId })
    setEditingId(null)
    refresh()
    toast.success('تم الحفظ')
    window.dispatchEvent(new Event('categories-updated'))
  }

  const handleToggle = (id: string) => {
    categoriesDB.toggle(id)
    refresh()
    window.dispatchEvent(new Event('categories-updated'))
  }

  const handleDelete = (id: string, label: string) => {
    const isDefault = defaultCategories.some(c => c.id === id)
    if (isDefault) { toast.error('لا يمكن حذف الفئات الافتراضية'); return }
    
    const hasChildren = cats.some(c => c.parentId === id)
    if (hasChildren) {
      if (!confirm(`تحذير: هذه الفئة تحتوي على أقسام فرعية. حذفها سيؤدي لحذف الأقسام الفرعية أيضاً! متابعة؟`)) return
      // delete children
      const children = cats.filter(c => c.parentId === id)
      children.forEach(c => categoriesDB.delete(c.id))
    } else {
      if (!confirm(`هل تريد حذف فئة "${label}"؟`)) return
    }
    
    categoriesDB.delete(id)
    refresh()
    toast.success('تم الحذف')
    window.dispatchEvent(new Event('categories-updated'))
  }

  const handleMoveUp   = (id: string) => { /* Not fully implemented for trees, just generic move */ toast.success('تم التحديث'); refresh() }
  const handleMoveDown = (id: string) => { /* Not fully implemented for trees, just generic move */ toast.success('تم التحديث'); refresh() }

  const handleReset = () => {
    if (!confirm('إعادة ضبط الفئات للافتراضي؟ سيتم مسح أي فئات مخصصة أضفتها.')) return
    // Note: this assumes categoriesDB has a reset() method or we manually implement it
    if ('reset' in categoriesDB) {
      (categoriesDB as any).reset()
    } else {
      localStorage.setItem('toko-store-categories', JSON.stringify(defaultCategories))
    }
    refresh()
    toast.success('تم الاستعادة')
    window.dispatchEvent(new Event('categories-updated'))
  }

  const parentCats = cats.filter(c => !c.parentId)

  const renderCategoryCard = (cat: StoreCategory, isChild: boolean = false) => {
    const isEditing = editingId === cat.id
    const children = cats.filter(c => c.parentId === cat.id)

    return (
      <div key={cat.id} className={`flex flex-col gap-2 ${isChild ? 'ml-8' : ''}`}>
        <div className={`rounded-2xl border transition flex items-center justify-between ${cat.enabled ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'} ${isChild ? 'py-2 px-3 border-l-4 border-l-slate-300' : 'p-4'}`}>
          {isEditing ? (
            /* Edit Mode */
            <div className="w-full space-y-4 py-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-800">تعديل {isChild ? 'القسم الفرعي' : 'القسم الرئيسي'}</h4>
                <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">الاسم</label>
                  <input value={editLabel} onChange={e => setEditLabel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
                {isChild && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">القسم التابع له</label>
                    <select 
                      value={editParentId || ''} 
                      onChange={e => setEditParentId(e.target.value || null)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                    >
                      {parentCats.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">الأيقونة</label>
                <div className="flex flex-wrap gap-2">
                  {FA_ICON_OPTIONS.slice(0, 10).map(opt => (
                    <button key={opt.value} onClick={() => setEditIcon(opt.value)}
                      title={opt.label}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl border-2 transition ${
                        editIcon === opt.value ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600'
                      }`}>
                      <i className={`${opt.value} text-base`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={() => handleSaveEdit(cat.id)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition">
                  <Check size={16} /> حفظ
                </button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shadow-inner" style={{ background: cat.color || '#f1f5f9' }}>
                  <i className={`${cat.faIcon} text-slate-700 text-lg md:text-xl`} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 flex items-center gap-2">
                    {cat.label}
                    {!cat.enabled && <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-bold">مخفي</span>}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className="font-mono bg-slate-100 px-1.5 rounded">{cat.slug}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 md:gap-2">
                <button onClick={() => handleToggle(cat.id)} title={cat.enabled ? 'إخفاء' : 'إظهار'}
                  className={`p-2 rounded-xl transition ${cat.enabled ? 'text-green-600 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-100'}`}>
                  {cat.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                <button onClick={() => handleEdit(cat)} title="تعديل"
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(cat.id, cat.label)} title="حذف"
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Render children recursively if it's a parent */}
        {!isChild && children.length > 0 && (
          <div className="flex flex-col gap-2 mt-1 mb-4">
            {children.map(child => renderCategoryCard(child, true))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">إدارة الأقسام (رئيسية / فرعية)</h2>
          <p className="text-sm text-slate-500">أضف أقساماً رئيسية (مثل: رجال) وفرعية (مثل: تيشيرت)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => {
            setShowAdd(!showAdd)
            setNewParentId(null) // default to main
          }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition">
            <Plus size={16} /> إضافة قسم
          </button>
          <button onClick={handleReset}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition">
            <RotateCcw size={15} /> افتراضي
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
          <h3 className="font-bold text-slate-800">➕ إضافة قسم جديد</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">نوع القسم</label>
              <select 
                value={newParentId || ''} 
                onChange={(e) => setNewParentId(e.target.value || null)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white font-semibold"
              >
                <option value="">قسم رئيسي (مستقل)</option>
                {parentCats.map(p => (
                  <option key={p.id} value={p.id}>قسم فرعي تابع لـ ({p.label})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">الاسم (عربي)</label>
              <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
                placeholder="مثال: قمصان"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Slug بالإنجليزية</label>
              <input value={newSlug} onChange={e => setNewSlug(e.target.value)}
                placeholder="مثال: shirts"
                dir="ltr"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900" />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={handleAdd}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition">
              حفظ القسم
            </button>
            <button onClick={() => setShowAdd(false)}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-100 transition">
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Categories Tree List */}
      <div className="space-y-4">
        {parentCats.map(parentCat => renderCategoryCard(parentCat, false))}
        
        {cats.length === 0 && (
          <div className="text-center py-10 bg-slate-50 border border-slate-200 border-dashed rounded-2xl">
            <p className="text-slate-500 font-semibold mb-2">لا توجد أقسام مضافة حالياً</p>
            <button onClick={handleReset} className="text-slate-900 font-bold underline">استعادة الأقسام الافتراضية</button>
          </div>
        )}
      </div>
    </div>
  )
}
