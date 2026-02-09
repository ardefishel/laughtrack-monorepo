import { drizzle } from 'drizzle-orm/node-postgres'
import { Client } from 'pg'
import * as schema from './schema'

const client = new Client({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT) ?? 5432,
  user: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'backend',
})

export const db = drizzle({
  client,
  schema,
  logger: process.env.NODE_ENV === 'development',
})

export async function connectDatabase() {
  try {
    await client.connect()
    console.log('Database connected successfully')
  } catch (error) {
    console.error('Database connection failed:', error)
    process.exit(1)
  }
}

export async function disconnectDatabase() {
  try {
    await client.end()
    console.log('Database disconnected')
  } catch (error) {
    console.error('Database disconnection failed:', error)
  }
}
