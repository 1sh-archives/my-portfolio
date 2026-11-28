import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import TargetCursor from '@/components/TargetCursor'
import './globals.css'

const playfairDisplay = localFont({
  src: './fonts/PlayfairDisplay-Italic-VariableFont_wght.ttf',
  variable: '--font-playfair-display',
  weight: '400 900',
  style: 'italic',
})

const dmSans = localFont({
  src: './fonts/DMSans_24pt-Light.ttf',
  variable: '--font-dm-sans',
  weight: '300',
})

export const metadata: Metadata = {
  title: 'Portfolio - Vansh Singh',
  description: 'Interaction and digital experience designer based in Jaipur, India.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-mOHdIimB0jRBvUEAVWQqdU7SYqzP7w.png',
        type: 'image/png',
      },
    ],
    apple: '/logo.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#070707',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${dmSans.variable}`}>
      <body className="antialiased">
        <TargetCursor
          targetSelector="a[href], button:not(:disabled), [role='button']:not([aria-disabled='true']), .cursor-target"
          spinDuration={2}
          hideDefaultCursor
          parallaxOn
        />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
