import { Order, CartItem } from '@/types'
import { storage } from './storage'

function getOrdersFromStorage(): Order[] {
  return storage.getOrders() as Order[]
}

function saveOrdersToStorage(orders: Order[]) {
  storage.saveOrders(orders)
  if (typeof window !== 'undefined') {
    fetch('/api/data/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orders),
    }).catch(err => console.warn('Could not save orders to server:', err))
  }
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    const res = await fetch('/api/data/orders', { cache: 'no-store' })
    if (res.ok) {
      const serverOrders = await res.json()
      if (serverOrders && serverOrders.length > 0) {
        if (typeof window !== 'undefined') {
          storage.saveOrders(serverOrders) // sync local
        }
        return serverOrders
      }
    }
  } catch {}

  if (typeof window === 'undefined') return []
  return getOrdersFromStorage()
}

export async function createOrder(orderData: {
  customerName: string
  phone: string
  address: string
  items: CartItem[]
  total: number
  paymentMethod: 'cod' | 'online'
}): Promise<Order> {
  if (typeof window === 'undefined') {
    throw new Error('Cannot create order on server side')
  }

  const orders = await getAllOrders()
  const orderId = Date.now().toString()
  const orderNumber = `TOKO-${orderId.slice(-8)}`
  
  const order: Order = {
    id: orderId,
    ...orderData,
    status: 'pending',
    createdAt: new Date().toISOString(),
    orderNumber: orderNumber,
  }
  
  orders.push(order)
  saveOrdersToStorage(orders)
  
  return order
}

export async function getOrderById(id: string): Promise<Order | null> {
  const orders = await getAllOrders()
  return orders.find((o) => o.id === id) || null
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
  const orders = await getAllOrders()
  const orderIndex = orders.findIndex((o) => o.id === id)
  if (orderIndex === -1) return null
  
  orders[orderIndex] = {
    ...orders[orderIndex],
    status: status,
  }
  
  saveOrdersToStorage(orders)
  
  const verification = await getAllOrders()
  return verification.find((o) => o.id === id) || null
}
