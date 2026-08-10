import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'
import TopBar from '@/components/TopBar'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AnnouncementBar from '@/components/AnnouncementBar'
import { Toaster } from 'react-hot-toast'
import CartHydration from '@/components/CartHydration'
import MetaUpdater from '@/components/MetaUpdater'
import SyncStorage from '@/components/SyncStorage'

const cairo = Cairo({
  subsets: ['latin', 'arabic'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
  preload: true,
  fallback: ['Arial', 'sans-serif'],
})

export const metadata: Metadata = {
  title: {
    default: 'TOKO - ملابس عصرية بجودة مضمونة',
    template: '%s | TOKO',
  },
  description: 'توكو - متجر الملابس العصرية عالية الجودة. سويتشيرتات، بناطيل، تيشيرتات بأفضل الأسعار في مصر. شحن لجميع المحافظات.',
  keywords: ['ملابس', 'سويتشيرت', 'جينز', 'تيشيرت', 'ملابس مصر', 'توكو', 'TOKO', 'ملابس عصرية'],
  authors: [{ name: 'TOKO Store' }],
  creator: 'TOKO Store',
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    siteName: 'TOKO - ملابس عصرية',
    title: 'TOKO - ملابس عصرية بجودة مضمونة',
    description: 'متجر الملابس العصرية عالية الجودة. شحن لجميع محافظات مصر.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TOKO - ملابس عصرية بجودة مضمونة',
    description: 'متجر الملابس العصرية عالية الجودة. شحن لجميع محافظات مصر.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className="scroll-smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className={`${cairo.variable} font-sans antialiased bg-white`} style={{ fontFamily: 'var(--font-cairo), Cairo, Arial, sans-serif' }}>
        <SyncStorage />
        <MetaUpdater />
        <CartHydration />
        <TopBar />
        <AnnouncementBar />
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
