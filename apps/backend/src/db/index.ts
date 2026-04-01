import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { dbLogger } from '@laughtrack/logger/node'
import * as schema from './schema'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  max: 10,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
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
    dbLogger.error('Database connection failed:', error)
    process.exit(1)
  }
}

export async function disconnectDatabase() {
  try {
    await pool.end()
    dbLogger.info('Database disconnected')
  } catch (error) {
    dbLogger.error('Database disconnection failed:', error)
  }
}
