import dotenv from 'dotenv'
import { Pool } from 'pg'

dotenv.config()

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL not set')

export const pool = new Pool({ connectionString })

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
  const res = await pool.query(text, params)
  return { rows: res.rows as T[] }
}

