import { useEffect, useMemo, useState, type FormEvent } from 'react'
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
  const [authView, setAuthView] = useState<AuthView>('login')
  const [user, setUser] = useState<User | null>(() => getCurrentUser())
  const [listings, setListings] = useState<Listing[]>([])
  const [filters, setFilters] = useState<FiltersState>({ city: '', minPrice: 0, maxPrice: 0, beds: '', sort: 'priceAsc' })

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

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetch('http://localhost:4000/protected', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error('Unauthorized');
          return res.json();
        })
        .then(data => {
          setUser(data.user); // Set user if token is valid
        })
        .catch(() => {
          localStorage.removeItem('authToken'); // Remove invalid token
        });
    }
  }, []);

  const onLogout = () => { clearUser(); setUser(null) }

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

  if (!user) return (
    <AuthShell view={authView} setView={setAuthView} onAuthed={setUser} />
  )

  return (
    <div style={{ width: '100%', margin: '0 auto'}}>
      <Header user={user} onLogout={onLogout} />

      <div style={{display: 'flex', justifyContent: "space-between", maxWidth: 1440, width: '100%', margin: '24px auto 0 auto'}}>
        <Filters cities={listings.map(l=>l.city)} onChange={setFilters} />

        {/* Area for search results */}
        <div>
          {filtered.length > 0 && (
            <>
              <Typography sx={{textAlign: "left", color: "black"}} variant="h4">{`Results (${filtered.length})`}</Typography>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 400px)', gridTemplateRows: "350px 350px", gridGap: "16px" }}>
                {filtered.map(l =>  <Box sx={{placeSelf: "center"}}><ListingCard key={l.id} listing={l} /> </Box> )}
              </div>          
            </>
          )
        }
          {filtered.length === 0 && <Typography style={{opacity:0.7, marginTop: 20, color: "black", textAlign: "left"}} variant="h3">No results. Try broadening your filters.</Typography>}
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
          <AcUnitIcon sx={{color: lightBlue['A400'], height: "36px", width: "36px"}}/>
          <Typography variant="h5" sx={{color: "black"}}>RoomieMatch</Typography>
        </div>
        <div style={{display: 'flex', justifyContent: "space-between", alignItems: "center", gap: "15px"}}>
          <Typography variant="h6" sx={{color: "black", fontSize: '16px'}}>Home</Typography>
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

// filepath: /client/src/components/LoginForm.tsx
function LoginForm({ onAuthed }: { onAuthed: (u: User) => void }) {
  const [form, setForm] = useState({ name: '', password: '' });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error('Login failed');
      const { token, user } = await response.json();
      localStorage.setItem('authToken', token); // Save token
      onAuthed(user);
    } catch (error) {
      console.error(error);
      alert('Invalid credentials');
    }
  };

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
      <h2>Login</h2>
      <input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      <input placeholder="Passcode" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
      <button type="submit">Enter</button>
    </form>
  );
}

// filepath: /client/src/components/SignupForm.tsx
function SignupForm({ onAuthed }: { onAuthed: (u: User) => void }) {
  const [form, setForm] = useState({ name: '', password: '', employer: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        password: form.password,           // keep as-is
        employer: form.employer.trim(),
      };

      const res = await fetch('http://localhost:4000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // try to parse JSON (even on errors); fall back gracefully
      let data: any = null;
      try { data = await res.json(); } catch { /* ignore parse errors */ }

      if (!res.ok) {
        // prefer server message; handle common shapes
        const msg =
          data?.message ||
          data?.error?.message ||
          (res.status === 409 ? 'User already exists' : 'Signup failed');
        throw new Error(msg);
      }

      const { token, user } = data;
      localStorage.setItem('authToken', token);
      onAuthed(user);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
      <h2>Create account</h2>
      {err && <div role="alert" style={{ color: 'crimson' }}>{err}</div>}
      <input
        placeholder="Name"
        value={form.name}
        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        required
      />
      <input
        placeholder="Employer"
        value={form.employer}
        onChange={e => setForm(f => ({ ...f, employer: e.target.value }))}
        required
      />
      <input
        placeholder="Passcode"
        type="password"
        value={form.password}
        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
        required
      />
      <button type="submit" disabled={loading}>{loading ? 'Signing up…' : 'Sign up'}</button>
    </form>
  );
}
