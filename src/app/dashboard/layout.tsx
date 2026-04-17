'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import type { Business } from '@/lib/types'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function checkAuthAndLoadNav() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        if (isMounted) router.push('/login')
        return
      }

      try {
        const { data: bizData } = await supabase
          .from('businesses')
          .select('*')
          .eq('owner_id', user.id)
          .maybeSingle()

        if (isMounted && bizData) {
          setBusiness(bizData)
        }
      } catch {
        // No business configured yet, that's fine
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    checkAuthAndLoadNav()

    return () => {
      isMounted = false
    }
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  if (loading) {
     return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin w-8 h-8 text-primary-500 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-slate-500 font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  const logoUrl = business?.logo || (business ? `https://ui-avatars.com/api/?name=${encodeURIComponent(business.name)}&background=0f172a&color=3b82f6&size=100&bold=true` : '')

  const navItems = [
    { name: 'Perfil del Negocio', href: '/dashboard', icon: '📋' },
    { name: 'Portafolio', href: '/dashboard/portfolio', icon: '📸' },
    { name: 'Reseñas', href: '/dashboard/reviews', icon: '⭐' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row pb-16 md:pb-0">
      
      {/* Mobile Header (Visible only on small screens) */}
      <div className="md:hidden sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 px-4 py-4 flex items-center justify-between">
         <div className="flex items-center gap-3">
             {business && (
                 <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover border border-white/10" />
             )}
             <h1 className="font-bold text-white truncate max-w-[200px]">{business?.name || 'Mi Dashboard'}</h1>
         </div>
         <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-white"
         >
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             {isMobileMenuOpen ? (
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             ) : (
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
             )}
           </svg>
         </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[45] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/5">
           <Link href="/" className="inline-block text-slate-400 hover:text-white transition-colors text-sm font-medium mb-6 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              Volver al inicio
           </Link>

           <div className="flex items-center gap-4">
             {business ? (
                 <>
                   <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 overflow-hidden shrink-0">
                     <img src={logoUrl} alt={business.name} className="w-full h-full object-cover" />
                   </div>
                   <div className="min-w-0">
                     <h2 className="font-bold text-white truncate text-lg">{business.name}</h2>
                     <p className="text-xs text-primary-400 font-medium truncate">Configuración</p>
                   </div>
                 </>
             ) : (
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-xl shrink-0">
                     🏪
                   </div>
                   <div>
                     <h2 className="font-bold text-white text-lg">Nuevo Negocio</h2>
                     <p className="text-xs text-slate-400">Completa tu perfil</p>
                   </div>
                </div>
             )}
           </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            // Precise active matching. /dashboard is exact, others are startsWith
            const isActive = item.href === '/dashboard' 
               ? pathname === '/dashboard' 
               : pathname.startsWith(item.href)

            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-600 border border-primary-500/50 text-white shadow-lg shadow-primary-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <span className="text-xl opacity-90">{item.icon}</span>
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5">
           {business && (
              <Link 
                href={`/negocio/${business.slug}`} 
                target="_blank"
                className="flex items-center justify-center gap-2 w-full py-3 mb-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-colors border border-white/5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                Ver perfil público
              </Link>
           )}

           <button 
             onClick={handleLogout}
             className="flex items-center justify-center gap-2 w-full py-3 text-red-400 hover:text-white hover:bg-red-500/20 rounded-xl text-sm font-medium transition-colors border border-transparent hover:border-red-500/30 group"
           >
              <svg className="w-4 h-4 opacity-70 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
             Cerrar sesión
           </button>
        </div>
      </aside>

      {/* Main Content Area: Offset by sidebar width on desktop */}
      <main className="flex-1 w-full max-w-7xl mx-auto overflow-y-auto md:ml-72">
         {children}
      </main>
      
    </div>
  )
}
