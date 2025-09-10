import { useEffect, useId, useMemo, useState } from 'react'

export type FiltersState = {
  city: string
  minPrice: string
  maxPrice: string
  beds: string
  sort: 'priceAsc' | 'priceDesc' | 'bedsAsc' | 'bedsDesc' | 'availAsc'
}

const defaultState: FiltersState = {
  city: '',
  minPrice: '',
  maxPrice: '',
  beds: '',
  sort: 'priceAsc',
}

type Props = {
  cities: string[]
  onChange: (f: FiltersState) => void
}

export default function Filters({ cities, onChange }: Props) {
  const [state, setState] = useState<FiltersState>(defaultState)
  const id = useId()

  useEffect(() => onChange(state), [state, onChange])

  const uniqueCities = useMemo(() => Array.from(new Set(cities)), [cities])

  return (
    <div className="filters">
      <div className="field">
        <label className="label" htmlFor={`${id}-city`}>City</label>
        <select id={`${id}-city`} className="select" value={state.city} onChange={(e) => setState(s => ({ ...s, city: e.target.value }))}>
          <option value="">All</option>
          {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="field">
        <label className="label" htmlFor={`${id}-min`}>Min Price</label>
        <input id={`${id}-min`} className="input" type="number" placeholder="e.g. 1500" value={state.minPrice} onChange={(e) => setState(s => ({ ...s, minPrice: e.target.value }))} />
      </div>
      <div className="field">
        <label className="label" htmlFor={`${id}-max`}>Max Price</label>
        <input id={`${id}-max`} className="input" type="number" placeholder="e.g. 3200" value={state.maxPrice} onChange={(e) => setState(s => ({ ...s, maxPrice: e.target.value }))} />
      </div>
      <div className="field">
        <label className="label" htmlFor={`${id}-beds`}>Beds</label>
        <select id={`${id}-beds`} className="select" value={state.beds} onChange={(e) => setState(s => ({ ...s, beds: e.target.value }))}>
          <option value="">Any</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4+</option>
        </select>
      </div>
      <div className="field">
        <label className="label" htmlFor={`${id}-sort`}>Sort</label>
        <select id={`${id}-sort`} className="select" value={state.sort} onChange={(e) => setState(s => ({ ...s, sort: e.target.value as FiltersState['sort'] }))}>
          <option value="priceAsc">Price: Low → High</option>
          <option value="priceDesc">Price: High → Low</option>
          <option value="bedsAsc">Bedrooms: Low → High</option>
          <option value="bedsDesc">Bedrooms: High → Low</option>
          <option value="availAsc">Availability: Soonest</option>
        </select>
      </div>
      <div className="field">
        <label className="label">Actions</label>
        <button className="btn" onClick={() => setState(defaultState)}>Reset</button>
      </div>
    </div>
  )
}

