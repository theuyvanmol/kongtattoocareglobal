import type { Metadata, Viewport } from 'next'
import { Barlow, Barlow_Condensed } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { defaultMetadata } from '@/lib/metadata'
import Tracker from '@/components/Tracker'

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-barlow',
  display: 'swap',
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-barlow-condensed',
  display: 'swap',
})

export const metadata: Metadata = defaultMetadata

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
    { media: '(prefers-color-scheme: light)', color: '#f4f4f4' },
  ],
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-Q511J1G49N'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        {/* Preconnect to external origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://js.stripe.com" />
        {/* Google Search Console verification */}
        <meta name="google-site-verification" content="XoVJoKNy1zY6l5PgdziQ9j0e-UsXxqukNmacVJ-pgk0" />
        {/* SEO: additional meta */}
        <meta name="theme-color" content="#E61E32" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="geo.region" content="GB" />
        <meta name="geo.placename" content="United Kingdom" />
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`${barlow.variable} ${barlowCondensed.variable}`}>
        <Tracker />
        {children}

        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { page_path: window.location.pathname });
        `}</Script>

        {/* Shopify headless analytics bridge */}
        <Script src="/assets/shopify-analytics.js" strategy="afterInteractive" />

        {/* Theme init — prevents flash */}
        <Script id="theme-init" strategy="beforeInteractive">{`
          (function(){
            var t = localStorage.getItem('kong-theme') ||
              (matchMedia('(prefers-color-scheme:light)').matches ? 'light' : 'dark');
            document.documentElement.setAttribute('data-theme', t);
          })();
        `}</Script>
      </body>
    </html>
  )
}
