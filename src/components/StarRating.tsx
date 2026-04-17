'use client'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  interactive?: boolean
  onChange?: (rating: number) => void
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  interactive = false,
  onChange,
}: StarRatingProps) {
  const sizeClass = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  }[size]

  return (
    <div className="flex items-center gap-1">
      <div className={`flex ${interactive ? 'cursor-pointer' : ''}`}>
        {Array.from({ length: maxRating }, (_, i) => {
          const starValue = i + 1
          const isFilled = starValue <= Math.round(rating)

          if (interactive) {
            return (
              <span
                key={i}
                onClick={() => onChange?.(starValue)}
                className={`${sizeClass} transition-transform hover:scale-125 ${
                  isFilled ? 'text-star' : 'text-gray-200'
                }`}
                role="button"
                aria-label={`${starValue} estrellas`}
              >
                ★
              </span>
            )
          }

          return (
            <span
              key={i}
              className={`${sizeClass} ${isFilled ? 'text-star' : 'text-gray-200'}`}
            >
              ★
            </span>
          )
        })}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-text-secondary ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
