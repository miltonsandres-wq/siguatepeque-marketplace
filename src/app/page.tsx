import { createClient } from '@/lib/supabase/server'
import SearchBar from '@/components/SearchBar'
import CategoryCard from '@/components/CategoryCard'
import BusinessCard from '@/components/BusinessCard'
import type { Category, Business } from '@/lib/types'

// Mock data fallback when Supabase is not configured
const mockCategories: Category[] = [
  { id: '1', name: 'Restaurantes', slug: 'restaurantes', icon: '🍽️' },
  { id: '2', name: 'Cafeterías', slug: 'cafeterias', icon: '☕' },
  { id: '3', name: 'Tiendas', slug: 'tiendas', icon: '🛍️' },
  { id: '4', name: 'Salud', slug: 'salud', icon: '🏥' },
  { id: '5', name: 'Belleza', slug: 'belleza', icon: '💇' },
  { id: '6', name: 'Tecnología', slug: 'tecnologia', icon: '💻' },
  { id: '7', name: 'Educación', slug: 'educacion', icon: '📚' },
  { id: '8', name: 'Servicios', slug: 'servicios', icon: '🔧' },
  { id: '9', name: 'Deportes', slug: 'deportes', icon: '⚽' },
  { id: '10', name: 'Hotelería', slug: 'hoteleria', icon: '🏨' },
]

const mockBusinesses: Business[] = [
  {
    id: '1', name: 'Restaurante El Pino', slug: 'restaurante-el-pino',
    description: 'Comida típica hondureña con el mejor sabor de Siguatepeque. Baleadas, plato típico y más.',
    category_id: '1', phone: '+504 2773-0001', whatsapp: '50427730001',
    address: 'Barrio El Centro, Siguatepeque', city: 'Siguatepeque',
    logo: null, cover: null, rating: 4.5, review_count: 23, featured: true,
    owner_id: null, created_at: '', updated_at: '',
    categories: { id: '1', name: 'Restaurantes', slug: 'restaurantes', icon: '🍽️' },
  },
  {
    id: '2', name: 'Café Montaña', slug: 'cafe-montana',
    description: 'El mejor café de altura de Siguatepeque. Granos 100% orgánicos cultivados localmente.',
    category_id: '2', phone: '+504 2773-0002', whatsapp: '50427730002',
    address: 'Colonia Los Pinos', city: 'Siguatepeque',
    logo: null, cover: null, rating: 4.8, review_count: 45, featured: true,
    owner_id: null, created_at: '', updated_at: '',
    categories: { id: '2', name: 'Cafeterías', slug: 'cafeterias', icon: '☕' },
  },
  {
    id: '3', name: 'Tech Solutions HN', slug: 'tech-solutions-hn',
    description: 'Reparación de celulares, laptops y accesorios tecnológicos. Servicio rápido y garantizado.',
    category_id: '6', phone: '+504 2773-0003', whatsapp: '50427730003',
    address: 'Barrio Abajo', city: 'Siguatepeque',
    logo: null, cover: null, rating: 4.2, review_count: 12, featured: true,
    owner_id: null, created_at: '', updated_at: '',
    categories: { id: '6', name: 'Tecnología', slug: 'tecnologia', icon: '💻' },
  },
  {
    id: '4', name: 'Salón Bella Vista', slug: 'salon-bella-vista',
    description: 'Cortes, tintes, manicure, pedicure y tratamientos capilares profesionales.',
    category_id: '5', phone: '+504 2773-0004', whatsapp: '50427730004',
    address: 'Col. Las Acacias', city: 'Siguatepeque',
    logo: null, cover: null, rating: 4.6, review_count: 34, featured: true,
    owner_id: null, created_at: '', updated_at: '',
    categories: { id: '5', name: 'Belleza', slug: 'belleza', icon: '💇' },
  },
  {
    id: '5', name: 'Farmacia Salud Total', slug: 'farmacia-salud-total',
    description: 'Medicamentos, consultas médicas generales y productos de cuidado personal.',
    category_id: '4', phone: '+504 2773-0005', whatsapp: '50427730005',
    address: 'Frente al parque central', city: 'Siguatepeque',
    logo: null, cover: null, rating: 4.3, review_count: 18, featured: true,
    owner_id: null, created_at: '', updated_at: '',
    categories: { id: '4', name: 'Salud', slug: 'salud', icon: '🏥' },
  },
  {
    id: '6', name: 'Tienda Don Julio', slug: 'tienda-don-julio',
    description: 'Todo para tu hogar: abarrotes, productos de limpieza, frutas y verduras frescas.',
    category_id: '3', phone: '+504 2773-0006', whatsapp: '50427730006',
    address: 'Barrio La Granja', city: 'Siguatepeque',
    logo: null, cover: null, rating: 4.0, review_count: 8, featured: true,
    owner_id: null, created_at: '', updated_at: '',
    categories: { id: '3', name: 'Tiendas', slug: 'tiendas', icon: '🛍️' },
  },
]

