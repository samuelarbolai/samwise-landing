import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

const SITE_DESCRIPTION =
  'A solution that stays with you until you break the loop of self-destruction — for the toughest, most insidious behavioural challenges.'

export const metadata: Metadata = {
  metadataBase: new URL('https://samwise.life'),
  title: 'Samwise',
  description: SITE_DESCRIPTION,
  icons: {
    icon: { url: '/icon.svg', type: 'image/svg+xml' },
  },
  openGraph: {
    title: 'Samwise',
    description: SITE_DESCRIPTION,
    url: 'https://samwise.life',
    siteName: 'Samwise',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Samwise',
    description: SITE_DESCRIPTION,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&family=Manrope:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
