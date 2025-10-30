import { type FiltersState } from "./components/Filters"
import { type Listing } from "./types"

export function updateListings(listings : Listing[], filters : FiltersState) {
    let arr = [...listings]

    if (filters.city) arr = arr.filter(l => l.city === filters.city)
    if (filters.minPrice) arr = arr.filter(l => l.price >= Number(filters.minPrice))
    if (filters.maxPrice) arr = arr.filter(l => l.price <= Number(filters.maxPrice))
    if (filters.beds) {
      const beds = Number(filters.beds)
      if (beds === 4) arr = arr.filter(l => l.bedrooms >= 4)
      else arr = arr.filter(l => l.bedrooms === beds)
    }

    switch (filters.sort) {
      case 'priceAsc':
        arr.sort((a, b) => a.price - b.price)
        break
      case 'priceDesc':
        arr.sort((a, b) => b.price - a.price)
        break
      case 'bedsAsc':
        arr.sort((a, b) => a.bedrooms - b.bedrooms)
        break
      case 'bedsDesc':
        arr.sort((a, b) => b.bedrooms - a.bedrooms)
        break
      case 'availAsc':
        arr.sort((a, b) => a.availableFrom.localeCompare(b.availableFrom))
        break
    }

    return arr
  }