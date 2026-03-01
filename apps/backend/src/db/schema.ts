import { pgTable, text, timestamp, boolean, bigint } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull().default('user'),
  banned: boolean('banned').notNull().default(false),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires'),
  image: text('image'),
  emailVerified: boolean('email_verified').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Sessions table (managed by better-auth)
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull(),
  impersonatedBy: text('impersonated_by'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Accounts table (for OAuth)
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  password: text('password'),
  scope: text('scope'),
  idToken: text('id_token'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Verification table (for email verification)
export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const notes = pgTable('notes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content'),
  createdAt: bigint('created_at', { mode: 'number' }),
  updatedAt: bigint('updated_at', { mode: 'number' }),
  serverCreatedAt: timestamp('server_created_at').notNull().defaultNow(),
  lastModified: timestamp('last_modified').notNull().defaultNow(),
  isDeleted: boolean('is_deleted').notNull().default(false),
})

export const bits = pgTable('bits', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content'),
  status: text('status'),
  tagsJson: text('tags_json'),
  premiseId: text('premise_id'),
  setlistIdsJson: text('setlist_ids_json'),
  createdAt: bigint('created_at', { mode: 'number' }),
  updatedAt: bigint('updated_at', { mode: 'number' }),
  serverCreatedAt: timestamp('server_created_at').notNull().defaultNow(),
  lastModified: timestamp('last_modified').notNull().defaultNow(),
  isDeleted: boolean('is_deleted').notNull().default(false),
})

export const premises = pgTable('premises', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content'),
  status: text('status'),
  attitude: text('attitude'),
  tagsJson: text('tags_json'),
  bitIdsJson: text('bit_ids_json'),
  createdAt: bigint('created_at', { mode: 'number' }),
  updatedAt: bigint('updated_at', { mode: 'number' }),
  serverCreatedAt: timestamp('server_created_at').notNull().defaultNow(),
  lastModified: timestamp('last_modified').notNull().defaultNow(),
  isDeleted: boolean('is_deleted').notNull().default(false),
})

export const setlists = pgTable('setlists', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  description: text('description'),
  itemsJson: text('items_json'),
  tagsJson: text('tags_json'),
  createdAt: bigint('created_at', { mode: 'number' }),
  updatedAt: bigint('updated_at', { mode: 'number' }),
  serverCreatedAt: timestamp('server_created_at').notNull().defaultNow(),
  lastModified: timestamp('last_modified').notNull().defaultNow(),
  isDeleted: boolean('is_deleted').notNull().default(false),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  notes: many(notes),
  bits: many(bits),
  premises: many(premises),
  setlists: many(setlists),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
}))

export const bitsRelations = relations(bits, ({ one }) => ({
  user: one(users, {
    fields: [bits.userId],
    references: [users.id],
  }),
}))

export const premisesRelations = relations(premises, ({ one }) => ({
  user: one(users, {
    fields: [premises.userId],
    references: [users.id],
  }),
}))

export const setlistsRelations = relations(setlists, ({ one }) => ({
  user: one(users, {
    fields: [setlists.userId],
    references: [users.id],
  }),
}))

// Type exports
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
export type Account = typeof accounts.$inferSelect
export type Verification = typeof verification.$inferSelect
export type Note = typeof notes.$inferSelect
export type NewNote = typeof notes.$inferInsert
export type Bit = typeof bits.$inferSelect
export type NewBit = typeof bits.$inferInsert
export type Premise = typeof premises.$inferSelect
export type NewPremise = typeof premises.$inferInsert
export type Setlist = typeof setlists.$inferSelect
export type NewSetlist = typeof setlists.$inferInsert
