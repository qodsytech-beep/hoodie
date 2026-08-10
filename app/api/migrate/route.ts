import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { gzipSync } from 'zlib'

const ALLOWED_KEYS = ['settings', 'products', 'categories', 'home-sections']

export async function GET() {
  try {
    for (const key of ALLOWED_KEYS) {
      const filePath = join(process.cwd(), 'public', `store-${key}.json`)
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf-8')
        const data = JSON.parse(content)
        
        if (key === 'products') {
          for (const p of data) {
            if (p.id) {
              await setDoc(doc(db, 'store_products', p.id), p)
            }
          }
          console.log(`Migrated products collection to Firestore.`)
        } else {
          const jsonString = JSON.stringify(data)
          const compressed = gzipSync(Buffer.from(jsonString)).toString('base64')
          await setDoc(doc(db, 'store_data', key), { payload: compressed, compressed: true })
          console.log(`Migrated ${key} to Firestore with compression.`)
        }
      }
    }
    return NextResponse.json({ success: true, message: "Migration complete!" })
  } catch (err: any) {
    console.error('Migration error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
