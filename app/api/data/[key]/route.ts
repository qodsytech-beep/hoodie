import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore'
import { gzipSync, gunzipSync } from 'zlib'

const ALLOWED_KEYS = ['settings', 'products', 'categories', 'home-sections', 'orders']

export async function GET(
  request: Request,
  { params }: { params: { key: string } }
) {
  const key = params.key
  
  if (!ALLOWED_KEYS.includes(key)) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 })
  }

  try {
    if (key === 'products') {
      const snap = await getDocs(collection(db, 'store_products'))
      const products = snap.docs.map(d => d.data())
      return NextResponse.json(products, {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
      })
    }
    
    if (key === 'orders') {
      const snap = await getDocs(collection(db, 'store_orders'))
      const orders = snap.docs.map(d => d.data())
      return NextResponse.json(orders, {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
      })
    }

    const docRef = doc(db, 'store_data', key)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      let payload = data.payload
      if (data.compressed && typeof payload === 'string') {
        try {
          payload = JSON.parse(gunzipSync(Buffer.from(payload, 'base64')).toString('utf-8'))
        } catch (e) {
          console.error("Error decompressing payload", e)
        }
      }
      return NextResponse.json(payload || null, {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
      })
    } else {
      return NextResponse.json(null)
    }
  } catch (err) {
    console.error(`Error reading ${key} from Firestore:`, err)
    return NextResponse.json(null)
  }
}

export async function POST(
  request: Request,
  { params }: { params: { key: string } }
) {
  const key = params.key

  if (!ALLOWED_KEYS.includes(key)) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 })
  }

  try {
    const data = await request.json()
    
    if (key === 'products') {
      const incomingIds = new Set(data.map((p: any) => p.id))
      const snap = await getDocs(collection(db, 'store_products'))
      
      for (const docSnap of snap.docs) {
        if (!incomingIds.has(docSnap.id)) {
          await deleteDoc(docSnap.ref)
        }
      }
      for (const p of data) {
        if (p.id) {
          await setDoc(doc(db, 'store_products', p.id), p)
        }
      }
      return NextResponse.json({ success: true })
    }

    if (key === 'orders') {
      for (const o of data) {
        if (o.id) {
          await setDoc(doc(db, 'store_orders', o.id), o)
        }
      }
      return NextResponse.json({ success: true })
    }

    // Compress data to bypass the 1MB Firestore document size limit for other keys
    const jsonString = JSON.stringify(data)
    const compressed = gzipSync(Buffer.from(jsonString)).toString('base64')
    
    const docRef = doc(db, 'store_data', key)
    await setDoc(docRef, { payload: compressed, compressed: true })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(`Error saving ${key} to Firestore:`, err)
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 })
  }
}
