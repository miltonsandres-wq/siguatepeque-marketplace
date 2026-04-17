'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import StarRating from '@/components/StarRating'
import type { Business } from '@/lib/types'

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function DashboardProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [userId, setUserId] = useState<string | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    whatsapp: '',
    address: '',
    category_id: '',
  })

  const [categories, setCategories] = useState<{ id: string; name: string; icon: string }[]>([])

  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)

      // Load categories
      const { data: catData } = await supabase.from('categories').select('id, name, icon').order('name')
      if (catData) setCategories(catData)

      // Load business
      const { data: bizData } = await supabase
        .from('businesses')
        .select('*, categories(*)')
        .eq('owner_id', user.id)
        .maybeSingle()

      if (bizData) {
        setBusiness(bizData)
        setFormData({
          name: bizData.name || '',
          description: bizData.description || '',
          phone: bizData.phone || '',
          whatsapp: bizData.whatsapp || '',
          address: bizData.address || '',
          category_id: bizData.category_id || '',
        })
      }
    } catch {
      // No business yet — that's OK
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    setSaving(true)

    try {
      if (business) {
        // Update existing
        const { error } = await supabase
          .from('businesses')
          .update({
            ...formData,
            slug: slugify(formData.name),
            updated_at: new Date().toISOString(),
          })
          .eq('id', business.id)

        if (error) throw error
        showMessage('success', '¡Perfil actualizado correctamente!')
      } else {
        // Create new
        const { error } = await supabase.from('businesses').insert({
          ...formData,
          slug: slugify(formData.name),
          owner_id: userId,
          city: 'Siguatepeque',
        })

        if (error) throw error
        showMessage('success', '¡Negocio creado exitosamente!')
      }
      await loadData()
    } catch {
      showMessage('error', 'Error al guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (
    file: File,
    bucket: string,
    setter: (v: boolean) => void,
    field: 'logo' | 'cover'
  ) => {
    if (!business) return
    setter(true)
    try {
      const ext = file.name.split('.').pop()
      const filePath = `${business.id}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('businesses')
        .update({ [field]: data.publicUrl })
        .eq('id', business.id)
      if (updateError) throw updateError

      showMessage('success', `${field === 'logo' ? 'Logo' : 'Portada'} actualizado`)
      await loadData()
    } catch {
      showMessage('error', 'Error al subir imagen.')
    } finally {
      setter(false)
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

  return (
    <div className="animate-fade-in p-4 sm:p-6 lg:p-8">
      
      {/* Header Info */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Perfil del Negocio</h1>
        <p className="text-slate-400 mt-1">Configura la información visible de tu negocio.</p>
      </div>

      {/* Message Toast */}
      {message && (
        <div className={`mb-6 px-4 py-3 rounded-xl border text-sm font-medium animate-slide-up backdrop-blur-md ${
           message.type === 'success'
             ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
             : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {message.type === 'success' ? '✅ ' : '❌ '}{message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSaveProfile} className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/5 shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-white tracking-tight">
              {business ? 'Información General' : 'Crea tu nuevo negocio'}
            </h2>

            <div className="space-y-5">
              <div>
                <label htmlFor="biz-name" className="block text-sm font-medium text-slate-400 mb-2">
                  Nombre del negocio <span className="text-primary-400">*</span>
                </label>
                <input
                  id="biz-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej. Mi Restaurante"
                  required
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium"
                />
              </div>

              <div>
                <label htmlFor="biz-cat" className="block text-sm font-medium text-slate-400 mb-2">
                  Categoría <span className="text-primary-400">*</span>
                </label>
                <select
                  id="biz-cat"
                  value={formData.category_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                  required
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
                >
                  <option value="" className="bg-slate-900 text-slate-400">Selecciona una categoría</option>
                  {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="biz-desc" className="block text-sm font-medium text-slate-400 mb-2">Descripción</label>
                <textarea
                  id="biz-desc"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Cuéntale al mundo sobre tu negocio, qué ofreces, tu historia..."
                  rows={5}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all resize-none font-medium leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="biz-phone" className="block text-sm font-medium text-slate-400 mb-2">Teléfono</label>
                  <input
                    id="biz-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+504 2773-0000"
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium"
                  />
                </div>
                <div>
                  <label htmlFor="biz-wa" className="block text-sm font-medium text-slate-400 mb-2">WhatsApp</label>
                  <input
                    id="biz-wa"
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="50427730000"
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="biz-addr" className="block text-sm font-medium text-slate-400 mb-2">Dirección</label>
                <input
                  id="biz-addr"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Barrio El Centro, frente al parque"
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium"
                />
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn-primary w-full mt-8 py-3.5 text-base font-bold disabled:opacity-50 shadow-lg shadow-primary-500/20">
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Guardando...
                </span>
              ) : business ? 'Guardar cambios' : 'Crear negocio'}
            </button>
          </form>
        </div>

        {/* Image Uploads Sidebar */}
        <div className="space-y-6">
          {/* Logo */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-white/5 shadow-2xl">
            <h3 className="font-bold text-white mb-4">Logotipo</h3>
            {business?.logo ? (
              <img src={business.logo} alt="Logo" className="w-28 h-28 rounded-2xl object-cover mx-auto mb-5 border border-white/10 shadow-lg" />
            ) : (
              <div className="w-28 h-28 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto mb-5 text-4xl border border-white/5 shadow-inner">
                🏪
              </div>
            )}
            <label className={`btn-secondary w-full text-center cursor-pointer text-sm font-medium py-2.5 ${!business ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {uploadingLogo ? 'Subiendo...' : 'Cambiar logo'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={!business || uploadingLogo}
                onChange={(e) => {
                    const file = e.target.files?.[0]
                  if (file) handleImageUpload(file, 'business-logos', setUploadingLogo, 'logo')
                }}
              />
            </label>
          </div>

          {/* Cover */}
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-white/5 shadow-2xl">
            <h3 className="font-bold text-white mb-4">Portada</h3>
              {business?.cover ? (
              <img src={business.cover} alt="Portada" className="w-full h-32 rounded-2xl object-cover mb-5 border border-white/10 shadow-lg" />
            ) : (
              <div className="w-full h-32 rounded-2xl bg-slate-800/80 flex flex-col items-center justify-center mb-5 border border-white/5 border-dashed">
                  <svg className="w-8 h-8 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="text-xs text-slate-500 font-medium">Sin portada</span>
              </div>
            )}
            <label className={`btn-secondary w-full text-center cursor-pointer text-sm font-medium py-2.5 ${!business ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {uploadingCover ? 'Subiendo...' : 'Cambiar portada'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={!business || uploadingCover}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file, 'business-covers', setUploadingCover, 'cover')
                }}
              />
            </label>
          </div>

          {/* Stats */}
          {business && (
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-white/5 shadow-2xl text-center">
                <h3 className="font-bold text-white mb-4 text-left">Resumen</h3>
              <div className="text-4xl font-extrabold text-white mb-2 tracking-tighter">
                {business.rating.toFixed(1)}
              </div>
                <div className="flex justify-center mb-2">
                  <StarRating rating={business.rating} size="sm" />
                </div>
              <p className="text-sm text-slate-400 font-medium">
                {business.review_count} reseña{business.review_count !== 1 ? 's' : ''} en total
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
