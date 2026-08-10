// نظام تخزين محلي باستخدام localStorage
// يعمل فقط في المتصفح (client-side)

export const storage = {
  // Products
  getProducts: (): any[] => {
    if (typeof window === 'undefined') return []
    
    // بيانات افتراضية
    const defaultProducts = [
      {
        id: '1',
        name: 'تيشيرت قطني أساسي',
        nameEn: 'Essential Cotton T-Shirt',
        description: 'تيشيرت قطني ناعم ومريح، مثالي للارتداء اليومي',
        descriptionEn: 'Soft and comfortable cotton t-shirt, perfect for daily wear',
        price: 89,
        originalPrice: 120,
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
          'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800',
        ],
        category: 'tshirts',
        subCategory: 'men',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['أسود', 'أبيض', 'رمادي'],
        inStock: true,
        featured: true,
        material: '100% قطن',
        country: 'مصر',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'بنطلون جينز كاجوال',
        nameEn: 'Casual Denim Jeans',
        description: 'بنطلون جينز كلاسيكي بتصميم عصري',
        descriptionEn: 'Classic denim jeans with modern design',
        price: 199,
        images: [
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
          'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
        ],
        category: 'pants',
        subCategory: 'men',
        sizes: ['28', '30', '32', '34', '36'],
        colors: ['أزرق فاتح', 'أزرق داكن', 'أسود'],
        inStock: true,
        featured: true,
        material: '98% قطن، 2% إيلاستين',
        country: 'تركيا',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'سويتشيرت هودي',
        nameEn: 'Hoodie Sweatshirt',
        description: 'سويتشيرت دافئ ومريح مع كاب',
        descriptionEn: 'Warm and comfortable hoodie with cap',
        price: 249,
        originalPrice: 299,
        images: [
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
          'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
        ],
        category: 'sweatshirts',
        subCategory: 'unisex',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['أسود', 'رمادي', 'بيج'],
        inStock: true,
        featured: true,
        material: '80% قطن، 20% بوليستر',
        country: 'مصر',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        name: 'سويتشيرت أوفرسايز أسود',
        nameEn: 'Oversized Black Sweatshirt',
        description: 'سويتشيرت أوفرسايز عصري بتصميم مريح وأنيق',
        descriptionEn: 'Modern oversized sweatshirt with comfortable and elegant design',
        price: 1190,
        originalPrice: 1680,
        images: [
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1000',
          'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1000',
        ],
        category: 'sweatshirts',
        subCategory: 'unisex',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['أسود'],
        inStock: true,
        featured: true,
        material: 'قطن طبيعي ممتاز',
        country: 'مصر',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '5',
        name: 'سويتشيرت هودي رمادي',
        nameEn: 'Grey Hoodie Sweatshirt',
        description: 'سويتشيرت هودي رمادي بجودة عالية وتصميم عصري',
        descriptionEn: 'High quality grey hoodie with modern design',
        price: 1190,
        originalPrice: 1650,
        images: [
          'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1000',
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1000',
        ],
        category: 'sweatshirts',
        subCategory: 'unisex',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['رمادي'],
        inStock: true,
        featured: true,
        material: 'قطن طبيعي ممتاز',
        country: 'مصر',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '6',
        name: 'سويتشيرت كروز أسود',
        nameEn: 'Black Crew Sweatshirt',
        description: 'سويتشيرت كروز أسود بتصميم بسيط وأنيق',
        descriptionEn: 'Black crew sweatshirt with simple and elegant design',
        price: 999,
        originalPrice: 1200,
        images: [
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1000',
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1000',
        ],
        category: 'sweatshirts',
        subCategory: 'unisex',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['أسود'],
        inStock: true,
        featured: true,
        material: 'قطن طبيعي ممتاز',
        country: 'مصر',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '7',
        name: 'سويتشيرت هودي بيج',
        nameEn: 'Beige Hoodie Sweatshirt',
        description: 'سويتشيرت هودي بيج بتصميم مريح وأنيق',
        descriptionEn: 'Beige hoodie with comfortable and elegant design',
        price: 1150,
        originalPrice: 1600,
        images: [
          'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1000',
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1000',
        ],
        category: 'sweatshirts',
        subCategory: 'unisex',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['بيج'],
        inStock: true,
        featured: true,
        material: 'قطن طبيعي ممتاز',
        country: 'مصر',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '8',
        name: 'سويتشيرت زيب أب أسود',
        nameEn: 'Black Zip-Up Sweatshirt',
        description: 'سويتشيرت زيب أب أسود بتصميم عصري ومريح',
        descriptionEn: 'Black zip-up sweatshirt with modern and comfortable design',
        price: 1180,
        originalPrice: 1600,
        images: [
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1000',
          'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1000',
        ],
        category: 'sweatshirts',
        subCategory: 'unisex',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['أسود'],
        inStock: true,
        featured: true,
        material: 'قطن طبيعي ممتاز',
        country: 'مصر',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '9',
        name: 'بنطلون جينز سليم فيت',
        nameEn: 'Slim Fit Denim Jeans',
        description: 'بنطلون جينز سليم فيت بتصميم عصري وأنيق',
        descriptionEn: 'Slim fit denim jeans with modern and elegant design',
        price: 499,
        originalPrice: 790,
        images: [
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=1000',
          'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=1000',
        ],
        category: 'pants',
        subCategory: 'men',
        sizes: ['28', '30', '32', '34', '36'],
        colors: ['أزرق داكن', 'أسود'],
        inStock: true,
        featured: true,
        material: '98% قطن، 2% إيلاستين',
        country: 'تركيا',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '10',
        name: 'بنطلون جينز ريغولار فيت',
        nameEn: 'Regular Fit Denim Jeans',
        description: 'بنطلون جينز ريغولار فيت مريح للارتداء اليومي',
        descriptionEn: 'Regular fit denim jeans comfortable for daily wear',
        price: 499,
        originalPrice: 770,
        images: [
          'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=1000',
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=1000',
        ],
        category: 'pants',
        subCategory: 'men',
        sizes: ['28', '30', '32', '34', '36', '38'],
        colors: ['أزرق فاتح', 'أزرق داكن'],
        inStock: true,
        featured: true,
        material: '98% قطن، 2% إيلاستين',
        country: 'تركيا',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '11',
        name: 'بنطلون جينز واسع',
        nameEn: 'Wide Leg Denim Jeans',
        description: 'بنطلون جينز واسع بتصميم عصري ومريح',
        descriptionEn: 'Wide leg denim jeans with modern and comfortable design',
        price: 499,
        originalPrice: 820,
        images: [
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=1000',
          'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=1000',
        ],
        category: 'pants',
        subCategory: 'unisex',
        sizes: ['28', '30', '32', '34', '36'],
        colors: ['أزرق داكن', 'أسود'],
        inStock: true,
        featured: true,
        material: '98% قطن، 2% إيلاستين',
        country: 'تركيا',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '12',
        name: 'بنطلون كاجوال أسود',
        nameEn: 'Black Casual Pants',
        description: 'بنطلون كاجوال أسود بتصميم أنيق ومريح',
        descriptionEn: 'Black casual pants with elegant and comfortable design',
        price: 499,
        originalPrice: 600,
        images: [
          'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=1000',
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=1000',
        ],
        category: 'pants',
        subCategory: 'unisex',
        sizes: ['28', '30', '32', '34', '36'],
        colors: ['أسود'],
        inStock: true,
        featured: true,
        material: 'قطن طبيعي',
        country: 'مصر',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '13',
        name: 'بنطلون جينز تفتيح',
        nameEn: 'Light Wash Denim Jeans',
        description: 'بنطلون جينز تفتيح بتصميم كلاسيكي',
        descriptionEn: 'Light wash denim jeans with classic design',
        price: 499,
        originalPrice: 840,
        images: [
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=1000',
          'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=1000',
        ],
        category: 'pants',
        subCategory: 'men',
        sizes: ['28', '30', '32', '34', '36'],
        colors: ['أزرق فاتح'],
        inStock: true,
        featured: true,
        material: '98% قطن، 2% إيلاستين',
        country: 'تركيا',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '14',
        name: 'بنطلون جينز كربون',
        nameEn: 'Carbon Denim Jeans',
        description: 'بنطلون جينز كربون بتصميم عصري',
        descriptionEn: 'Carbon denim jeans with modern design',
        price: 499,
        originalPrice: 820,
        images: [
          'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=1000',
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=1000',
        ],
        category: 'pants',
        subCategory: 'men',
        sizes: ['28', '30', '32', '34', '36'],
        colors: ['أسود'],
        inStock: true,
        featured: true,
        material: '98% قطن، 2% إيلاستين',
        country: 'تركيا',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '15',
        name: 'بنطلون كاجوال رمادي',
        nameEn: 'Grey Casual Pants',
        description: 'بنطلون كاجوال رمادي بتصميم مريح',
        descriptionEn: 'Grey casual pants with comfortable design',
        price: 499,
        originalPrice: 790,
        images: [
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=1000',
          'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=1000',
        ],
        category: 'pants',
        subCategory: 'unisex',
        sizes: ['28', '30', '32', '34', '36'],
        colors: ['رمادي'],
        inStock: true,
        featured: true,
        material: 'قطن طبيعي',
        country: 'مصر',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
    
    try {
      const stored = localStorage.getItem('toko-products')
      const versionKey = 'toko-products-version'
      const currentVersion = '2.0'
      
      if (stored) {
        const storedVersion = localStorage.getItem(versionKey)
        if (storedVersion !== currentVersion) {
          localStorage.setItem('toko-products', JSON.stringify(defaultProducts))
          localStorage.setItem(versionKey, currentVersion)
          return defaultProducts
        }
        return JSON.parse(stored)
      } else {
        localStorage.setItem('toko-products', JSON.stringify(defaultProducts))
        localStorage.setItem(versionKey, currentVersion)
        return defaultProducts
      }
    } catch {
      try {
        localStorage.setItem('toko-products', JSON.stringify(defaultProducts))
        localStorage.setItem('toko-products-version', '2.0')
      } catch {
        // Silent fail
      }
      return defaultProducts
    }
  },
  
  resetProducts: () => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem('toko-products')
    } catch {
      // Silent fail
    }
  },

  saveProducts: (products: any[]) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('toko-products', JSON.stringify(products))
    } catch {
      // Silent fail
    }
  },

  // Orders
  getOrders: (): any[] => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem('toko-orders')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // Silent fail
    }
    return []
  },

  saveOrders: (orders: any[]) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('toko-orders', JSON.stringify(orders))
    } catch (error) {
      throw error
    }
  },

  // Customer Data
  getCustomerData: (): any | null => {
    if (typeof window === 'undefined') return null
    try {
      const stored = localStorage.getItem('toko-customer-data')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // Silent fail
    }
    return null
  },

  saveCustomerData: (data: any) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('toko-customer-data', JSON.stringify(data))
    } catch {
      // Silent fail
    }
  },

  clearCustomerData: () => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem('toko-customer-data')
    } catch {
      // Silent fail
    }
  },

  // Last Order Tracking
  getLastOrderNumber: (): string | null => {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.getItem('toko-last-order-number') || null
    } catch {
      return null
    }
  },

  saveLastOrderNumber: (orderNumber: string) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('toko-last-order-number', orderNumber)
    } catch {
      // Silent fail
    }
  },
}
