'use client'

import { useState, useEffect } from 'react'
import { X, HelpCircle } from 'lucide-react'
import { Product } from '@/types'
import { createProduct, updateProduct } from '@/lib/products'
import { useCategories } from '@/lib/useCategories'
import { useSiteSettings } from '@/lib/useSiteSettings'
import toast from 'react-hot-toast'
import ImageInput from './ImageInput'

interface ProductFormProps {
  product?: Product | null
  onClose: () => void
  onSave: () => void
}

export default function ProductForm({ product, onClose, onSave }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    descriptionEn: '',
    price: '',
    originalPrice: '',
    category: '',
    subCategory: '',
    sizes: [] as string[],
    colors: [] as string[],
    inStock: true,
    featured: false,
    material: '',
    country: '',
    images: [] as string[],
    colorImages: {} as Record<string, string>,
  })

  const [newSize, setNewSize] = useState('')
  const [newColor, setNewColor] = useState('')
  const [newImage, setNewImage] = useState('')
  const [showColorsGuide, setShowColorsGuide] = useState(false)
  
  const allCategories = useCategories()
  const parentCategories = allCategories.filter(c => !c.parentId)
  
  // Find the selected parent's ID to filter its children
  const selectedParentId = parentCategories.find(c => c.slug === formData.category)?.id
  const childCategories = allCategories.filter(c => c.parentId === selectedParentId)

  const settings = useSiteSettings()
  const COLOR_MAP = settings?.customColors?.reduce((acc, c) => ({ ...acc, [c.name]: c.hex }), {} as Record<string, string>) || {}

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        nameEn: product.nameEn || '',
        description: product.description,
        descriptionEn: product.descriptionEn || '',
        price: product.price.toString(),
        originalPrice: product.originalPrice?.toString() || '',
        category: product.category,
        subCategory: product.subCategory || '',
        sizes: product.sizes,
        colors: product.colors,
        inStock: product.inStock,
        featured: product.featured || false,
        material: product.material || '',
        country: product.country || '',
        images: product.images,
        colorImages: product.colorImages || {},
      })
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      toast.error('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
    }

    try {
      if (product) {
        const updated = await updateProduct(product.id, productData)
        if (updated) {
          toast.success('تم تحديث المنتج بنجاح')
          onSave()
          onClose()
        } else {
          toast.error('فشل تحديث المنتج')
        }
      } else {
        const created = await createProduct(productData)
        if (created) {
          toast.success('تم إضافة المنتج بنجاح')
          onSave()
          onClose()
        } else {
          toast.error('فشل إضافة المنتج')
        }
      }
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('حدث خطأ أثناء الحفظ')
    }
  }

  const addSize = () => {
    if (newSize && !formData.sizes.includes(newSize)) {
      setFormData({ ...formData, sizes: [...formData.sizes, newSize] })
      setNewSize('')
    }
  }

  const removeSize = (size: string) => {
    setFormData({ ...formData, sizes: formData.sizes.filter((s) => s !== size) })
  }

  const addColor = () => {
    if (newColor && !formData.colors.includes(newColor)) {
      setFormData({ ...formData, colors: [...formData.colors, newColor] })
      setNewColor('')
    }
  }

  const removeColor = (color: string) => {
    setFormData({ ...formData, colors: formData.colors.filter((c) => c !== color) })
  }

  const addImage = (imgUrl?: string) => {
    const targetImg = typeof imgUrl === 'string' ? imgUrl : newImage
    if (targetImg && !formData.images.includes(targetImg)) {
      setFormData(prev => ({ ...prev, images: [...prev.images, targetImg] }))
      if (targetImg === newImage) setNewImage('')
    }
  }

  const removeImage = (image: string) => {
    const newColorImages = { ...formData.colorImages }
    Object.keys(newColorImages).forEach(color => {
      if (newColorImages[color] === image) delete newColorImages[color]
    })
    setFormData({ 
      ...formData, 
      images: formData.images.filter((img) => img !== image),
      colorImages: newColorImages 
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-neutral-200 p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {product ? 'تعديل منتج' : 'إضافة منتج جديد'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">الاسم (عربي) *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">الاسم (إنجليزي)</label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">الوصف (عربي) *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">الوصف (إنجليزي)</label>
              <textarea
                value={formData.descriptionEn}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">السعر *</label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">السعر الأصلي</label>
              <input
                type="number"
                step="0.01"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">القسم الرئيسي *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value, subCategory: '' })
                }}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">اختر القسم الرئيسي</option>
                {parentCategories.map(c => (
                  <option key={c.id} value={c.slug}>{c.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">القسم الفرعي</label>
              <select
                value={formData.subCategory || ''}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-neutral-100"
                disabled={!formData.category}
              >
                <option value="">اختر القسم الفرعي</option>
                {childCategories.map(c => (
                  <option key={c.id} value={c.slug}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="block text-sm font-semibold mb-2">المقاسات</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                placeholder="أضف مقاس"
                className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="button"
                onClick={addSize}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition"
              >
                إضافة
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.sizes.map((size) => (
                <span
                  key={size}
                  className="px-3 py-1 bg-neutral-100 text-black rounded-lg flex items-center gap-2"
                >
                  {size}
                  <button
                    type="button"
                    onClick={() => removeSize(size)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-semibold">الألوان</label>
              <button 
                type="button" 
                onClick={() => setShowColorsGuide(true)}
                className="text-neutral-400 hover:text-black transition"
                title="عرض الألوان المدعومة"
              >
                <HelpCircle size={16} />
              </button>
            </div>
            
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                placeholder="أضف لون"
                className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="button"
                onClick={addColor}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition"
              >
                إضافة
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.colors.map((color) => (
                <span
                  key={color}
                  className="px-3 py-1 bg-neutral-100 text-black rounded-lg flex items-center gap-2"
                >
                  {color}
                  <button
                    type="button"
                    onClick={() => removeColor(color)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-semibold mb-2">الصور</label>
            <div className="flex gap-2 mb-2 items-start">
              <div className="flex-1">
                <ImageInput
                  value={newImage}
                  onChange={(val) => setNewImage(val)}
                  placeholder="رابط الصورة أو رفع ملف..."
                  onEnter={() => addImage()}
                  onDirectAdd={addImage}
                />
              </div>
              <button
                type="button"
                onClick={() => addImage()}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition"
              >
                إضافة
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {formData.images.map((image, index) => {
                const mappedColor = Object.entries(formData.colorImages).find(([_, img]) => img === image)?.[0] || ''
                return (
                <div key={index} className="relative group border border-neutral-200 rounded-xl p-2 bg-neutral-50">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                  
                  <div className="mt-2">
                    <label className="text-[10px] text-neutral-500 font-bold mb-1 block">اربط الصورة بلون:</label>
                    <select
                      value={mappedColor}
                      onChange={(e) => {
                        const newColor = e.target.value
                        const newMap = { ...formData.colorImages }
                        if (mappedColor) delete newMap[mappedColor]
                        if (newColor) newMap[newColor] = image
                        setFormData({ ...formData, colorImages: newMap })
                      }}
                      className="w-full text-xs p-1.5 border border-neutral-300 rounded focus:ring-1 focus:ring-black"
                    >
                      <option value="">-- اختر لون --</option>
                      {formData.colors.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeImage(image)}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-md"
                  >
                    <X size={14} />
                  </button>
                </div>
              )})}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">الخامة</label>
              <input
                type="text"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">بلد التصنيع</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.inStock}
                onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="font-semibold">متوفر</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="font-semibold">منتج مميز</span>
            </label>
          </div>

          <div className="flex gap-4 pt-4 border-t border-neutral-200">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-neutral-800 transition"
            >
              {product ? 'تحديث' : 'إضافة'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-neutral-200 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-300 transition"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>

      {/* Colors Guide Modal */}
      {showColorsGuide && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full relative">
            <button 
              onClick={() => setShowColorsGuide(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-black bg-neutral-100 p-1 rounded-full"
            >
              <X size={18} />
            </button>
            <h3 className="text-xl font-bold mb-2">الألوان المدعومة</h3>
            <p className="text-sm text-neutral-500 mb-6">
              استخدم هذه الأسماء تحديداً ليظهر اللون كدائرة ملونة في صفحة المتجر، وإلا سيظهر كاسم فقط.
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-1">
              {Object.entries(COLOR_MAP).map(([name, hex]) => (
                <div key={name} className="flex flex-col items-center gap-2 p-2 border border-neutral-100 rounded-lg hover:bg-neutral-50 transition cursor-pointer" onClick={() => {
                  setNewColor(name)
                  setShowColorsGuide(false)
                }}>
                  <div className="w-8 h-8 rounded-full border border-neutral-300 shadow-sm" style={{ backgroundColor: hex }} />
                  <span className="text-xs font-semibold">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

