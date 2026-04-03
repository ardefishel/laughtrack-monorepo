import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import { dbLogger } from '../lib/logger'
import * as schema from './schema'

const isServerless = !!process.env.VERCEL

const { Pool } = pg

const rawDatabaseUrl = process.env.DATABASE_URL ?? ''

function buildConnectionString(raw: string): string {
  try {
    const url = new URL(raw)
    // Supabase pooler (Transaction mode) requires disabling prepared statements
    if (!url.searchParams.has('pgbouncer') && !url.searchParams.has('prepare')) {
      url.searchParams.set('pgbouncer', 'true')
    }
    return url.toString()
  } catch {
    return raw
  }
}

const pool = new Pool({
  connectionString: buildConnectionString(rawDatabaseUrl),
  max: isServerless ? 1 : 10,
  idleTimeoutMillis: isServerless ? 1_000 : 10_000,
  connectionTimeoutMillis: 10_000,
  ssl: { rejectUnauthorized: false },
})


export const db = drizzle(pool, {
  schema,
  logger: process.env.NODE_ENV === 'development',
})

export async function connectDatabase() {
  try {
    const client = await pool.connect()
    await client.query({ text: 'SELECT 1', name: undefined })
    client.release()
    dbLogger.info('Database connected successfully')
  } catch (error) {
    dbLogger.error({ err: error instanceof Error ? error.message : error }, 'Database connection failed')
    process.exit(1)
  }
}

export async function disconnectDatabase() {
  try {
    await pool.end()
    dbLogger.info('Database disconnected')
  } catch (error) {
    dbLogger.error({ err: error }, 'Database disconnection failed')
  }
}
