import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useParams, Link } from 'react-router-dom'
import './App.css'
import './index.css'
import type { Listing, User } from './types'
import { clearUser, getCurrentUser, getListings, saveUser, seedListingsIfNeeded } from './storage'
import { generateMockListings } from './mockListings'
import {ListingCard} from './components/NewListingCard'
import Filters, { type FiltersState } from './components/Filters'
import { createUser as apiCreateUser, fetchListings, hasApi } from './api'

import AcUnitIcon from '@mui/icons-material/AcUnit';
import { Box, Typography } from '@mui/material'
import { lightBlue } from '@mui/material/colors'

type AuthView = 'login' | 'signup'

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

function AppRoutes() {
  const [authView, setAuthView] = useState<AuthView>('login')
  const [user, setUser] = useState<User | null>(() => getCurrentUser())
  const [listings, setListings] = useState<Listing[]>([])

  useEffect(() => {
    const run = async () => {
      if (hasApi) {
        try {
          const list = await fetchListings()
          setListings(list)
          return
        } catch (e) {
          console.warn('API fetch failed, falling back to local data', e)
        }
      }
      seedListingsIfNeeded(generateMockListings(48))
      setListings(getListings())
    }
    run()
  }, [])

  const onLogout = () => { clearUser(); setUser(null) }

  if (!user) return (
    <AuthShell view={authView} setView={setAuthView} onAuthed={setUser} />
  )

  return (
    <div style={{ width: '100%', margin: '0 auto'}}>
      <Header user={user} onLogout={onLogout} />
      
      <Routes>
        <Route path="/" element={<ListingsPage listings={listings} />} />
        <Route path="/listing/:id" element={<ListingDetailPage listings={listings} />} />
      </Routes>
    </div>
  )
}

function ListingsPage({ listings }: { listings: Listing[] }) {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<FiltersState>({ 
    city: '', 
    minPrice: '', 
    maxPrice: '', 
    beds: '', 
    sort: 'priceAsc' 
  })

  const filtered = useMemo(() => {
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
      case 'priceAsc': arr.sort((a,b)=>a.price-b.price); break
      case 'priceDesc': arr.sort((a,b)=>b.price-a.price); break
      case 'bedsAsc': arr.sort((a,b)=>a.bedrooms-b.bedrooms); break
      case 'bedsDesc': arr.sort((a,b)=>b.bedrooms-a.bedrooms); break
      case 'availAsc': arr.sort((a,b)=>a.availableFrom.localeCompare(b.availableFrom)); break
    }
    return arr
  }, [listings, filters])

  return (
    <div style={{display: 'flex', justifyContent: "space-between", maxWidth: 1440, width: '100%', margin: '24px auto 0 auto'}}>
      <Filters cities={listings.map(l=>l.city)} onChange={setFilters} />

      <div>
        {filtered.length > 0 && (
          <>
            <Typography sx={{textAlign: "left", color: "black"}} variant="h4">{`Results (${filtered.length})`}</Typography>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 400px)', gridTemplateRows: "350px 350px", gridGap: "16px" }}>
              {filtered.map(l => (
                <Box 
                  key={l.id} 
                  sx={{placeSelf: "center", cursor: 'pointer'}}
                  onClick={() => navigate(`/listing/${l.id}`)}
                >
                  <ListingCard listing={l} />
                </Box>
              ))}
            </div>          
          </>
        )}
        {filtered.length === 0 && (
          <Typography style={{opacity:0.7, marginTop: 20, color: "black", textAlign: "left"}} variant="h3">
            No results. Try broadening your filters.
          </Typography>
        )}
      </div>
    </div>
  )
}

