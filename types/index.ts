export interface Product {
  id: string
  name: string
  nameEn?: string
  description: string
  descriptionEn?: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  subCategory?: string
  sizes: string[]
  colors: string[]
  inStock: boolean
  featured?: boolean
  material?: string
  country?: string
  colorImages?: Record<string, string> // Maps a color string to an image URL
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  product: Product
  quantity: number
  selectedSize: string
  selectedColor: string
}

export interface Order {
  id: string
  customerName: string
  phone: string
  address: string
  items: CartItem[]
  total: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  paymentMethod: 'cod' | 'online'
  createdAt: string
  orderNumber: string
}

export interface Review {
  id: string
  productId: string
  customerName: string
  rating: number
  comment: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  nameEn?: string
  image: string
  slug: string
}

export interface Coupon {
  id: string
  code: string
  discount: number
  type: 'percentage' | 'fixed'
  minPurchase?: number
  expiresAt?: string
  active: boolean
}

