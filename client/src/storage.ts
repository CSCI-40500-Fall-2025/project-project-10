import type { Listing, User } from './types'

const USER_KEY = 'fh.user'
const LISTINGS_KEY = 'fh.listings'
const FAVS_KEY = 'fh.favorites'

export function saveUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function clearUser() {
  localStorage.removeItem(USER_KEY)
}

export function getFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(FAVS_KEY)
    return new Set<string>(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set<string>()
  }
}

export function toggleFavorite(id: string): Set<string> {
  const favs = getFavorites()
  if (favs.has(id)) favs.delete(id)
  else favs.add(id)
  localStorage.setItem(FAVS_KEY, JSON.stringify(Array.from(favs)))
  return favs
}

export function seedListingsIfNeeded(seed: Listing[]) {
  const existing = localStorage.getItem(LISTINGS_KEY)
  if (!existing) {
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(seed))
  }
}

export function getListings(): Listing[] {
  try {
    const raw = localStorage.getItem(LISTINGS_KEY)
    return raw ? (JSON.parse(raw) as Listing[]) : []
  } catch {
    return []
  }
}

