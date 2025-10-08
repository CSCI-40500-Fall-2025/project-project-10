import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { z } from 'zod'
import { pool, query } from './db'
import jwt from 'jsonwebtoken';        
import bcrypt from 'bcryptjs'; 


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
// delete by id (UUID)
app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // optional: basic UUID sanity check
    // if (!/^[0-9a-f-]{36}$/i.test(id)) return res.status(400).json({ error: 'Invalid id' });

    const { rows } = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ ok: true, id: rows[0].id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});
app.post('/users', async (req, res) => {
  const parsed = UserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const u = parsed.data;

  // hash the passcode before inserting
  const hash = await bcrypt.hash(u.passcode, 12);

  const { rows } = await query<{ id: string }>(
    `INSERT INTO users (name, age, gender, employer, company_id, passcode)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [u.name, u.age ?? null, u.gender ?? '', u.employer, u.companyId ?? null, hash]
  );

  // never return the passcode/hash
  res.status(201).json({
    id: rows[0].id,
    name: u.name,
    age: u.age ?? null,
    gender: u.gender ?? '',
    employer: u.employer,
    companyId: u.companyId ?? null
  });
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

async function getUserByName(name: string) {
  const { rows } = await query(
    'SELECT id, name, employer, passcode FROM users WHERE name = $1',
    [name]
  );
  return rows[0] || null;
}

// Accepts { name, passcode }  (you can also accept { name, password } if you want)
app.post('/login', async (req, res) => {
  const Body = z.object({ name: z.string().min(1), passcode: z.string().min(1) });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const u = await getUserByName(parsed.data.name);
  if (!u) return res.status(401).json({ error: 'Invalid credentials' });

  // compare against the hashed value stored in DB
  const ok = await bcrypt.compare(parsed.data.passcode, u.passcode);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken = jwt.sign(
    { sub: u.id, name: u.name, employer: u.employer },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  res.json({ accessToken, user: { id: u.id, name: u.name, employer: u.employer } });
});

// Protected example (Authorization: Bearer <accessToken>)
app.get('/me', (req, res) => {
  const auth = req.header('authorization');
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as any;
    res.json({ user: { id: payload.sub, name: payload.name, employer: payload.employer } });
  } catch {
    res.status(401).json({ error: 'Invalid/expired token' });
  }
});


const port = Number(process.env.PORT || 4000)
app.listen(port, () => console.log(`API listening on http://localhost:${port}`))

