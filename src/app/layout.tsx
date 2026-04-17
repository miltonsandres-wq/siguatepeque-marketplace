import type { Metadata, Viewport } from 'next'
import './globals.css'
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper'

export const metadata: Metadata = {
  title: {
    default: 'SiguaMarket — Directorio de Negocios de Siguatepeque',
    template: '%s | SiguaMarket',
  },
  description:
    'Descubre los mejores negocios locales de Siguatepeque. Restaurantes, cafeterías, tiendas, servicios y más en un solo lugar.',
  keywords: ['Siguatepeque', 'negocios locales', 'directorio', 'marketplace', 'Honduras', 'Comayagua'],
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'es_HN',
    siteName: 'SiguaMarket',
    title: 'SiguaMarket — Directorio de Negocios de Siguatepeque',
    description: 'Descubre los mejores negocios locales de Siguatepeque.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#020617', // slate-950
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-200 overflow-x-hidden">
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  )
}
