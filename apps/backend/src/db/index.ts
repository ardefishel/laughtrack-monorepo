import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { dbLogger } from '../lib/logger'
import * as schema from './schema'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  max: 10,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
  ssl: { rejectUnauthorized: false },
})


export const db = drizzle(pool, {
  schema,
  logger: process.env.NODE_ENV === 'development',
})

export async function connectDatabase() {
  try {
    await pool.query('SELECT 1')
    dbLogger.info('Database connected successfully')
  } catch (error) {
    dbLogger.error({ err: error }, 'Database connection failed')
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
