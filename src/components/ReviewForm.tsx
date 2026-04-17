'use client'

import { useState } from 'react'
import StarRating from './StarRating'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ReviewFormProps {
  businessId: string
  onReviewSubmitted?: () => void
}

export default function ReviewForm({ businessId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (rating === 0) {
      setError('Por favor selecciona una calificación')
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Debes iniciar sesión para dejar una reseña')
        setIsSubmitting(false)
        return
      }

      const { error: insertError } = await supabase.from('reviews').insert({
        business_id: businessId,
        user_id: user.id,
        rating,
        comment: comment.trim() || null,
      })

      if (insertError) {
        setError('Error al enviar la reseña. Intenta de nuevo.')
        console.error(insertError)
      } else {
        setSuccess(true)
        setRating(0)
        setComment('')
        router.refresh()
        onReviewSubmitted?.()
      }
    } catch {
      setError('Error inesperado. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center backdrop-blur-md">
        <span className="text-3xl block mb-2">🎉</span>
        <p className="font-semibold text-emerald-400">¡Gracias por tu reseña!</p>
        <button
          onClick={() => setSuccess(false)}
          className="text-sm text-emerald-300 underline mt-2 hover:text-emerald-200"
        >
          Escribir otra
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900/50 backdrop-blur-md rounded-xl p-5 border border-white/5">
      <h4 className="font-semibold text-white mb-3">Deja tu reseña</h4>

      <div className="mb-4">
        <label className="text-sm text-slate-400 block mb-1">Tu calificación</label>
        <StarRating rating={rating} size="lg" interactive onChange={setRating} />
      </div>

      <div className="mb-4">
        <label className="text-sm text-slate-400 block mb-1">Comentario (opcional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Cuéntanos sobre tu experiencia..."
          rows={3}
          className="input-field resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-red-400 mb-3">{error}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Enviando...
          </span>
        ) : (
          'Enviar Reseña'
        )}
      </button>
    </form>
  )
}