function ListingDetailPage({ listings }: { listings: Listing[] }) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const listing = listings.find(l => l.id === id)

  if (!listing) {
    return (
      <div style={{ maxWidth: 900, margin: '24px auto', padding: '0 24px' }}>
        <Typography variant="h4" sx={{ color: 'black' }}>
          Listing not found
        </Typography>
        <button onClick={() => navigate('/')} style={{ marginTop: 20 }}>
          ← Back to Listings
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: '24px auto', padding: '0 24px' }}>
      <button onClick={() => navigate('/')} style={{ marginBottom: 20 }}>
        ← Back to Listings
      </button>
      
      <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <img 
          src={listing.imageUrl} 
          alt={listing.title}
          style={{ width: '100%', height: 400, objectFit: 'cover' }}
        />
        
        <div style={{ padding: 32 }}>
          <Typography variant="h3" sx={{ color: 'black', marginBottom: 2 }}>
            {listing.title}
          </Typography>
          
          <Typography variant="h4" sx={{ color: '#f7ad45', marginBottom: 3 }}>
            ${listing.price.toLocaleString()}/month
          </Typography>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
            <div>
              <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: 0.5 }}>
                Bedrooms
              </Typography>
              <Typography variant="h6" sx={{ color: 'black' }}>
                {listing.bedrooms}
              </Typography>
            </div>
            
            <div>
              <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: 0.5 }}>
                Bathrooms
              </Typography>
              <Typography variant="h6" sx={{ color: 'black' }}>
                {listing.bathrooms}
              </Typography>
            </div>
            
            {listing.sqft && (
              <div>
                <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: 0.5 }}>
                  Square Feet
                </Typography>
                <Typography variant="h6" sx={{ color: 'black' }}>
                  {listing.sqft.toLocaleString()} sq ft
                </Typography>
              </div>
            )}
            
            <div>
              <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: 0.5 }}>
                Available From
              </Typography>
              <Typography variant="h6" sx={{ color: 'black' }}>
                {new Date(listing.availableFrom).toLocaleDateString()}
              </Typography>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <Typography variant="h6" sx={{ color: 'black', marginBottom: 1 }}>
              Amenities
            </Typography>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {listing.furnished && (
                <span style={{ 
                  padding: '6px 12px', 
                  background: '#e3f2fd', 
                  color: '#1976d2',
                  borderRadius: 16,
                  fontSize: 14
                }}>
                  Furnished
                </span>
              )}
              {listing.petsAllowed && (
                <span style={{ 
                  padding: '6px 12px', 
                  background: '#e8f5e9', 
                  color: '#388e3c',
                  borderRadius: 16,
                  fontSize: 14
                }}>
                  Pets Allowed
                </span>
              )}
            </div>
          </div>

          {listing.description && (
            <div>
              <Typography variant="h6" sx={{ color: 'black', marginBottom: 1 }}>
                Description
              </Typography>
              <Typography sx={{ color: '#555', lineHeight: 1.7 }}>
                {listing.description}
              </Typography>
            </div>
          )}

          <button 
            style={{ 
              marginTop: 32, 
              width: '100%', 
              padding: '12px',
              background: lightBlue['A400'],
              color: 'white',
              border: 'none',
              fontSize: 16,
              fontWeight: 600
            }}
          >
            Contact About This Listing
          </button>
        </div>
      </div>
    </div>
  )
}

/*
  Header for the entire website
*/
function Header({ user, onLogout }: { user: User, onLogout: () => void }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', top:0, background:'white', padding:'12px 24px' }}>
      <div style={{display: 'flex', justifyContent: "space-between", gap: "25px"}}>
        <div style={{display: 'flex', justifyContent: "space-between", alignItems: "center", gap: "10px"}}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <AcUnitIcon sx={{color: lightBlue['A400'], height: "36px", width: "36px"}}/>
            <Typography variant="h5" sx={{color: "black"}}>RoomieMatch</Typography>
          </Link>
        </div>
        <div style={{display: 'flex', justifyContent: "space-between", alignItems: "center", gap: "15px"}}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Typography variant="h6" sx={{color: "black", fontSize: '16px'}}>Home</Typography>
          </Link>
          <Typography variant="h6" sx={{color: "black", fontSize: '16px'}}>Explore</Typography>
          <Typography variant="h6" sx={{color: "black", fontSize: '16px'}}>Messages</Typography>
        </div>
      </div>

      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        <span style={{ opacity: 0.8, color: "black" }}>{user.name} • {user.employer}</span>
        <button style={{backgroundColor: "white", color: "black"}} onClick={onLogout}>Logout</button>
      </div>
    </div>
  )
}

