import type { Listing, User } from './types'

const API_URL = import.meta.env.VITE_API_URL as string | undefined

export const hasApi = !!API_URL

export async function fetchListings(): Promise<Listing[]> {
  if (!API_URL) throw new Error('API not configured')
  const res = await fetch(`${API_URL}/listings`)
  if (!res.ok) throw new Error(`Failed to fetch listings: ${res.status}`)
  return res.json()
}

export async function createUser(u: Omit<User, 'id'>): Promise<User> {
  if (!API_URL) throw new Error('API not configured')
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: u.name,
      age: u.age,
      gender: u.gender,
      employer: u.employer,
      passcode: u.password
    })
  })
  if (!res.ok) throw new Error(`Failed to create user: ${res.status}`)
  const data = await res.json()
  return { id: data.id, ...u }
}

