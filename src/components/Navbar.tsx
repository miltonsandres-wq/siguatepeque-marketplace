'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()
  const pathname = usePathname()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = '/'
  }

  return (
    <>
      {/* Desktop Top Navbar (Hidden on mobile) */}
      <nav className="hidden md:block sticky top-0 z-50 bg-slate-900/60 backdrop-blur-xl border-b border-white/5" style={{ boxShadow: 'var(--shadow-nav)' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl">🏔️</span>
              <div>
                <span className="font-bold text-lg text-white group-hover:text-primary-400 transition-colors">
                  Sigua
                </span>
                <span className="font-bold text-lg text-primary-500">
                  Market
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <Link href="/" className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${pathname === '/' ? 'text-white bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}>
                Inicio
              </Link>
              <Link href="/#categorias" className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${pathname === '/#categorias' ? 'text-white bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}>
                Categorías
              </Link>
              {user ? (
                <>
                  <Link href="/dashboard" className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${pathname === '/dashboard' ? 'text-white bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}>
                    Mi Negocio
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="ml-2 btn-secondary text-sm border-white/10 uppercase tracking-wider text-xs"
                  >
                    Salir
                  </button>
                </>
              ) : (
                <Link href="/login" className="ml-2 btn-primary text-sm shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]">
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile App-like Header (Only Logo, hidden on desktop) */}
      <div className="md:hidden sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md px-4 py-3 flex items-center justify-center border-b border-white/5">
         <Link href="/" className="flex items-center gap-1.5">
            <span className="text-xl">🏔️</span>
            <div>
              <span className="font-bold text-base text-white">Sigua</span>
              <span className="font-bold text-base text-primary-500">Market</span>
            </div>
          </Link>
      </div>

      {/* Mobile Bottom Navigation Bar App-like */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-slate-900/90 backdrop-blur-xl border-t border-white/10 pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          <Link href="/" className="flex flex-col items-center justify-center w-full h-full gap-1">
             <svg className={`w-6 h-6 ${pathname === '/' ? 'text-primary-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
             </svg>
             <span className={`text-[10px] font-medium ${pathname === '/' ? 'text-primary-500' : 'text-slate-400'}`}>Inicio</span>
          </Link>
          <Link href="/#categorias" className="flex flex-col items-center justify-center w-full h-full gap-1">
             <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
             </svg>
             <span className="text-[10px] font-medium text-slate-400">Categorías</span>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center justify-center w-full h-full gap-1">
             <svg className={`w-6 h-6 ${pathname.startsWith('/dashboard') ? 'text-primary-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
             </svg>
             <span className={`text-[10px] font-medium ${pathname.startsWith('/dashboard') ? 'text-primary-500' : 'text-slate-400'}`}>Perfil</span>
          </Link>
        </div>
      </div>
    </>
  )
}
