export type User = {
  id: string
  name: string
  age: number | null
  gender: string
  employer: string
  password: string
}

export type Listing = {
  id: string
  title: string
  city: string
  price: number
  bedrooms: number
  bathrooms: number
  availableFrom: string // ISO date
  imageUrl: string
  sqft?: number
  furnished?: boolean
  petsAllowed?: boolean
  description?: string
}

