import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { z } from 'zod'
import { pool, query } from './db'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }))

// Initialize schema (idempotent). Requires pgcrypto for gen_random_uuid()
app.post('/admin/init', async (_req, res) => {
  try {
    await pool.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
    const sql = (await import('fs/promises')).readFile(new URL('./schema.sql', import.meta.url))
    const text = await sql
    await pool.query(text.toString())
    res.json({ ok: true })
  } catch (e: any) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
})

// Companies
app.get('/companies', async (_req, res) => {
  const { rows } = await query('SELECT id, name, domain FROM companies ORDER BY name ASC')
  res.json(rows)
})

const UserSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().min(16).max(100).nullable().optional(),
  gender: z.string().optional().default(''),
  employer: z.string().min(1),
  passcode: z.string().min(1),
  companyId: z.number().int().optional().nullable()
})

app.post('/users', async (req, res) => {
  const parsed = UserSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const u = parsed.data
  const { rows } = await query<{ id: string }>(
    `INSERT INTO users (name, age, gender, employer, company_id, passcode)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [u.name, u.age ?? null, u.gender ?? '', u.employer, u.companyId ?? null, u.passcode]
  )
  res.status(201).json({ id: rows[0].id, ...u })
})

// Areas
app.get('/areas', async (_req, res) => {
  const { rows } = await query('SELECT id, name, city, state, lat, lng FROM areas ORDER BY city, name')
  res.json(rows)
})

// Listings
app.get('/listings', async (_req, res) => {
  const { rows } = await query(
    `SELECT id, title, city, area_id as "areaId", price, bedrooms, bathrooms,
            to_char(available_from, 'YYYY-MM-DD') as "availableFrom",
            image_url as "imageUrl", sqft, furnished, pets_allowed as "petsAllowed", description
     FROM listings
     ORDER BY created_at DESC`
  )
  res.json(rows)
})

const ListingSchema = z.object({
  title: z.string().min(1),
  city: z.string().min(1),
  areaId: z.number().int().nullable().optional(),
  price: z.number().int().positive(),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  availableFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  imageUrl: z.string().url().optional().nullable(),
  sqft: z.number().int().positive().optional().nullable(),
  furnished: z.boolean().optional().default(false),
  petsAllowed: z.boolean().optional().default(false),
  description: z.string().optional().nullable(),
  ownerUserId: z.string().uuid().optional().nullable()
})

app.post('/listings', async (req, res) => {
  const parsed = ListingSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const l = parsed.data
  const { rows } = await query<{ id: string }>(
    `INSERT INTO listings (title, city, area_id, price, bedrooms, bathrooms, available_from, image_url, sqft, furnished, pets_allowed, description, owner_user_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING id`,
    [l.title, l.city, l.areaId ?? null, l.price, l.bedrooms, l.bathrooms, l.availableFrom, l.imageUrl ?? null, l.sqft ?? null, l.furnished ?? false, l.petsAllowed ?? false, l.description ?? null, l.ownerUserId ?? null]
  )
  res.status(201).json({ id: rows[0].id, ...l })
})

const port = Number(process.env.PORT || 4000)
app.listen(port, () => console.log(`API listening on http://localhost:${port}`))

