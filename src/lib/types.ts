export interface Category {
  id: string
  name: string
  slug: string
  icon: string
}

export interface Business {
  id: string
  name: string
  slug: string
  description: string | null
  category_id: string | null
  phone: string | null
  whatsapp: string | null
  address: string | null
  city: string
  logo: string | null
  cover: string | null
  rating: number
  review_count: number
  featured: boolean
  owner_id: string | null
  created_at: string
  updated_at: string
  categories?: Category
}

export interface PortfolioItem {
  id: string
  business_id: string
  image_url: string
  description: string | null
  created_at: string
}

export interface Review {
  id: string
  business_id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string
  profiles?: {
    full_name: string | null
    avatar_url: string | null
  }
}

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
}
