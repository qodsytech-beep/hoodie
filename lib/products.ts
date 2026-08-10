import { Product } from '@/types'
import { storage } from './storage'

// الحصول على المنتجات من localStorage
function getProductsFromStorage(): Product[] {
  return storage.getProducts() as Product[]
}

// حفظ المنتجات في localStorage وعلى السيرفر
function saveProductsToStorage(products: Product[]) {
  storage.saveProducts(products)
  if (typeof window !== 'undefined') {
    fetch('/api/data/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(products),
    }).catch(err => console.warn('Could not save products to server:', err))
  }
}

// Ensure products are fetched from server first, then fallback to local storage
let cachedProducts: Product[] | null = null

export async function getAllProducts(): Promise<Product[]> {
  try {
    const res = await fetch('/api/data/products', { cache: 'no-store' })
    if (res.ok) {
      const serverProducts = await res.json()
      if (serverProducts && serverProducts.length > 0) {
        if (typeof window !== 'undefined') {
          storage.saveProducts(serverProducts) // sync local
        }
        cachedProducts = serverProducts
        return serverProducts
      }
    }
  } catch {}

  if (typeof window === 'undefined') return []
  return getProductsFromStorage()
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getAllProducts()
  return products.find((p) => p.id === id) || null
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = await getAllProducts()
  return products.filter((p) => p.category === category || p.subCategory === category)
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getAllProducts()
  return products.filter((p) => p.featured)
}

export async function getRelatedProducts(category: string, excludeId: string): Promise<Product[]> {
  const products = await getAllProducts()
  return products.filter((p) => p.category === category && p.id !== excludeId).slice(0, 4)
}

export async function searchProducts(query: string): Promise<Product[]> {
  const products = await getAllProducts()
  const lowerQuery = query.toLowerCase()
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      (p.nameEn && p.nameEn.toLowerCase().includes(lowerQuery))
  )
}

// وظائف الإدارة (للوحة التحكم) - تعمل مع localStorage
export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
  const products = await getAllProducts()
  const newProduct: Product = {
    ...product,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  products.push(newProduct)
  saveProductsToStorage(products)
  return newProduct
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const products = await getAllProducts()
  const index = products.findIndex((p) => p.id === id)
  if (index === -1) return null
  
  products[index] = {
    ...products[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  saveProductsToStorage(products)
  return products[index]
}

export async function deleteProduct(id: string): Promise<boolean> {
  const products = await getAllProducts()
  const index = products.findIndex((p) => p.id === id)
  if (index === -1) return false
  
  products.splice(index, 1)
  saveProductsToStorage(products)
  return true
}

