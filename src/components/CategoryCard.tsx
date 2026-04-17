import Link from 'next/link'
import type { Category } from '@/lib/types'

interface CategoryCardProps {
  category: Category
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/categoria/${category.slug}`}
      className="card group flex flex-col items-center justify-center p-5 text-center hover:border-primary-500/50"
    >
      <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
        {category.icon}
      </span>
      <span className="text-sm font-semibold text-slate-200 group-hover:text-primary-400 transition-colors">
        {category.name}
      </span>
    </Link>
  )
}
