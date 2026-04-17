'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        })

        if (error) {
          if (error.message.includes('already registered')) {
            setError('Este correo ya está registrado. Intenta iniciar sesión.')
          } else {
            setError(error.message)
          }
        } else {
          setConfirmationSent(true)
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          if (error.message.includes('Invalid login')) {
            setError('Correo o contraseña incorrectos.')
          } else {
            setError(error.message)
          }
        } else {
          router.push('/dashboard')
          router.refresh()
        }
      }
    } catch {
      setError('Ocurrió un error inesperado. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (confirmationSent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden bg-slate-950">
        {/* Dark magical background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/40 via-slate-950 to-slate-950" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />

        <div className="relative max-w-md w-full text-center z-10">
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 shadow-2xl">
            <span className="text-5xl block mb-6">📧</span>
            <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
              ¡Revisa tu correo!
            </h2>
            <p className="text-slate-300 mb-8 leading-relaxed">
              Enviamos un enlace de confirmación a <strong className="text-white">{email}</strong>.
              Haz clic en el enlace para activar tu cuenta.
            </p>
            <button
              onClick={() => {
                setConfirmationSent(false)
                setIsRegister(false)
              }}
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
            >
              Volver a iniciar sesión
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 relative overflow-hidden bg-slate-950 font-sans">
      {/* Dark magical background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-900/40 via-slate-950 to-slate-950" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] transform translate-x-1/2 pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[420px] mx-auto">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="text-3xl">🏔️</span>
            <div>
              <span className="font-bold text-2xl text-white tracking-tight">
                Sigua
              </span>
              <span className="font-bold text-2xl text-primary-400 tracking-tight">
                Market
              </span>
            </div>
          </Link>
          <p className="text-slate-400 mt-2 text-sm">
            {isRegister ? 'Comienza a gestionar tu negocio' : 'Bienvenido de vuelta al panel'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/5 shadow-2xl">
          
          {/* Toggle */}
          <div className="flex rounded-xl bg-slate-950/50 p-1 mb-8 border border-white/5">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError('') }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                !isRegister
                  ? 'bg-slate-800 text-white shadow-sm border border-white/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError('') }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                isRegister
                  ? 'bg-slate-800 text-white shadow-sm border border-white/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Nombre completo
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Juan Pérez"
                  required={isRegister}
                  className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-sans"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-sans"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Contraseña
                </label>
                {!isRegister && (
                  <a href="#" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                    ¿Olvidaste tu contraseña?
                  </a>
                )}
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-sans"
              />
              {isRegister && (
                <p className="text-xs text-slate-500 mt-1.5">Mínimo 6 caracteres</p>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400 mt-4 flex items-start gap-2">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 mt-6 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading 
                ? (isRegister ? 'Creando cuenta...' : 'Iniciando sesión...')
                : (isRegister ? 'Crear cuenta' : 'Iniciar sesión')
              }
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-slate-400">
              {isRegister ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
              <button
                type="button"
                onClick={() => { setIsRegister(!isRegister); setError('') }}
                className="text-primary-400 font-semibold hover:text-primary-300 transition-colors ml-1"
              >
                {isRegister ? 'Inicia sesión' : 'Regístrate gratis'}
              </button>
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
            &larr; Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
