import type { Metadata } from 'next'

const BASE_URL = 'https://www.kongtattoocareglobal.com'
const DEFAULT_OG = `${BASE_URL}/assets/img/og-image.jpg`

export const SITE_NAME = 'KONG Tattoo Care'
export const SITE_TITLE = 'KONG Tattoo Care UK — Premium Tattoo Aftercare'
export const SITE_DESC =
  "The UK's #1 tattoo aftercare brand — artist-developed, dermatologist-tested. Shop Numb, Renew, Glow, Defend & Expert collections. Free UK delivery over £35."

export const defaultMetadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESC,
  keywords: [
    'tattoo aftercare UK', 'tattoo healing cream', 'tattoo butter UK',
    'best tattoo aftercare', 'KONG tattoo', 'numb cream tattoo',
    'tattoo healing balm', 'tattoo glow', 'tattoo care products',
  ],
  authors: [{ name: 'KONG Tattoo Care UK', url: BASE_URL }],
  creator: 'KONG Tattoo Care',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: BASE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESC,
    images: [{ url: DEFAULT_OG, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESC,
    images: [DEFAULT_OG],
  },
  alternates: { canonical: BASE_URL },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
}

export function productMetadata(title: string, description: string, imageUrl?: string): Metadata {
  const desc = description.substring(0, 160)
  const img = imageUrl ?? DEFAULT_OG
  return {
    title,
    description: desc,
    openGraph: {
      type: 'website',
      title: `${title} | ${SITE_NAME}`,
      description: desc,
      images: [{ url: img, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description: desc, images: [img] },
    alternates: { canonical: `${BASE_URL}/products/${title.toLowerCase().replace(/\s+/g, '-')}` },
  }
}
