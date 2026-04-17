import Link from 'next/link'
import StarRating from './StarRating'
import type { Business } from '@/lib/types'

interface BusinessCardProps {
  business: Business
}

export default function BusinessCard({ business }: BusinessCardProps) {
  // Use a dark theme avatar fallback if no logo
  const logoUrl = business.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(business.name)}&background=0f172a&color=3b82f6&size=200&font-size=0.4&bold=true`

  return (
    <Link href={`/negocio/${business.slug}`} className="card group block border-white/5">
      {/* Cover / Top Section */}
      <div className="relative h-32 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
        {business.cover ? (
          <>
             <img
               src={business.cover}
               alt={business.name}
               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent pointer-events-none" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-slate-900 to-slate-950 opacity-90" />
        )}
        {/* Category badge */}
        {business.categories && (
          <span className="absolute top-3 left-3 badge">
            {business.categories.icon} {business.categories.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="relative px-4 pb-4 pt-8">
        {/* Logo */}
        <div className="absolute -top-6 left-4">
          <div className="w-12 h-12 rounded-xl border border-white/10 shadow-xl overflow-hidden bg-slate-800">
            <img
              src={logoUrl}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <h3 className="font-bold text-white group-hover:text-primary-400 transition-colors line-clamp-1">
          {business.name}
        </h3>

        {business.description && (
          <p className="text-sm text-slate-400 mt-1 line-clamp-2">
            {business.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
          <StarRating rating={business.rating} size="sm" showValue />
          <span className="text-xs text-slate-500 font-medium">
            {business.review_count} reseña{business.review_count !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </Link>
  )
}
