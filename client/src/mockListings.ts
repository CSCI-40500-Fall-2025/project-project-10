import type { Listing } from './types'

const cities = [
  'New York',
  'San Francisco',
  'Seattle',
  'Boston',
  'Austin',
  'Chicago',
  'Atlanta',
]

const images = [
  'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1598928506311-9db8dfff2a5b?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1528901166007-3784c7dd3653?q=80&w=1200&auto=format&fit=crop',
]

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function sample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function generateMockListings(count = 36): Listing[] {
  const out: Listing[] = []
  const today = new Date()
  for (let i = 0; i < count; i++) {
    const bedrooms = rand(1, 4)
    const bathrooms = Math.max(1, Math.round(bedrooms / 2))
    const priceBase = { 'New York': 3200, 'San Francisco': 3400, Seattle: 2200, Boston: 2600, Austin: 1800, Chicago: 1700, Atlanta: 1600 } as Record<string, number>
    const city = sample(cities)
    const price = priceBase[city] + rand(-400, 600) + bedrooms * rand(200, 450)
    const availableFrom = new Date(today)
    availableFrom.setDate(today.getDate() + rand(0, 60))
    out.push({
      id: crypto.randomUUID(),
      title: `${bedrooms}BR apartment in ${city}`,
      city,
      price,
      bedrooms,
      bathrooms,
      availableFrom: availableFrom.toISOString().slice(0, 10),
      imageUrl: sample(images),
      sqft: rand(450, 1400),
      furnished: Math.random() < 0.4,
      petsAllowed: Math.random() < 0.6,
      description: 'Cozy place near transit and shops. In-unit laundry and lots of light.'
    })
  }
  return out
}

