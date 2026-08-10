// نظام إعدادات الموقع - يخزن في localStorage ويُقرأ من كل مكان في الموقع

export interface SiteSettings {
  // إعدادات المتجر الأساسية
  storeName: string
  storeLogoUrl: string
  storePhone: string
  storeAddress: string
  storeEmail: string
  currency: string
  faviconUrl: string

  // الـ TopBar
  topBarText: string
  topBarPhone: string
  topBarEnabled: boolean

  // الـ Hero Section
  heroTitle: string
  heroSubtitle: string
  heroButtonText: string
  heroButtonLink: string
  heroImage: string

  // الشبكات الاجتماعية
  facebookUrl: string
  instagramUrl: string
  tiktokUrl: string
  whatsappNumber: string

  // الشحن
  shippingFee: number
  freeShippingThreshold: number
  shippingNote: string

  // كودات الخصم
  discountCodes: DiscountCode[]

  // الإشعارات
  announcementText: string
  announcementEnabled: boolean

  // وسائل الدفع
  paymentMethods: PaymentMethod[]

  // الألوان المخصصة (جديد)
  customColors: CustomColor[]
}

export interface CustomColor {
  name: string
  hex: string
}

export interface PaymentMethod {
  id: string
  name: string
  nameEn: string
  icon: string
  description: string
  enabled: boolean
  instructions?: string
}

export interface DiscountCode {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minOrderAmount: number
  isActive: boolean
  usageCount: number
  maxUsage: number
}

const SETTINGS_KEY = 'toko-site-settings'
const SETTINGS_VERSION = '1.0'

export const defaultSettings: SiteSettings = {
  storeName: 'TOKO',
  storeLogoUrl: '',
  storePhone: '+20 100 000 0000',
  storeAddress: 'القاهرة، مصر',
  storeEmail: 'info@toko.com',
  currency: 'ج.م',
  faviconUrl: '',

  topBarText: 'جودة مضمونة بضمان',
  topBarPhone: '+20 100 000 0000',
  topBarEnabled: true,

  heroTitle: 'وصلات جديدة',
  heroSubtitle: 'أحدث تشكيلات الموسم بأفضل الأسعار',
  heroButtonText: 'تسوق الآن',
  heroButtonLink: '/products',
  heroImage: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920',

  facebookUrl: 'https://facebook.com',
  instagramUrl: 'https://instagram.com',
  tiktokUrl: 'https://tiktok.com',
  whatsappNumber: '201000000000',

  shippingFee: 0,
  freeShippingThreshold: 0,
  shippingNote: 'يتم التوصيل لجميع محافظات مصر',

  discountCodes: [],

  announcementText: '',
  announcementEnabled: false,

  paymentMethods: [
    {
      id: 'cod',
      name: 'الدفع عند الاستلام',
      nameEn: 'Cash on Delivery',
      icon: '💵',
      description: 'ادفع نقداً عند استلام طلبك',
      enabled: true,
      instructions: '',
    },
    {
      id: 'vodafone',
      name: 'فودافون كاش',
      nameEn: 'Vodafone Cash',
      icon: '📱',
      description: 'تحويل عبر فودافون كاش',
      enabled: false,
      instructions: 'أرسل المبلغ على رقم: 01X-XXX-XXXX ثم أرسل صورة الإيصال على واتساب',
    },
    {
      id: 'instapay',
      name: 'إنستاباي',
      nameEn: 'InstaPay',
      icon: '⚡',
      description: 'دفع إلكتروني سريع عبر InstaPay',
      enabled: false,
      instructions: 'حوّل على: username@instapay ثم أرسل لقطة شاشة التأكيد',
    },
    {
      id: 'card',
      name: 'بطاقة بنكية',
      nameEn: 'Credit / Debit Card',
      icon: '💳',
      description: 'Visa / Mastercard',
      enabled: false,
      instructions: '',
    },
  ],

  customColors: [
    { name: 'أسود', hex: '#000000' },
    { name: 'أبيض', hex: '#FFFFFF' },
    { name: 'رمادي', hex: '#808080' },
    { name: 'أحمر', hex: '#FF0000' },
    { name: 'أزرق', hex: '#2563EB' },
    { name: 'أخضر', hex: '#16A34A' },
    { name: 'أصفر', hex: '#EAB308' },
    { name: 'كحلي', hex: '#1E3A8A' },
    { name: 'بني', hex: '#78350F' },
    { name: 'بيج', hex: '#FDE68A' },
    { name: 'وردي', hex: '#F472B6' },
    { name: 'بنفسجي', hex: '#9333EA' },
    { name: 'برتقالي', hex: '#F97316' },
    { name: 'أزرق فاتح', hex: '#7DD3FC' },
    { name: 'أزرق داكن', hex: '#1D4ED8' },
    { name: 'زيتي', hex: '#3F6212' }
  ],
}

export const siteSettings = {
  get: (): SiteSettings => {
    if (typeof window === 'undefined') return defaultSettings
    try {
      const stored = localStorage.getItem(SETTINGS_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // دمج مع الإعدادات الافتراضية لضمان وجود كل المفاتيح
        return { ...defaultSettings, ...parsed }
      }
    } catch {
      // Silent fail
    }
    return defaultSettings
  },

  save: (settings: SiteSettings): void => {
    if (typeof window === 'undefined') return
    try {
      // Always save to localStorage for the admin session
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))

      // Also persist to the server so ALL users (incognito, other devices) see the changes
      fetch('/api/data/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      }).catch(err => console.warn('Could not persist settings to server:', err))
    } catch {
      // Silent fail
    }
  },

  update: (partial: Partial<SiteSettings>): SiteSettings => {
    const current = siteSettings.get()
    const updated = { ...current, ...partial }
    siteSettings.save(updated)
    return updated
  },

  // إدارة كودات الخصم
  addDiscountCode: (code: Omit<DiscountCode, 'id' | 'usageCount'>): DiscountCode => {
    const settings = siteSettings.get()
    const newCode: DiscountCode = {
      ...code,
      id: Date.now().toString(),
      usageCount: 0,
    }
    settings.discountCodes = [...settings.discountCodes, newCode]
    siteSettings.save(settings)
    return newCode
  },

  deleteDiscountCode: (id: string): void => {
    const settings = siteSettings.get()
    settings.discountCodes = settings.discountCodes.filter(c => c.id !== id)
    siteSettings.save(settings)
  },

  toggleDiscountCode: (id: string): void => {
    const settings = siteSettings.get()
    settings.discountCodes = settings.discountCodes.map(c =>
      c.id === id ? { ...c, isActive: !c.isActive } : c
    )
    siteSettings.save(settings)
  },

  validateDiscountCode: (code: string, orderTotal: number): DiscountCode | null => {
    const settings = siteSettings.get()
    const found = settings.discountCodes.find(
      c => c.code.toLowerCase() === code.toLowerCase() &&
           c.isActive &&
           orderTotal >= c.minOrderAmount &&
           c.usageCount < c.maxUsage
    )
    return found || null
  },

  useDiscountCode: (id: string): void => {
    const settings = siteSettings.get()
    settings.discountCodes = settings.discountCodes.map(c =>
      c.id === id ? { ...c, usageCount: c.usageCount + 1 } : c
    )
    siteSettings.save(settings)
  },
}
