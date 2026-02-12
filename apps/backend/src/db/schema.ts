import { pgTable, text, timestamp, boolean, bigint, integer } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
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

// Jokes table
export const jokes = pgTable('jokes', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  contentHtml: text('content_html'),
  contentText: text('content_text'),
  status: text('status'),
  createdAt: bigint('created_at', { mode: 'number' }),
  updatedAt: bigint('updated_at', { mode: 'number' }),
  draftUpdatedAt: bigint('draft_updated_at', { mode: 'number' }),
  tags: text('tags'),
  serverCreatedAt: timestamp('server_created_at').notNull().defaultNow(),
  lastModified: timestamp('last_modified').notNull().defaultNow(),
  isDeleted: boolean('is_deleted').notNull().default(false),
})

// Joke sets table
export const jokeSets = pgTable('joke_sets', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title'),
  description: text('description'),
  duration: integer('duration'),
  place: text('place'),
  status: text('status'),
  createdAt: bigint('created_at', { mode: 'number' }),
  updatedAt: bigint('updated_at', { mode: 'number' }),
  serverCreatedAt: timestamp('server_created_at').notNull().defaultNow(),
  lastModified: timestamp('last_modified').notNull().defaultNow(),
  isDeleted: boolean('is_deleted').notNull().default(false),
})

// Joke set items table
export const jokeSetItems = pgTable('joke_set_items', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  setId: text('set_id'),
  itemType: text('item_type'),
  jokeId: text('joke_id'),
  content: text('content'),
  position: integer('position'),
  createdAt: bigint('created_at', { mode: 'number' }),
  updatedAt: bigint('updated_at', { mode: 'number' }),
  serverCreatedAt: timestamp('server_created_at').notNull().defaultNow(),
  lastModified: timestamp('last_modified').notNull().defaultNow(),
  isDeleted: boolean('is_deleted').notNull().default(false),
})

// Audio recordings table
export const audioRecordings = pgTable('audio_recordings', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  jokeId: text('joke_id'),
  filePath: text('file_path'),
  duration: integer('duration'),
  size: integer('size'),
  description: text('description'),
  remoteUrl: text('remote_url'),
  createdAt: bigint('created_at', { mode: 'number' }),
  updatedAt: bigint('updated_at', { mode: 'number' }),
  serverCreatedAt: timestamp('server_created_at').notNull().defaultNow(),
  lastModified: timestamp('last_modified').notNull().defaultNow(),
  isDeleted: boolean('is_deleted').notNull().default(false),
})

// Tags table
export const tags = pgTable('tags', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: bigint('created_at', { mode: 'number' }),
  updatedAt: bigint('updated_at', { mode: 'number' }),
  serverCreatedAt: timestamp('server_created_at').notNull().defaultNow(),
  lastModified: timestamp('last_modified').notNull().defaultNow(),
  isDeleted: boolean('is_deleted').notNull().default(false),
})

// Joke tags table
export const jokeTags = pgTable('joke_tags', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  jokeId: text('joke_id')
    .notNull()
    .references(() => jokes.id, { onDelete: 'cascade' }),
  tagId: text('tag_id')
    .notNull()
    .references(() => tags.id, { onDelete: 'cascade' }),
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
  jokes: many(jokes),
  jokeSets: many(jokeSets),
  jokeSetItems: many(jokeSetItems),
  audioRecordings: many(audioRecordings),
  tags: many(tags),
  jokeTags: many(jokeTags),
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

export const jokesRelations = relations(jokes, ({ one, many }) => ({
  user: one(users, {
    fields: [jokes.userId],
    references: [users.id],
  }),
  audioRecordings: many(audioRecordings),
  jokeTags: many(jokeTags),
}))

export const jokeSetsRelations = relations(jokeSets, ({ one, many }) => ({
  user: one(users, {
    fields: [jokeSets.userId],
    references: [users.id],
  }),
  items: many(jokeSetItems),
}))

export const jokeSetItemsRelations = relations(jokeSetItems, ({ one }) => ({
  user: one(users, {
    fields: [jokeSetItems.userId],
    references: [users.id],
  }),
  jokeSet: one(jokeSets, {
    fields: [jokeSetItems.setId],
    references: [jokeSets.id],
  }),
}))

export const audioRecordingsRelations = relations(audioRecordings, ({ one }) => ({
  user: one(users, {
    fields: [audioRecordings.userId],
    references: [users.id],
  }),
  joke: one(jokes, {
    fields: [audioRecordings.jokeId],
    references: [jokes.id],
  }),
}))

export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(users, {
    fields: [tags.userId],
    references: [users.id],
  }),
  jokeTags: many(jokeTags),
}))

export const jokeTagsRelations = relations(jokeTags, ({ one }) => ({
  user: one(users, {
    fields: [jokeTags.userId],
    references: [users.id],
  }),
  joke: one(jokes, {
    fields: [jokeTags.jokeId],
    references: [jokes.id],
  }),
  tag: one(tags, {
    fields: [jokeTags.tagId],
    references: [tags.id],
  }),
}))

// Type exports
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
export type Account = typeof accounts.$inferSelect
export type Verification = typeof verification.$inferSelect
export type Joke = typeof jokes.$inferSelect
export type NewJoke = typeof jokes.$inferInsert
export type JokeSet = typeof jokeSets.$inferSelect
export type NewJokeSet = typeof jokeSets.$inferInsert
export type JokeSetItem = typeof jokeSetItems.$inferSelect
export type NewJokeSetItem = typeof jokeSetItems.$inferInsert
export type AudioRecording = typeof audioRecordings.$inferSelect
export type NewAudioRecording = typeof audioRecordings.$inferInsert
export type Tag = typeof tags.$inferSelect
export type NewTag = typeof tags.$inferInsert
export type JokeTag = typeof jokeTags.$inferSelect
export type NewJokeTag = typeof jokeTags.$inferInsert
