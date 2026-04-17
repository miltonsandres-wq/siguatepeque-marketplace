'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Business, PortfolioItem } from '@/lib/types'

export default function DashboardPortfolioPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [business, setBusiness] = useState<Business | null>(null)
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Load business
      const { data: bizData } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('owner_id', user.id)
        .single()

      if (bizData) {
        setBusiness(bizData)

        // Load portfolio
        const { data: portData } = await supabase
          .from('portfolio')
          .select('*')
          .eq('business_id', bizData.id)
          .order('created_at', { ascending: false })
          
        if (portData) setPortfolio(portData)
      }
    } catch {
      // No business yet
    } finally {
      setLoading(false)
    }
  }, [supabase, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  const handlePortfolioUpload = async (file: File) => {
    if (!business) return
    setUploadingPortfolio(true)
    try {
      const ext = file.name.split('.').pop()
      const filePath = `${business.id}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('business-portafolio')
        .upload(filePath, file)
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('business-portafolio').getPublicUrl(filePath)

      const { error: insertError } = await supabase.from('portfolio').insert({
        business_id: business.id,
        image_url: data.publicUrl,
      })
      if (insertError) throw insertError

      showMessage('success', 'Foto agregada al portafolio')
      await loadData()
    } catch {
      showMessage('error', 'Error al subir foto.')
    } finally {
      setUploadingPortfolio(false)
    }
  }

  const handleDeletePortfolio = async (item: PortfolioItem) => {
    if (!confirm('¿Eliminar esta foto?')) return
    try {
      const { error } = await supabase.from('portfolio').delete().eq('id', item.id)
      if (error) throw error
      setPortfolio(prev => prev.filter(p => p.id !== item.id))
      showMessage('success', 'Foto eliminada')
    } catch {
      showMessage('error', 'Error al eliminar foto.')
    }
  }

  if (loading) {
     return (
        <div className="flex items-center justify-center p-12">
           <svg className="animate-spin w-8 h-8 text-primary-500" viewBox="0 0 24 24" fill="none">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
           </svg>
        </div>
     )
  }

  if (!business) {
     return (
        <div className="animate-fade-in p-4 sm:p-6 lg:p-8">
           <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-white/5 border-dashed relative overflow-hidden">
             <span className="text-5xl block mb-4 opacity-50">📋</span>
             <h2 className="text-xl font-bold text-white mb-2">Comienza configurando tu perfil</h2>
             <p className="text-slate-400 font-medium text-lg max-w-md mx-auto">
               Debes crear tu negocio en la pestaña de <strong>Perfil</strong> antes de poder subir fotos al portafolio.
             </p>
          </div>
        </div>
     )
  }

  return (
    <div className="animate-fade-in p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      
      {/* Header Info */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">Portafolio de Trabajo</h1>
           <p className="text-slate-400 font-medium text-sm">Sube fotos de tus productos, menú o servicios.</p>
        </div>
        
        <label className="btn-primary flex items-center gap-2 cursor-pointer shadow-lg shadow-primary-500/20 whitespace-nowrap self-start sm:self-auto py-2.5 px-5 text-sm">
           {uploadingPortfolio ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
             </svg>
           ) : (
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
           )}
           {uploadingPortfolio ? 'Subiendo imagen...' : 'Agregar foto'}
           <input
             type="file"
             accept="image/*"
             className="hidden"
             disabled={uploadingPortfolio}
             onChange={(e) => {
               const file = e.target.files?.[0]
               if (file) handlePortfolioUpload(file)
             }}
           />
        </label>
      </div>

      {/* Message Toast */}
      {message && (
        <div className={`mb-6 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-slide-up backdrop-blur-md ${
           message.type === 'success'
             ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
             : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {message.type === 'success' ? '✅ ' : '❌ '}{message.text}
        </div>
      )}

      {/* Gallery Grid */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/5 shadow-2xl min-h-[50vh]">
         {portfolio.length === 0 ? (
            <div className="text-center py-20 bg-slate-950/50 rounded-2xl border border-white/5 border-dashed relative overflow-hidden group">
               <span className="text-6xl block mb-6 opacity-30 group-hover:opacity-60 transition-opacity">📸</span>
               <h3 className="text-xl font-bold text-white mb-2">Tu galería está vacía</h3>
               <p className="text-slate-400 font-medium">Sube fotos para mostrar tus productos a los clientes.</p>
            </div>
         ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {portfolio.map((item) => (
                <div key={item.id} className="relative group rounded-2xl overflow-hidden aspect-square border border-white/10 shadow-lg">
                  <img src={item.image_url} alt="Portafolio" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <button
                      onClick={() => handleDeletePortfolio(item)}
                      className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-full w-12 h-12 flex items-center justify-center transition-all shadow-xl"
                      title="Eliminar foto"
                    >
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
         )}
      </div>
    </div>
  )
}
