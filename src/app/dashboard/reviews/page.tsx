'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import StarRating from '@/components/StarRating'
import ReviewCard from '@/components/ReviewCard'
import type { Business, Review } from '@/lib/types'

export default function DashboardReviewsPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [business, setBusiness] = useState<Business | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

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
        .select('id, name, rating, review_count')
        .eq('owner_id', user.id)
        .single()

      if (bizData) {
        setBusiness(bizData)

        // Load reviews
        const { data: revData } = await supabase
          .from('reviews')
          .select('*, profiles(full_name, avatar_url)')
          .eq('business_id', bizData.id)
          .order('created_at', { ascending: false })
          
        if (revData) setReviews(revData)
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
               Debes crear tu negocio en la pestaña de <strong>Perfil</strong> antes de poder recibir o ver reseñas.
             </p>
          </div>
        </div>
     )
  }

  return (
    <div className="animate-fade-in p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      
      {/* Header Info */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
           <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1">Reseñas de Clientes</h1>
           <p className="text-slate-400 font-medium text-sm">Lo que la comunidad dice sobre {business.name}.</p>
        </div>
        
        {reviews.length > 0 && (
           <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-white/5 shadow-xl flex items-center gap-4">
              <div className="text-3xl font-extrabold text-white tracking-tighter">
                {business.rating.toFixed(1)}
              </div>
              <div>
                <StarRating rating={business.rating} size="sm" />
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Basado en {business.review_count} reseña{business.review_count !== 1 ? 's' : ''}
                </p>
              </div>
           </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/5 shadow-2xl min-h-[50vh]">
         {reviews.length === 0 ? (
            <div className="text-center py-20 bg-slate-950/50 rounded-2xl border border-white/5 border-dashed">
               <span className="text-6xl block mb-6 opacity-30">💬</span>
               <h3 className="text-xl font-bold text-white mb-2">Aún no has recibido reseñas</h3>
               <p className="text-slate-400 font-medium max-w-sm mx-auto">
                  Comparte tu perfil público con tus clientes para que dejen su opinión y calificación.
               </p>
            </div>
         ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
         )}
      </div>

    </div>
  )
}
