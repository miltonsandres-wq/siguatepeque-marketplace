import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import PortfolioGallery from '@/components/PortfolioGallery'
import ReviewCard from '@/components/ReviewCard'
import ReviewForm from '@/components/ReviewForm'
import StarRating from '@/components/StarRating'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Business, PortfolioItem, Review } from '@/lib/types'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  let name = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  let description = `Visita ${name} en Siguatepeque`

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('businesses')
      .select('name, description')
      .eq('slug', slug)
      .single()
    if (data) {
      name = data.name
      description = data.description || description
    }
  } catch {
    // use default
  }

  return {
    title: name,
    description,
    openGraph: {
      title: `${name} | SiguaMarket`,
      description,
      type: 'article',
    },
  }
}

export default async function BusinessPage({ params }: PageProps) {
  const { slug } = await params

  let business: Business | null = null
  let portfolio: PortfolioItem[] = []
  let reviews: Review[] = []

  try {
    const supabase = await createClient()

    const { data: bizData } = await supabase
      .from('businesses')
      .select('*, categories(*)')
      .eq('slug', slug)
      .single()

    if (bizData) {
      business = bizData
      console.log('Cargando datos para negocio ID:', bizData.id)

      const { data: portData } = await supabase
        .from('portfolio')
        .select('*')
        .eq('business_id', bizData.id)
        .order('created_at', { ascending: false })

      if (portData) portfolio = portData

      // Intentamos traer las reseñas. Si falla la relación con perfiles, al menos traemos la reseña sola.
      const { data: revData, error: revError } = await supabase
        .from('reviews')
        .select('*, profiles!inner(full_name, avatar_url)')
        .eq('business_id', bizData.id)
        .order('created_at', { ascending: false })
      
      if (revError) {
        console.error('Error con relación profiles, reintentando sin perfiles:', revError)
        const { data: fallbackData } = await supabase
          .from('reviews')
          .select('*')
          .eq('business_id', bizData.id)
          .order('created_at', { ascending: false })
        if (fallbackData) reviews = fallbackData as any
      } else if (revData) {
        reviews = revData
      }

      console.log('Reseñas encontradas:', reviews.length)
    }
  } catch (error) {
    console.error('Error general en BusinessPage:', error)
  }

  if (!business) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <span className="text-6xl block mb-4 opacity-70">😕</span>
        <h1 className="text-2xl font-bold mb-2 text-white">Negocio no encontrado</h1>
        <p className="text-slate-400 mb-6">No pudimos encontrar el negocio que buscas.</p>
        <Link href="/" className="btn-primary">Volver al inicio</Link>
      </div>
    )
  }

  const logoUrl = business.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(business.name)}&background=0f172a&color=3b82f6&size=200&font-size=0.35&bold=true`
  const whatsappUrl = business.whatsapp
    ? `https://wa.me/${business.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola, vi tu negocio en SiguaMarket y me gustaría más información.`)}`
    : null

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: business.description,
    telephone: business.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address,
      addressLocality: business.city || 'Siguatepeque',
      addressRegion: 'Comayagua',
      addressCountry: 'HN',
    },
    aggregateRating: business.review_count > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: business.rating,
      reviewCount: business.review_count,
    } : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="animate-fade-in pb-12">
        {/* Cover */}
        <div className="relative h-48 md:h-72 bg-slate-900 overflow-hidden border-b border-white/5">
          {business.cover ? (
            <>
               <img
                 src={business.cover}
                 alt={business.name}
                 className="w-full h-full object-cover opacity-80"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
            </>
          ) : (
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/40 via-slate-950 to-slate-950 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl opacity-10 blur-sm">
                {business.categories?.icon || '🏪'}
              </div>
            </div>
          )}
        </div>

        <div className="max-w-5xl mx-auto px-4">
          {/* Business Info Header */}
          <div className="relative -mt-16 md:-mt-24 mb-6">
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Logo */}
                <div className="-mt-16 sm:-mt-20 shrink-0">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-slate-800 relative z-10">
                    <img src={logoUrl} alt={business.name} className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 text-center sm:text-left mt-2 sm:mt-0">
                  {/* Breadcrumb */}
                  <div className="hidden sm:flex items-center justify-start gap-1.5 text-xs text-slate-500 mb-3 font-medium">
                    <Link href="/" className="hover:text-primary-400 transition-colors">Inicio</Link>
                    <span>/</span>
                    {business.categories && (
                      <>
                        <Link href={`/categoria/${business.categories.slug}`} className="hover:text-primary-400 transition-colors">
                          {business.categories.name}
                        </Link>
                        <span>/</span>
                      </>
                    )}
                    <span className="text-slate-300 truncate">{business.name}</span>
                  </div>

                  <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{business.name}</h1>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4">
                    {business.categories && (
                      <span className="badge">
                        {business.categories.icon} {business.categories.name}
                      </span>
                    )}
                    <div className="flex items-center gap-2 bg-slate-800/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
                      <StarRating rating={business.rating} size="sm" showValue />
                      <div className="w-px h-3 bg-white/20 mx-1" />
                      <span className="text-xs text-slate-400 font-medium">
                        {business.review_count} reseña{business.review_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-white/5">
                {whatsappUrl && (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp flex-1 sm:flex-none py-3 shadow-lg">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </a>
                )}
                {business.phone && (
                  <a href={`tel:${business.phone}`} className="btn-secondary flex-1 sm:flex-none py-3 shadow-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Llamar
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {business.description && (
                <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/5">
                  <h2 className="font-bold text-xl mb-4 text-white">Acerca de</h2>
                  <p className="text-slate-300 leading-relaxed">{business.description}</p>
                </div>
              )}

              {/* Portfolio */}
              <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/5">
                <h2 className="font-bold text-xl mb-6 text-white">Portafolio</h2>
                <PortfolioGallery items={portfolio} />
              </div>

              {/* Reviews */}
              <div>
                <h2 className="font-bold text-xl mb-6 text-white pl-2">
                  Reseñas ({reviews.length})
                </h2>
                <div className="space-y-4 mb-8">
                  {reviews.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-2xl border border-white/5 border-dashed">
                      <span className="text-4xl block mb-3 opacity-50">💬</span>
                      <p>Aún no hay reseñas. ¡Sé el primero!</p>
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))
                  )}
                </div>
                <ReviewForm businessId={business.id} />
              </div>
            </div>

            {/* Right Column - Info */}
            <div className="space-y-6">
              <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-white/5 sticky top-24">
                <h3 className="font-bold text-white mb-6">Información</h3>
                <div className="space-y-6">
                  {business.address && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-white/5">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="pt-0.5">
                        <p className="text-sm font-medium text-slate-300">Dirección</p>
                        <p className="text-[15px] text-white mt-1">{business.address}</p>
                        <p className="text-sm text-slate-500 mt-0.5">{business.city}</p>
                      </div>
                    </div>
                  )}

                  {business.phone && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-white/5">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div className="pt-0.5">
                        <p className="text-sm font-medium text-slate-300">Teléfono</p>
                        <a href={`tel:${business.phone}`} className="text-[15px] text-primary-400 hover:text-primary-300 transition-colors mt-1 block">
                          {business.phone}
                        </a>
                      </div>
                    </div>
                  )}

                   {business.whatsapp && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                         <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                         </svg>
                      </div>
                      <div className="pt-0.5">
                        <p className="text-sm font-medium text-slate-300">WhatsApp</p>
                        <a
                          href={whatsappUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[15px] text-emerald-400 hover:text-emerald-300 transition-colors mt-1 block"
                        >
                          Enviar mensaje
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Rating Summary Block placed inside the sticky info card at the bottom */}
                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                  <div className="text-5xl font-extrabold text-white mb-2 tracking-tighter">
                    {business.rating.toFixed(1)}
                  </div>
                  <div className="flex justify-center mb-2">
                     <StarRating rating={business.rating} size="md" />
                  </div>
                  <p className="text-sm text-slate-400 font-medium">
                    Basado en {business.review_count} reseña{business.review_count !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
