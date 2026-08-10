'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Search, X, Package, ToggleLeft, ToggleRight } from 'lucide-react'
import { getAllProducts, deleteProduct, updateProduct } from '@/lib/products'
import { Product } from '@/types'
import toast from 'react-hot-toast'
import ProductForm from './ProductForm'

const categoryLabels: Record<string, string> = {
  all: 'الكل',
  tshirts: 'تيشيرتات',
  pants: 'بناطيل',
  sweatshirts: 'سويتشيرتات',
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState<'all' | 'inStock' | 'outOfStock'>('all')

  useEffect(() => {
    const timer = setTimeout(() => loadProducts(), 100)
    return () => clearTimeout(timer)
  }, [])

  const loadProducts = async () => {
    try {
      const data = await getAllProducts()
      setProducts(data)
    } catch { /* silent */ } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return
    try {
      const success = await deleteProduct(id)
      if (success) {
        toast.success('تم حذف المنتج')
        setProducts(prev => prev.filter(p => p.id !== id))
      } else {
        toast.error('حدث خطأ أثناء الحذف')
      }
    } catch {
      toast.error('حدث خطأ أثناء الحذف')
    }
  }

  const handleToggleStock = async (product: Product) => {
    try {
      const updated = await updateProduct(product.id, { inStock: !product.inStock })
      if (updated) {
        setProducts(prev => prev.map(p => p.id === product.id ? updated : p))
        toast.success(updated.inStock ? 'تم تفعيل المنتج' : 'تم إيقاف المنتج')
      }
    } catch {
      toast.error('حدث خطأ')
    }
  }

  const handleToggleFeatured = async (product: Product) => {
    try {
      const updated = await updateProduct(product.id, { featured: !product.featured })
      if (updated) {
        setProducts(prev => prev.map(p => p.id === product.id ? updated : p))
        toast.success(updated.featured ? 'تم تمييز المنتج' : 'تم إلغاء التمييز')
      }
    } catch {
      toast.error('حدث خطأ')
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingProduct(null)
    loadProducts()
  }

  // Unique categories from products
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]

  const filtered = products.filter(p => {
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter
    const matchesStock = stockFilter === 'all' || (stockFilter === 'inStock' ? p.inStock : !p.inStock)
    const q = searchQuery.toLowerCase()
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    return matchesCat && matchesStock && matchesSearch
  })

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>
  }

  return (
    <div className="space-y-5">
      {showForm && (
        <ProductForm product={editingProduct} onClose={handleFormClose} onSave={loadProducts} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">إدارة المنتجات</h2>
          <p className="text-sm text-slate-500">{products.length} منتج • {products.filter(p=>p.inStock).length} متوفر</p>
        </div>
        <button
          onClick={() => { setEditingProduct(null); setShowForm(true) }}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-700 transition"
        >
          <Plus size={18} />
          إضافة منتج
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث عن منتج..."
            className="w-full pr-9 pl-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <X size={15} />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white text-slate-700"
        >
          {categories.map(c => (
            <option key={c} value={c}>{categoryLabels[c] || c}</option>
          ))}
        </select>

        {/* Stock Filter */}
        <select
          value={stockFilter}
          onChange={e => setStockFilter(e.target.value as any)}
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white text-slate-700"
        >
          <option value="all">كل الحالات</option>
          <option value="inStock">متوفر</option>
          <option value="outOfStock">غير متوفر</option>
        </select>
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
          <Package size={32} className="mx-auto mb-3 opacity-30" />
          <p>{searchQuery ? 'لا توجد منتجات تطابق البحث' : 'لا توجد منتجات'}</p>
          {!searchQuery && (
            <button onClick={() => setShowForm(true)} className="mt-4 px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition">
              إضافة منتج جديد
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-right font-semibold text-slate-500">المنتج</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-500">السعر</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-500">الفئة</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-500">التوفر</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-500">مميز</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-500">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-xl flex-shrink-0 border border-slate-100"
                          onError={e => (e.currentTarget.style.display='none')}
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{product.name}</p>
                          <p className="text-xs text-slate-400">{product.sizes.join(' • ')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-800">{product.price.toLocaleString()} ج.م</p>
                      {product.originalPrice && (
                        <p className="text-xs text-slate-400 line-through">{product.originalPrice.toLocaleString()} ج.م</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                        {categoryLabels[product.category] || product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStock(product)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          product.inStock
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {product.inStock ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        {product.inStock ? 'متوفر' : 'غير متوفر'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleFeatured(product)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          product.featured
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {product.featured ? '⭐ مميز' : 'عادي'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setEditingProduct(product); setShowForm(true) }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="تعديل"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="حذف"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
            {filtered.length} منتج
          </div>
        </div>
      )}
    </div>
  )
}
