import type { Listing } from '../types'
import { getFavorites, toggleFavorite } from '../storage'
import { useMemo, useState } from 'react'

type Props = { listing: Listing }

export default function ListingCard({ listing }: Props) {
  const [favSet, setFavSet] = useState<Set<string>>(() => getFavorites())
  const isFav = useMemo(() => favSet.has(listing.id), [favSet, listing.id])

  const onFav = () => {
    setFavSet(new Set(toggleFavorite(listing.id)))
  }

  return (
    <div className="card">
      <img src={listing.imageUrl} alt={listing.title} />
      <div className="card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="price">${listing.price.toLocaleString()}</div>
            <div className="muted">{listing.city} • {listing.bedrooms}bd/{listing.bathrooms}ba • {listing.sqft} sqft</div>
          </div>
          <button className="btn" aria-pressed={isFav} onClick={onFav}>
            {isFav ? '★ Saved' : '☆ Save'}
          </button>
        </div>
        <div className="divider" />
        <div className="chips">
          <span className="chip">Available {listing.availableFrom}</span>
          {listing.furnished && <span className="chip">Furnished</span>}
          {listing.petsAllowed && <span className="chip">Pets OK</span>}
        </div>
      </div>
    </div>
  )
}