function AuthShell({ view, setView, onAuthed }: { view: AuthView, setView: (v:AuthView)=>void, onAuthed:(u:User)=>void }) {
  return (
    <div style={{ maxWidth: 520, width:'100%', margin: '40px auto', padding: 16 }}>
      <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom: 12 }}>
        <button onClick={()=>setView('login')} aria-pressed={view==='login'}>Login</button>
        <button onClick={()=>setView('signup')} aria-pressed={view==='signup'}>Sign Up</button>
      </div>
      {view === 'login' ? <LoginForm onAuthed={onAuthed} /> : <SignupForm onAuthed={onAuthed} />}
    </div>
  )
}

function LoginForm({ onAuthed }: { onAuthed:(u:User)=>void }) {
  const [form, setForm] = useState({ name:'', password:'' })
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.password) return
    const u: User = { id: crypto.randomUUID(), name: form.name, age: null, gender: '', employer: 'Unknown', password: form.password }
    try {
      if (hasApi) await apiCreateUser(u)
    } catch (e) {
      console.warn('User create via API failed, continuing with local user', e)
    }
    saveUser(u)
    onAuthed(u)
  }
  return (
    <form onSubmit={submit} style={{ display:'grid', gap:12 }}>
      <h2>Login</h2>
      <input placeholder="Name" value={form.name} onChange={e=>setForm(f=>({ ...f, name:e.target.value }))} />
      <input placeholder="Passcode" value={form.password} onChange={e=>setForm(f=>({ ...f, password:e.target.value }))} />
      <button type="submit">Enter</button>
      <p style={{ opacity: 0.7, fontSize: 14 }}>No real auth for MVP. Any name + passcode works.</p>
    </form>
  )
}

function SignupForm({ onAuthed }: { onAuthed:(u:User)=>void }) {
  const [form, setForm] = useState({ name:'', age:'', gender:'', employer:'', password:'' })
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.employer || !form.password) return
    const u: User = { id: crypto.randomUUID(), name: form.name, age: form.age ? Number(form.age) : null, gender: form.gender, employer: form.employer, password: form.password }
    try {
      if (hasApi) await apiCreateUser(u)
    } catch (e) {
      console.warn('User create via API failed, continuing with local user', e)
    }
    saveUser(u)
    onAuthed(u)
  }
  return (
    <form onSubmit={submit} style={{ display:'grid', gap:12 }}>
      <h2>Create account</h2>
      <input placeholder="Name" value={form.name} onChange={e=>setForm(f=>({ ...f, name:e.target.value }))} required />
      <input placeholder="Age" type="number" value={form.age} onChange={e=>setForm(f=>({ ...f, age:e.target.value }))} />
      <select value={form.gender} onChange={e=>setForm(f=>({ ...f, gender:e.target.value }))}>
        <option value="">Prefer not to say</option>
        <option>Female</option>
        <option>Male</option>
        <option>Non-binary</option>
        <option>Other</option>
      </select>
      <input placeholder="Employer / Company" value={form.employer} onChange={e=>setForm(f=>({ ...f, employer:e.target.value }))} required />
      <input placeholder="Passcode" value={form.password} onChange={e=>setForm(f=>({ ...f, password:e.target.value }))} required />
      <button type="submit">Sign up</button>
      <p style={{ opacity: 0.7, fontSize: 14 }}>We only store this in your browser for MVP.</p>
    </form>
  )
}