interface HomeProps {
  searchParams: Promise<{ q?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams
  const searchQuery = params.q || ''

  let categories: Category[] = mockCategories
  let businesses: Business[] = mockBusinesses

  try {
    const supabase = await createClient()

    const { data: catData } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (catData && catData.length > 0) {
      categories = catData
    }

    let query = supabase
      .from('businesses')
      .select('*, categories(*)')
      .order('rating', { ascending: false })
      .limit(6)

    if (searchQuery) {
      query = supabase
        .from('businesses')
        .select('*, categories(*)')
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .order('rating', { ascending: false })
        .limit(12)
    }

    const { data: bizData } = await query

    if (bizData && bizData.length > 0) {
      businesses = bizData
    }
  } catch {
    // Supabase not configured, use mock data
  }

  // Client-side search fallback for mock data
  if (searchQuery && businesses === mockBusinesses) {
    const q = searchQuery.toLowerCase()
    businesses = mockBusinesses.filter(
      b => b.name.toLowerCase().includes(q) || b.description?.toLowerCase().includes(q)
    )
  }

  return (
    <div className="animate-fade-in pb-12">
      {/* Hero Section */}
      <section className="relative bg-slate-950 text-white overflow-hidden min-h-[500px] md:min-h-[600px] flex items-center">
        {/* Dark magical background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/40 via-slate-950 to-slate-950" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-600/20 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute top-1/2 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 z-10 w-full">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 bg-white/5 border border-white/10 backdrop-blur-md rounded-full text-sm font-medium mb-6 text-primary-200">
              🏔️ Siguatepeque, Comayagua
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
              Descubre los mejores
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400 mt-2"> negocios locales</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              Encuentra restaurantes, tiendas, servicios y más en tu ciudad.
              Todo en un solo lugar.
            </p>

            <SearchBar
              initialQuery={searchQuery}
              className="max-w-2xl mx-auto shadow-2xl"
            />

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-12 text-sm opacity-80">
              <div className="text-center">
                <span className="block text-2xl md:text-3xl font-bold text-white">{businesses.length}+</span>
                <span className="text-slate-400 font-medium">Negocios</span>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <span className="block text-2xl md:text-3xl font-bold text-white">{categories.length}</span>
                <span className="text-slate-400 font-medium">Categorías</span>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <span className="block text-2xl md:text-3xl font-bold text-white">⭐</span>
                <span className="text-slate-400 font-medium">Reseñas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Diagonal cut divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
      </section>

      {/* Search Results */}
      {searchQuery && (
        <section className="max-w-6xl mx-auto px-4 pt-12">
          <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
            <h2 className="text-2xl font-bold text-white">Resultados para &ldquo;<span className="text-primary-400">{searchQuery}</span>&rdquo;</h2>
            <span className="badge">{businesses.length}</span>
          </div>
          {businesses.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-white/5 backdrop-blur-sm">
              <span className="text-5xl block mb-4 opacity-50">🔍</span>
              <p className="text-slate-300 text-lg font-medium">No se encontraron negocios</p>
              <p className="text-slate-500 mt-2">Intenta con otro término de búsqueda</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {businesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Categories */}
      {!searchQuery && (
        <>
          <section id="categorias" className="max-w-6xl mx-auto px-4 pt-16 pb-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white tracking-tight">Explora por categoría</h2>
              <p className="text-slate-400 mt-3 text-lg">Encuentra exactamente lo que necesitas</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 stagger-children">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </section>

          {/* Featured Businesses */}
          <section className="max-w-6xl mx-auto px-4 py-16">
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Negocios destacados</h2>
                <p className="text-slate-400 mt-2">Los mejor valorados por la comunidad</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {businesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="max-w-5xl mx-auto px-4 pb-20">
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden border border-white/10 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-purple-600/20" />
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary-500/20 rounded-full blur-[80px]" />
              
              <div className="relative z-10">
                <span className="text-5xl block mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">🚀</span>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">¿Tienes un negocio en Siguatepeque?</h2>
                <p className="text-slate-300 md:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                  Únete a la plataforma, registra tu negocio completamente gratis y empieza a llegar a más clientes hoy mismo.
                </p>
                <a href="/login" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]">
                  Registrar mi negocio ahora
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
