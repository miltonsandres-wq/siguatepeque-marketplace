import { createClient } from '@/lib/supabase/server'
import BusinessCard from '@/components/BusinessCard'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Business, Category } from '@/lib/types'

// Mock data
const mockCategories: Record<string, Category> = {
  restaurantes: { id: '1', name: 'Restaurantes', slug: 'restaurantes', icon: '🍽️' },
  cafeterias: { id: '2', name: 'Cafeterías', slug: 'cafeterias', icon: '☕' },
  tiendas: { id: '3', name: 'Tiendas', slug: 'tiendas', icon: '🛍️' },
  salud: { id: '4', name: 'Salud', slug: 'salud', icon: '🏥' },
  belleza: { id: '5', name: 'Belleza', slug: 'belleza', icon: '💇' },
  tecnologia: { id: '6', name: 'Tecnología', slug: 'tecnologia', icon: '💻' },
  educacion: { id: '7', name: 'Educación', slug: 'educacion', icon: '📚' },
  servicios: { id: '8', name: 'Servicios', slug: 'servicios', icon: '🔧' },
  deportes: { id: '9', name: 'Deportes', slug: 'deportes', icon: '⚽' },
  hoteleria: { id: '10', name: 'Hotelería', slug: 'hoteleria', icon: '🏨' },
}

const mockBusinessesByCategory: Record<string, Business[]> = {
  restaurantes: [
    {
      id: '1', name: 'Restaurante El Pino', slug: 'restaurante-el-pino',
      description: 'Comida típica hondureña con el mejor sabor de Siguatepeque.',
      category_id: '1', phone: '+504 2773-0001', whatsapp: '50427730001',
      address: 'Barrio El Centro', city: 'Siguatepeque',
      logo: null, cover: null, rating: 4.5, review_count: 23, featured: true,
      owner_id: null, created_at: '', updated_at: '',
      categories: { id: '1', name: 'Restaurantes', slug: 'restaurantes', icon: '🍽️' },
    },
  ],
  cafeterias: [
    {
      id: '2', name: 'Café Montaña', slug: 'cafe-montana',
      description: 'El mejor café de altura de Siguatepeque.',
      category_id: '2', phone: '+504 2773-0002', whatsapp: '50427730002',
      address: 'Colonia Los Pinos', city: 'Siguatepeque',
      logo: null, cover: null, rating: 4.8, review_count: 45, featured: true,
      owner_id: null, created_at: '', updated_at: '',
      categories: { id: '2', name: 'Cafeterías', slug: 'cafeterias', icon: '☕' },
    },
  ],
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const categoryName = mockCategories[slug]?.name || slug

  return {
    title: `${categoryName} en Siguatepeque`,
    description: `Encuentra los mejores negocios de ${categoryName.toLowerCase()} en Siguatepeque. Directorio local con reseñas y calificaciones.`,
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params
  let category: Category | null = mockCategories[slug] || null
  let businesses: Business[] = mockBusinessesByCategory[slug] || []

  try {
    const supabase = await createClient()

    const { data: catData } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()

    if (catData) {
      category = catData

      const { data: bizData } = await supabase
        .from('businesses')
        .select('*, categories(*)')
        .eq('category_id', catData.id)
        .order('rating', { ascending: false })

      if (bizData) {
        businesses = bizData
      }
    }
  } catch {
    // Use mock data
  }

  if (!category) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <span className="text-6xl block mb-4 opacity-70">😕</span>
        <h1 className="text-2xl font-bold mb-2 text-white">Categoría no encontrada</h1>
        <p className="text-slate-400 mb-6">No pudimos encontrar la categoría que buscas.</p>
        <Link href="/" className="btn-primary">Volver al inicio</Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-in pb-12">
      {/* Header */}
      <section className="relative bg-slate-900 text-white overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/20 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-6 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>/</span>
            <span>Categorías</span>
            <span>/</span>
            <span className="text-primary-400">{category.name}</span>
          </div>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-slate-900/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-4xl shadow-inner shadow-white/5">
              {category.icon}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{category.name}</h1>
              <p className="text-slate-400 mt-2">
                {businesses.length} negocio{businesses.length !== 1 ? 's' : ''} en Siguatepeque
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Business Grid */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        {businesses.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-white/5 backdrop-blur-sm">
            <span className="text-5xl block mb-4 opacity-50">🏪</span>
            <h2 className="text-xl font-bold text-white mb-2">
              Aún no hay negocios en esta categoría
            </h2>
            <p className="text-slate-400 mb-6">
              ¿Tienes un negocio de {category.name.toLowerCase()}? ¡Regístralo gratis!
            </p>
            <Link href="/login" className="btn-primary">Registrar mi negocio</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {businesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
