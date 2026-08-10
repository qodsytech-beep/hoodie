import { Order, CartItem } from '@/types'
import { storage } from './storage'

function getOrdersFromStorage(): Order[] {
  return storage.getOrders() as Order[]
}

function saveOrdersToStorage(orders: Order[]) {
  storage.saveOrders(orders)
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

  const orders = getOrdersFromStorage()
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

export async function getAllOrders(): Promise<Order[]> {
  if (typeof window === 'undefined') return []
  return getOrdersFromStorage()
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (typeof window === 'undefined') return null
  const orders = getOrdersFromStorage()
  return orders.find((o) => o.id === id) || null
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
  if (typeof window === 'undefined') return null

  const orders = getOrdersFromStorage()
  const orderIndex = orders.findIndex((o) => o.id === id)
  if (orderIndex === -1) return null
  
  orders[orderIndex] = {
    ...orders[orderIndex],
    status: status,
  }
  
  saveOrdersToStorage(orders)
  
  const verification = getOrdersFromStorage()
  return verification.find((o) => o.id === id) || null
}
