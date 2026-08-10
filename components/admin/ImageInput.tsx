'use client'

import { useState, useRef } from 'react'
import { Upload, Link as LinkIcon, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface ImageInputProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  className?: string
  onEnter?: () => void
  onDirectAdd?: (val: string) => void
}

export default function ImageInput({ value, onChange, placeholder = 'رابط الصورة...', className = '', onEnter, onDirectAdd }: ImageInputProps) {
  const [mode, setMode] = useState<'url' | 'upload'>('url')
  const [isCompressing, setIsCompressing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة')
      return
    }

    setIsCompressing(true)
    try {
      const base64 = await compressImage(file)
      if (onDirectAdd) {
        onDirectAdd(base64)
      } else {
        onChange(base64)
      }
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      toast.error('حدث خطأ أثناء معالجة الصورة')
      console.error(err)
    } finally {
      setIsCompressing(false)
    }
  }

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // Max dimensions increased for better quality
          const MAX_WIDTH = 1200
          const MAX_HEIGHT = 1200

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height
              height = MAX_HEIGHT
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)

          // Compress to webp for best size/quality
          // Increased quality to 0.9 for better visual quality
          const dataUrl = canvas.toDataURL('image/webp', 0.9)
          resolve(dataUrl)
        }
        img.onerror = (e) => reject(e)
      }
      reader.onerror = (e) => reject(e)
    })
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Mode Switcher */}
      <div className="flex bg-slate-100 rounded-lg p-1 w-fit">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${mode === 'url' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-black'}`}
        >
          <LinkIcon size={14} />
          رابط
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${mode === 'upload' ? 'bg-white text-black shadow-sm' : 'text-slate-500 hover:text-black'}`}
        >
          <Upload size={14} />
          رفع من الجهاز
        </button>
      </div>

      {/* Inputs */}
      {mode === 'url' ? (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onEnter?.();
            }
          }}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-left"
          dir="ltr"
        />
      ) : (
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isCompressing}
            className="w-full px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-black hover:text-black transition flex items-center justify-center gap-2 bg-slate-50"
          >
            {isCompressing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                جاري المعالجة والضغط...
              </>
            ) : (
              <>
                <Upload size={18} />
                اختر صورة من جهازك
              </>
            )}
          </button>
          
          {/* Base64 Preview Text if something is selected but maybe it's not visual here */}
          {value.startsWith('data:image') && !isCompressing && (
             <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
               <div className="w-2 h-2 rounded-full bg-green-500" />
               صورة مرفوعة جاهزة للحفظ
             </div>
          )}
          
          <p className="mt-2 text-[10px] text-slate-500 bg-amber-50 p-1.5 rounded border border-amber-200">
            ⚠️ <strong>ملاحظة:</strong> يتم حفظ الصور محلياً في المتصفح. لتجنب امتلاء المساحة، يُفضل وضع رابط خارجي (URL) بدلاً من رفع عدد كبير من الصور.
          </p>
        </div>
      )}
    </div>
  )
}
