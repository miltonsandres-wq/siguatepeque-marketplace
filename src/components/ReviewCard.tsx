import StarRating from './StarRating'
import type { Review } from '@/lib/types'

interface ReviewCardProps {
  review: Review
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const reviewerName = review.profiles?.full_name || 'Usuario anónimo'
  const initials = reviewerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const relativeDate = (dateStr: string) => {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Hoy'
    if (diffDays === 1) return 'Ayer'
    if (diffDays < 7) return `Hace ${diffDays} días`
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) > 1 ? 'es' : ''}`
    return `Hace ${Math.floor(diffDays / 365)} año${Math.floor(diffDays / 365) > 1 ? 's' : ''}`
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-4 border border-white/5">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-slate-800 text-primary-400 flex items-center justify-center text-sm font-bold shrink-0 border border-white/5 shadow-inner">
          {review.profiles?.avatar_url ? (
            <img src={review.profiles.avatar_url} alt={reviewerName} className="w-full h-full rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-sm text-white truncate">
              {reviewerName}
            </span>
            <span className="text-xs text-slate-500 shrink-0">
              {relativeDate(review.created_at)}
            </span>
          </div>

          <StarRating rating={review.rating} size="sm" />

          {review.comment && (
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              {review.comment}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
