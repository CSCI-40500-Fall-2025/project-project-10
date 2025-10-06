import { useEffect, useId, useMemo, useState } from 'react'
import {Box, Typography, FormControl, InputLabel, Select, MenuItem, Slider} from '@mui/material';
import { lightBlue } from '@mui/material/colors';

export type FiltersState = {
  city: string
  minPrice: number
  maxPrice: number
  beds: string
  sort: 'priceAsc' | 'priceDesc' | 'bedsAsc' | 'bedsDesc' | 'availAsc'
}

const defaultState: FiltersState = {
  city: '',
  minPrice: 0,
  maxPrice: 10000,
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
    <Box sx={{display:"flex", flexDirection: "column", justifyContent: "space-between", alignItems: "start", width: 400, height: 500, padding: "16px 24px", backgroundColor: "white", borderRadius: "25px"}}>
      
      <Typography sx={{paddingTop: 2, color: "black"}} variant="h4">Filters</Typography>

      <FormControl sx={{ width: "100%" }}>
        <InputLabel id={`${id}-city`}>Location</InputLabel>
        <Select
          labelId={`${id}-city`}
          value={state.city}
          label="Location"
          onChange={(e) => setState(s => ({ ...s, city: e.target.value }))}
          sx={{"& .MuiSelect-select" : {
            textAlign: "left"
          }}}
        >
          <MenuItem value="">All</MenuItem>
          {uniqueCities.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl sx={{width: "100%"}}>
        <Typography sx={{ color: "black", textAlign : "left"}} variant="h6">Price Range</Typography>
        <Slider
          aria-label="Always visible"
          step={100}
          max={5000}
          getAriaValueText={(value) => `$${value}`}
          value={state.minPrice}
          onChange={(e) => setState(s => ({ ...s, minPrice: e.target.value }))}
          marks={[
                {
                  value: 0,
                  label: '$0',
                },
                {
                  value: 5000,
                  label: '$5000',
                }
              ]}
          valueLabelDisplay="off"
        />
      </FormControl>

      <FormControl sx={{width: "100%"}}>
        <InputLabel id={`${id}-beds`}>Num Bedrooms</InputLabel>
        <Select labelId={`${id}-beds`} value={state.beds} onChange={(e) => setState(s => ({ ...s, beds: e.target.value }))} sx={{"& .MuiSelect-select" : {textAlign: "left"}}}>
          <MenuItem value="">Any</MenuItem>
          <MenuItem value="1">1</MenuItem>
          <MenuItem value="2">2</MenuItem>
          <MenuItem value="3">3</MenuItem>
          <MenuItem value="4">4+</MenuItem>
        </Select>
      </FormControl>

      <FormControl sx={{ width: "100%"}}>
        <InputLabel id={`${id}-sort`}>Sort</InputLabel>
        <Select labelId={`${id}-sort`} value={state.sort} onChange={(e) => setState(s => ({ ...s, sort: e.target.value as FiltersState['sort'] }))} sx={{"& .MuiSelect-select" : {textAlign: "left"}}}>
          <MenuItem value="priceAsc">Price: Low → High</MenuItem>
          <MenuItem value="priceDesc">Price: High → Low</MenuItem>
          <MenuItem value="bedsAsc">Bedrooms: Low → High</MenuItem>
          <MenuItem value="bedsDesc">Bedrooms: High → Low</MenuItem>
          <MenuItem value="availAsc">Availability: Soonest</MenuItem>
        </Select>
      </FormControl>

      <button style={{width: "100%", backgroundColor: lightBlue['A400']}} className="btn" onClick={() => setState(defaultState)}>Reset</button>

    </Box>
  )
}

