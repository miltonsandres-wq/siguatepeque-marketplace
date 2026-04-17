import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://siguamarket.com'

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  try {
    const supabase = await createClient()

    // Category routes
    const { data: categories } = await supabase.from('categories').select('slug')
    const categoryRoutes: MetadataRoute.Sitemap = (categories || []).map((cat) => ({
      url: `${baseUrl}/categoria/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Business routes
    const { data: businesses } = await supabase.from('businesses').select('slug, updated_at')
    const businessRoutes: MetadataRoute.Sitemap = (businesses || []).map((biz) => ({
      url: `${baseUrl}/negocio/${biz.slug}`,
      lastModified: new Date(biz.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))

    return [...staticRoutes, ...categoryRoutes, ...businessRoutes]
  } catch {
    return staticRoutes
  }
}
