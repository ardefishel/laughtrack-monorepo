---
name: backend-stack-skill-pack
description: Complete backend development guide using Bun runtime, Hono framework, Drizzle ORM, PostgreSQL, and better-auth. Covers project setup, Docker PostgreSQL, schema design, migrations, REST API architecture, authentication integration, performance optimization, and production readiness. Use when building production-ready TypeScript APIs with this modern stack.
---

# Bun + Hono + Drizzle ORM + PostgreSQL + better-auth: Complete Backend Skill Pack

A comprehensive learning and implementation guide for building production-ready REST APIs with modern TypeScript technologies.

---

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [Folder Structure & Conventions](#2-folder-structure--conventions)
3. [PostgreSQL with Docker](#3-postgresql-with-docker)
4. [Drizzle ORM Integration](#4-drizzle-orm-integration)
5. [Hono API Architecture](#5-hono-api-architecture)
6. [better-auth Integration](#6-better-auth-integration)
7. [Performance & Production Readiness](#7-performance--production-readiness)
8. [Practice Plan](#8-practice-plan)
9. [Verification](#9-verification)
10. [Documentation References](#10-documentation-references)

---

## 1. Project Setup

### 1.1 Initialize Project with Bun

Bun is a fast JavaScript runtime, package manager, and bundler. Initialize a new TypeScript project using Bun's built-in tooling.

```bash
# Initialize a new Bun project (creates package.json with defaults)
bun init

# Alternative: Initialize with specific options
bun init --name tasks-api --template express-ts
```

**Why Bun for this stack:**
- Native TypeScript support without additional compilation steps
- Fast startup time and hot reloading
- Built-in package manager (replaces npm/yarn/pnpm)
- Web-standard APIs that work across runtimes
- Excellent performance for I/O-bound API workloads

**Documentation:**
- [Bun Installation](https://bun.sh/docs/installation)
- [Bun Runtime](https://bun.sh/docs/runtime)

### 1.2 Install Required Dependencies

Split dependencies into production and development categories for clarity.

**Production Dependencies:**

```bash
# Core framework and server
bun add hono

# Database ORM and PostgreSQL driver
bun add drizzle-orm
bun add drizzle-kit
bun add pg

# Authentication
bun add better-auth

# Environment variable handling
bun add dotenv

# Additional utilities
bun add zod        # Validation
bun add bcryptjs   # Password hashing
```

**Development Dependencies:**

```bash
# TypeScript and types
bun add -D typescript
bun add -D @types/node
bun add -D @types/pg
bun add -D @types/bcryptjs

# Code quality
bun add -D eslint
bun add -D prettier
bun add -D eslint-plugin-hono

# Database tools
bun add -D pg-native  # Native PostgreSQL driver for production
```

### 1.3 TypeScript Configuration

Create a `tsconfig.json` tailored for API development with strict type safety.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Key TypeScript decisions explained:**

| Option | Value | Rationale |
|--------|-------|-----------|
| `target` | ES2022 | Modern features, good runtime support |
| `module` | NodeNext | Modern Node.js module system |
| `strict` | true | Maximum type safety for production code |
| `experimentalDecorators` | true | Required for Drizzle ORM (optional, can use `drizzle-orm/sqlite-core` for decorator-free) |

**Documentation:**
- [TypeScript Compiler Options](https://www.typescriptlang.org/tsconfig)

### 1.4 Recommended package.json Scripts

```json
{
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "build": "tsc",
    "start": "bun run dist/index.js",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write src"
  }
}
```

**Script purpose:**
- `dev`: Hot-reload development server using Bun's `--watch` flag
- `build`: TypeScript compilation with type checking
- `start`: Production server entry point
- `db:generate`: Create migration files from schema changes
- `db:migrate`: Apply pending migrations to database
- `db:push`: Quick schema sync for development (not for production)
- `db:studio`: GUI database explorer

---

## 2. Folder Structure & Conventions

### 2.1 Recommended Project Structure

```
tasks-api/
├── src/
│   ├── auth/              # Authentication configuration
│   │   ├── index.ts       # better-auth export
│   │   └── types.ts       # Auth type extensions
│   ├── db/
│   │   ├── index.ts       # Database connection export
│   │   ├── schema.ts      # Drizzle schema definitions
│   │   └── migrations/    # Generated migration files
│   ├── middlewares/
│   │   ├── auth.ts        # Protected route middleware
│   │   ├── error.ts       # Error handling middleware
│   │   ├── logger.ts      # Request logging middleware
│   │   └── cors.ts        # CORS configuration
│   ├── routes/
│   │   ├── index.ts       # Route composition
│   │   ├── auth-routes.ts # Authentication endpoints
│   │   └── task-routes.ts # Task CRUD endpoints
│   ├── services/
│   │   ├── task.service.ts    # Task business logic
│   │   └── user.service.ts    # User business logic
│   ├── lib/
│   │   ├── env.ts         # Environment validation
│   │   └── logger.ts      # Structured logging
│   ├── types/
│   │   ├── api.ts         # API response types
│   │   └── common.ts      # Shared types
│   ├── validators/
│   │   ├── task.validator.ts   # Task validation schemas
│   │   └── auth.validator.ts   # Auth validation schemas
│   └── index.ts           # Application entry point
├── drizzle.config.ts       # Drizzle configuration
├── .env                   # Environment variables (local)
├── .env.example           # Environment template
├── docker-compose.yml     # PostgreSQL container
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

### 2.2 Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Routes | kebab-case | `task-routes.ts`, `auth-routes.ts` |
| Table names | snake_case | `users`, `tasks`, `sessions` |
| Columns | snake_case | `created_at`, `updated_at` |
| Variables/functions | camelCase | `createTask`, `getUserById` |
| Types/Interfaces | PascalCase | `Task`, `CreateTaskInput` |
| Constants | UPPER_SNAKE_CASE | `MAX_TASK_LENGTH`, `DEFAULT_PAGE_SIZE` |
| Directories | kebab-case | `auth/`, `task-routes/`, `middlewares/` |

### 2.3 Route Module Pattern

Each route module follows this pattern:

```typescript
// src/routes/task-routes.ts
import { Hono } from 'hono';
import { taskService } from '../services/task.service';
import { createTaskValidator, updateTaskValidator } from '../validators/task.validator';
import { authMiddleware } from '../middlewares/auth';

const taskRoutes = new Hono();

// All routes protected by authentication
taskRoutes.use('/*', authMiddleware);

// GET /tasks - List all tasks with pagination
taskRoutes.get('/', async (c) => {
  const page = c.req.query('page') ?? '1';
  const limit = c.req.query('limit') ?? '10';
  const tasks = await taskService.listTasks({
    page: Number(page),
    limit: Number(limit),
  });
  return c.json(tasks);
});

// GET /tasks/:id - Get single task
taskRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const task = await taskService.getTask(id);
  if (!task) {
    return c.json({ error: 'Task not found' }, 404);
  }
  return c.json(task);
});

// POST /tasks - Create new task
taskRoutes.post('/', createTaskValidator, async (c) => {
  const data = c.req.valid('json');
  const task = await taskService.createTask(data);
  return c.json(task, 201);
});

// PUT /tasks/:id - Update task
taskRoutes.put('/:id', updateTaskValidator, async (c) => {
  const id = c.req.param('id');
  const data = c.req.valid('json');
  const task = await taskService.updateTask(id, data);
  return c.json(task);
});

// DELETE /tasks/:id - Delete task
taskRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');
  await taskService.deleteTask(id);
  return c.body(null, 204);
});

export { taskRoutes };
```

**Documentation:**
- [Hono Routing](https://hono.dev/docs/api/routing)

---

## 3. PostgreSQL with Docker

### 3.1 Docker Compose Configuration

Create a `docker-compose.yml` for PostgreSQL with development-appropriate settings.

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: tasks-api-db
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      POSTGRES_DB: ${DB_NAME:-tasks_api}
    ports:
      - '${DB_PORT:-5432}:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${DB_USER:-postgres}']
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - tasks-api-network

  # Optional: pgAdmin for database management
  pgadmin:
    image: dpage/pgadmin8:latest
    container_name: tasks-api-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: ${PGADMIN_EMAIL:-admin@example.com}
      PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_PASSWORD:-admin}
    ports:
      - '${PGADMIN_PORT:-5050}:80'
    depends_on:
      - postgres
    networks:
      - tasks-api-network

networks:
  tasks-api-network:
    driver: bridge

volumes:
  postgres_data:
```

### 3.2 Environment Configuration

Create `.env.example` as a template:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=tasks_api

# better-auth
AUTH_SECRET=your-super-secret-key-at-least-32-chars
AUTH_URL=http://localhost:3000

# Server
PORT=3000
NODE_ENV=development

# Optional: pgAdmin
PGADMIN_EMAIL=admin@example.com
PGADMIN_PASSWORD=admin
PGADMIN_PORT=5050
```

### 3.3 Starting and Managing PostgreSQL

```bash
# Start the database in detached mode
docker compose up -d

# Check container status
docker compose ps

# View logs
docker compose logs -f postgres

# Stop the database
docker compose down

# Stop and remove volumes (WARNING: deletes all data)
docker compose down -v

# Restart the database
docker compose restart postgres
```

### 3.4 Database Management Commands

```bash
# Connect to PostgreSQL CLI
docker exec -it tasks-api-db psql -U postgres -d tasks_api

# Common psql commands
\c tasks_api           # Connect to database
\dt                   # List tables
\d users              # Describe table structure
\du                   # List users/roles
\q                    # Quit

# Backup database
docker exec tasks-api-db pg_dump -U postgres tasks_api > backup.sql

# Restore database
docker exec -i tasks-api-db psql -U postgres tasks_api < backup.sql
```

**Documentation:**
- [PostgreSQL Docker Official Image](https://hub.docker.com/_/postgres)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

## 4. Drizzle ORM Integration

### 4.1 Drizzle Configuration

Create `drizzle.config.ts` at the project root:

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

**Key configuration options:**

| Option | Value | Purpose |
|--------|-------|---------|
| `dialect` | 'postgresql' | Target database type |
| `schema` | './src/db/schema.ts' | Schema file location |
| `out` | './src/db/migrations' | Migration output directory |
| `dbCredentials.url` | env variable | Connection string |
| `verbose` | true | Detailed output |
| `strict` | true | Strict schema checking |

**Documentation:**
- [Drizzle Kit Configuration](https://orm.drizzle.team/docs/kit-overview)

### 4.2 Schema Definitions

Create `src/db/schema.ts`:

```typescript
import { pgTable, serial, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Tasks table
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  completed: boolean('completed').notNull().default(false),
  priority: integer('priority').notNull().default(0), // 0: low, 1: medium, 2: high
  dueDate: timestamp('due_date'),
  metadata: jsonb('metadata'), // Flexible field for additional data
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Sessions table (managed by better-auth, optional for custom session handling)
export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  sessions: many(sessions),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// Type exports for easy importing
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
```

**Schema design principles:**

1. **Always include `created_at` and `updated_at`** - Essential for auditing and debugging
2. **Use proper data types** - `text` over `varchar(n)` for flexibility, `timestamp` with timezone
3. **Add indexes on foreign keys** - Drizzle handles this, but ensure queries leverage them
4. **Use `onDelete: 'cascade'`** - Clean up orphaned records automatically
5. **JSONB for flexible metadata** - Avoid altering schema for optional fields

**Documentation:**
- [Drizzle Schema Definition](https://orm.drizzle.team/docs/schema)
- [Drizzle Relations](https://orm.drizzle.team/docs/relations)

### 4.3 Database Connection

Create `src/db/index.ts`:

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './schema';

const client = new Client({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT) ?? 5432,
  user: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'tasks_api',
});

export const db = drizzle({
  client,
  schema,
  logger: process.env.NODE_ENV === 'development',
});

// Connection management
export async function connectDatabase() {
  try {
    await client.connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  try {
    await client.end();
    console.log('✅ Database disconnected');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
  }
}
```

**Documentation:**
- [Drizzle Database Connection](https://orm.drizzle.team/docs/get-started-postgres/new-queries#node-postgres)

### 4.4 Migration Workflow

```bash
# Generate migration files from schema changes
bun run db:generate

# Apply migrations to database
bun run db:migrate

# Push schema changes directly (development only)
bun run db:push

# Open Drizzle Studio (GUI)
bun run db:studio
```

**Migration file example** (`src/db/migrations/0000_cool_wolverine.sql`):

```sql
CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "tasks" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "priority" INTEGER NOT NULL DEFAULT 0,
  "due_date" TIMESTAMP,
  "metadata" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "tasks_user_id_idx" ON "tasks"("user_id");
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
```

**Rollback strategy:**

Drizzle doesn't have built-in rollbacks. Strategies include:

1. **Generate down migrations manually:**
   ```sql
   -- drizzle/migrations/0000_cool_wolverine_down.sql
   ALTER TABLE "tasks" DROP CONSTRAINT "tasks_user_id_users_id_fk";
   DROP TABLE IF EXISTS "tasks";
   DROP TABLE IF EXISTS "users";
   ```

2. **Use a migration table for tracking:**
   ```bash
   # Revert last migration
   drizzle-kit migrate:drop
   ```

**Documentation:**
- [Drizzle Migrations](https://orm.drizzle.team/docs/migrations)

### 4.5 Query Patterns

**Basic CRUD operations:**

```typescript
// src/services/task.service.ts
import { db } from '../db';
import { tasks, users } from '../db/schema';
import { eq, desc, asc, like, and, gte, lte } from 'drizzle-orm';
import type { NewTask, Task } from '../db/schema';

export const taskService = {
  async createTask(data: NewTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(data).returning();
    return task;
  },

  async getTaskById(id: string): Promise<Task | undefined> {
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, Number(id)))
      .limit(1);
    return task;
  },

  async listTasks(userId: number, options?: {
    page?: number;
    limit?: number;
    completed?: boolean;
  }): Promise<{ data: Task[]; total: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;
    const offset = (page - 1) * limit;

    const conditions = [eq(tasks.userId, userId)];
    if (options?.completed !== undefined) {
      conditions.push(eq(tasks.completed, options.completed));
    }

    const [data, [{ count }]] = await Promise.all([
      db
        .select()
        .from(tasks)
        .where(and(...conditions))
        .orderBy(desc(tasks.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(tasks)
        .where(and(...conditions)),
    ]);

    return { data, total: Number(count) };
  },

  async updateTask(id: string, data: Partial<NewTask>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tasks.id, Number(id)))
      .returning();
    return task;
  },

  async deleteTask(id: string): Promise<boolean> {
    const result = await db
      .delete(tasks)
      .where(eq(tasks.id, Number(id)));
    return (result.rowCount ?? 0) > 0;
  },
};
```

**Transaction example:**

```typescript
async function transferTaskOwnership(
  taskId: number,
  fromUserId: number,
  toUserId: number
) {
  return await db.transaction(async (tx) => {
    // Verify task exists and belongs to fromUserId
    const [task] = await tx
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, fromUserId)));

    if (!task) {
      throw new Error('Task not found or access denied');
    }

    // Transfer ownership
    await tx
      .update(tasks)
      .set({ userId: toUserId, updatedAt: new Date() })
      .where(eq(tasks.id, taskId));

    // Log the transfer
    await tx.insert(taskAuditLog).values({
      taskId,
      fromUserId,
      toUserId,
      action: 'OWNERSHIP_TRANSFER',
    });
  });
}
```

**Documentation:**
- [Drizzle Select Queries](https://orm.drizzle.team/docs/select)
- [Drizzle Insert](https://orm.drizzle.team/docs/insert)
- [Drizzle Update](https://orm.drizzle.team/docs/update)
- [Drizzle Transactions](https://orm.drizzle.team/docs/transactions)

---

## 5. Hono API Architecture

### 5.1 Application Setup

Create `src/index.ts`:

```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { env } from 'hono/adapter';
import { connectDatabase, disconnectDatabase } from './db';
import { taskRoutes } from './routes/task-routes';
import { authRoutes } from './routes/auth-routes';
import { errorMiddleware } from './middlewares/error';
import { loggerMiddleware } from './middlewares/logger';

// Application configuration
type AppEnv = {
  DATABASE_URL: string;
  AUTH_SECRET: string;
  AUTH_URL: string;
  PORT: string;
};

const app = new Hono<AppEnv>();

// Global middleware
app.use('*', loggerMiddleware());
app.use('*', cors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
app.use('*', errorMiddleware());

// Health check (no auth required)
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount route modules
app.route('/api/auth', authRoutes);
app.route('/api/tasks', taskRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Server startup
const PORT = Number(process.env.PORT) ?? 3000;

async function startServer() {
  await connectDatabase();

  console.log(`🚀 Server starting on port ${PORT}...`);
  console.log(`📝 Environment: ${process.env.NODE_ENV ?? 'development'}`);

  // Bun server
  Bun.serve({
    port: PORT,
    fetch: app.fetch,
  });

  console.log(`✅ Server running at http://localhost:${PORT}`);
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await disconnectDatabase();
  process.exit(0);
});

startServer();
```

**Documentation:**
- [Hono Application](https://hono.dev/docs/api/hono)
- [Hono CORS Middleware](https://hono.dev/docs/middleware/builtin/cors)

### 5.2 Middleware Strategy

**Logger middleware** (`src/middlewares/logger.ts`):

```typescript
import { createMiddleware } from 'hono/factory';
import { ulid } from 'ulid';

type LoggerEnv = {
  Variables: {
    requestId: string;
    startTime: number;
  };
};

export const loggerMiddleware = () => {
  return createMiddleware<LoggerEnv>(async (c, next) => {
    const requestId = c.req.header('X-Request-ID') ?? ulid();
    const startTime = Date.now();

    c.set('requestId', requestId);
    c.set('startTime', startTime);

    await next();

    const duration = Date.now() - startTime;
    const log = {
      requestId,
      method: c.req.method,
      url: c.req.url,
      status: c.res.status,
      duration: `${duration}ms`,
      userAgent: c.req.header('User-Agent'),
    };

    // Log to console (replace with structured logger in production)
    console.log(JSON.stringify(log));
  });
};
```

**Error handling middleware** (`src/middlewares/error.ts`):

```typescript
import { createMiddleware } from 'hono/factory';
import { ZodError } from 'zod';

type ErrorEnv = {
  Variables: {
    error: Error | ZodError | null;
  };
};

export const errorMiddleware = () => {
  return createMiddleware<ErrorEnv>(async (c, next) => {
    try {
      await next();
    } catch (error) {
      const requestId = c.get('requestId');

      if (error instanceof ZodError) {
        return c.json({
          error: 'Validation error',
          requestId,
          details: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        }, 400);
      }

      if (error instanceof Error) {
        console.error(`[${requestId}] Error:`, error.message);

        return c.json({
          error: error.message,
          requestId,
        }, error.message === 'Unauthorized' ? 401 : 500);
      }

      // Unknown error
      console.error(`[${requestId}] Unknown error:`, error);
      return c.json({
        error: 'Internal server error',
        requestId,
      }, 500);
    }
  });
};
```

**Documentation:**
- [Hono Middleware](https://hono.dev/docs/guides/middleware)
- [Hono Context](https://hono.dev/docs/api/context)

### 5.3 Request Validation with Zod

Create `src/validators/task.validator.ts`:

```typescript
import { z } from 'zod';

export const createTaskValidator = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(200, 'Title must be less than 200 characters'),
    description: z
      .string()
      .max(2000, 'Description must be less than 2000 characters')
      .optional(),
    priority: z
      .number()
      .min(0, 'Priority must be 0, 1, or 2')
      .max(2, 'Priority must be 0, 1, or 2')
      .default(0),
    dueDate: z
      .string()
      .datetime()
      .optional(),
  }),
});

export const updateTaskValidator = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(200, 'Title must be less than 200 characters')
      .optional(),
    description: z
      .string()
      .max(2000, 'Description must be less than 2000 characters')
      .optional(),
    completed: z
      .boolean()
      .optional(),
    priority: z
      .number()
      .min(0, 'Priority must be 0, 1, or 2')
      .max(2, 'Priority must be 0, 1, or 2')
      .optional(),
    dueDate: z
      .string()
      .datetime()
      .nullable()
      .optional(),
  }),
  param: z.object({
    id: z.string().transform(val => Number(val)),
  }),
});

// Usage in route:
// app.post('/', createTaskValidator, async (c) => {
//   const data = c.req.valid('json');
//   // ...
// });
```

**Documentation:**
- [Hono Validation](https://hono.dev/docs/guides/validation)
- [Zod Documentation](https://zod.dev)

### 5.4 Standard Response Format

Create `src/lib/response.ts`:

```typescript
// Standard API response wrapper
export function successResponse<T>(data: T, status: number = 200) {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function paginatedResponse<T>(
  data: T[],
  options?: {
    page?: number;
    limit?: number;
    total?: number;
  }
) {
  return {
    success: true,
    data,
    pagination: {
      page: options?.page ?? 1,
      limit: options?.limit ?? 10,
      total: options?.total ?? data.length,
      totalPages: Math.ceil((options?.total ?? data.length) / (options?.limit ?? 10)),
    },
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse(
  message: string,
  status: number = 400,
  details?: Record<string, string>[]
) {
  return {
    success: false,
    error: message,
    details,
    timestamp: new Date().toISOString(),
  };
}
```

---

## 6. better-auth Integration

### 6.1 Authentication Configuration

Create `src/auth/index.ts`:

```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db';
import { users, sessions } from '../db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'postgresql',
    usePassword: true,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  advanced: {
    cookiePrefix: 'tasks-api',
    generateId: () => crypto.randomUUID(),
  },
  plugins: [
    // Add plugins here as needed
    // twoFactorAuth()
  ],
});

// Export type for TypeScript
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.User;
```

**Documentation:**
- [better-auth Configuration](https://www.better-auth.com/docs/getting-started/configuration)
- [better-auth Drizzle Adapter](https://www.better-auth.com/docs/plugins/drizzle)

### 6.2 Auth Middleware

Create `src/middlewares/auth.ts`:

```typescript
import { createMiddleware } from 'hono/factory';
import { auth } from '../auth';

type AuthEnv = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
};

export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    c.set('user', null);
    c.set('session', null);
    await next();
    return;
  }

  c.set('user', session.user);
  c.set('session', session.session);
  await next();
});

export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('user', session.user);
  c.set('session', session.session);
  await next();
});
```

### 6.3 Authentication Routes

Create `src/routes/auth-routes.ts`:

```typescript
import { Hono } from 'hono';
import { auth } from '../auth';
import { authMiddleware } from '../middlewares/auth';

const authRoutes = new Hono();

// Sign up
authRoutes.post('/sign-up', async (c) => {
  const body = await c.req.json();

  try {
    const result = await auth.api.signUp({
      body: {
        email: body.email,
        password: body.password,
        name: body.name,
      },
      headers: c.req.raw.headers,
    });

    return c.json(result, 201);
  } catch (error: any) {
    return c.json({ error: error.message ?? 'Sign up failed' }, 400);
  }
});

// Sign in
authRoutes.post('/sign-in', async (c) => {
  const body = await c.req.json();

  try {
    const result = await auth.api.signIn({
      body: {
        email: body.email,
        password: body.password,
      },
      headers: c.req.raw.headers,
    });

    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message ?? 'Invalid credentials' }, 401);
  }
});

// Sign out
authRoutes.post('/sign-out', authMiddleware, async (c) => {
  const session = c.get('session');

  if (!session) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  await auth.api.signOut({
    headers: c.req.raw.headers,
  });

  return c.json({ success: true });
});

// Get current session
authRoutes.get('/session', authMiddleware, async (c) => {
  const user = c.get('user');
  const session = c.get('session');

  if (!user || !session) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  return c.json({ user, session });
});

// Verify session (for protected routes)
authRoutes.get('/verify', authMiddleware, async (c) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ valid: false }, 401);
  }

  return c.json({ valid: true, user });
});

// Mount better-auth handler for all auth actions
authRoutes.all('/*', async (c) => {
  return auth.handler(c.req.raw);
});

export { authRoutes };
```

**Documentation:**
- [better-auth API Reference](https://www.better-auth.com/docs/api-reference)

### 6.4 CSRF and Cookie Configuration

Configure CORS and cookies for proper auth handling:

```typescript
// In src/index.ts or middleware configuration

// CORS must allow credentials
app.use('/api/*', cors({
  origin: process.env.CORS_ORIGIN!, // Must be exact origin, not wildcard
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true, // Required for cookies
}));

// Cookie settings (handled by better-auth automatically)
```

**Cookie vs Bearer Token tradeoffs:**

| Approach | Pros | Cons |
|----------|------|------|
| **Cookies** | Automatic with browser, familiar UX | CSRF vulnerability, SameSite issues, harder with mobile/native |
| **Bearer Tokens** | CSRF safe, works everywhere | Manual storage, token refresh logic needed |

**Recommendation:** Use Bearer tokens for APIs (simpler, more secure against CSRF):

```typescript
// Extract token from Authorization header
const authHeader = c.req.header('Authorization');
if (authHeader?.startsWith('Bearer ')) {
  const token = authHeader.slice(7);
  // Use token for authentication
}
```

---

## 7. Performance & Production Readiness

### 7.1 Bun/Hono Performance Tips

```typescript
// Use Bun's native fetch (already optimized)
Bun.serve({
  port: PORT,
  fetch: app.fetch,
  // Enable these for production
  // tls: {
  //   cert: Bun.env.TLS_CERT,
  //   key: Bun.env.TLS_KEY,
  // },
});

// For Bun 1.0+ with HTTP/2
// import { Boring } from 'hono/boring'
// app.use('*', Boring())

// Enable Bun's JIT and GC tuning in production
// bun --hot-reload src/index.ts (development)
```

**Performance considerations:**

1. **Use streaming for large responses** when applicable
2. **Avoid synchronous operations** in hot paths
3. **Leverage Bun's native modules** (Buffer, crypto) over npm packages
4. **Use `c.req.raw` sparingly** - parse once and cache if needed

### 7.2 Database Performance

**Indexing strategy:**

```typescript
// Add indexes in migrations for common query patterns
// drizzle/migrations/0001_add_indexes.sql

CREATE INDEX "tasks_user_id_idx" ON "tasks"("user_id");
CREATE INDEX "tasks_completed_idx" ON "tasks"("completed");
CREATE INDEX "tasks_due_date_idx" ON "tasks"("due_date");
CREATE INDEX "tasks_created_at_idx" ON "tasks"("created_at");

-- Composite index for common query
CREATE INDEX "tasks_user_completed_idx" ON "tasks"("user_id", "completed");
```

**Pagination approach:**

```typescript
// Use cursor-based pagination for better performance with large datasets
// Keyset pagination with created_at and id

async function listTasksCursor(
  userId: number,
  cursor?: { createdAt: Date; id: number },
  limit: number = 20
) {
  const conditions = [eq(tasks.userId, userId)];

  if (cursor) {
    conditions.push(
      and(
        or(
          lt(tasks.createdAt, cursor.createdAt),
          and(eq(tasks.createdAt, cursor.createdAt), gt(tasks.id, cursor.id))
        )
      )
    );
  }

  const data = await db
    .select()
    .from(tasks)
    .where(and(...conditions))
    .orderBy(asc(tasks.createdAt), asc(tasks.id))
    .limit(limit + 1); // Fetch one extra to determine if more exists

  const hasMore = data.length > limit;
  const items = hasMore ? data.slice(0, -1) : data;

  return { items, nextCursor: hasMore ? { createdAt: items[items.length - 1].createdAt, id: items[items.length - 1].id } : null };
}
```

**Documentation:**
- [PostgreSQL Indexes](https://www.postgresql.org/docs/current/indexes.html)

### 7.3 Connection Pooling

Drizzle uses `node-postgres` which includes connection pooling. For production, consider PgBouncer:

```yaml
# docker-compose.yml addition
services:
  pgbouncer:
    image: pgbouncer/pgbouncer:latest
    container_name: tasks-api-pgbouncer
    environment:
      DATABASES_HOST: postgres
      DATABASES_PORT: 5432
      DATABASES_USER: postgres
      DATABASES_PASSWORD: postgres
      DATABASES_NAME: tasks_api
      PGBOUNCER_LISTEN_PORT: 6432
      PGBOUNCER_POOL_MODE: transaction
      PGBOUNCER_DEFAULT_POOL_SIZE: 20
      PGBOUNCER_MIN_POOL_SIZE: 5
    ports:
      - '6432:6432'
    depends_on:
      - postgres
```

**Pool mode recommendations:**
- `transaction`: Best for API workloads, releases connection after each query
- `session`: Needed for prepared statements or `LISTEN/NOTIFY`
- `statement`: Most aggressive, only for auto-commit mode

### 7.4 Observability

**Structured logging:**

```typescript
// src/lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  userId?: number;
  [key: string]: unknown;
}

function formatLog(entry: LogEntry): string {
  return JSON.stringify({
    ...entry,
    service: 'tasks-api',
    version: process.env.npm_package_version ?? '1.0.0',
  });
}

export const logger = {
  debug: (message: string, data?: Record<string, unknown>) => {
    if (process.env.LOG_LEVEL !== 'debug') return;
    console.log(formatLog({ timestamp: new Date().toISOString(), level: 'debug', message, ...data }));
  },
  info: (message: string, data?: Record<string, unknown>) => {
    console.log(formatLog({ timestamp: new Date().toISOString(), level: 'info', message, ...data }));
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    console.warn(formatLog({ timestamp: new Date().toISOString(), level: 'warn', message, ...data }));
  },
  error: (message: string, error?: unknown) => {
    console.error(formatLog({ timestamp: new Date().toISOString(), level: 'error', message, error: String(error) }));
  },
};
```

### 7.5 Security Checklist

```bash
# Environment security
AUTH_SECRET=at-least-32-characters-long-secret-key
NODE_ENV=production
DB_HOST=not-localhost-in-production

# Database encryption in production
# SSL/TLS for PostgreSQL connection
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require

# Rate limiting
bun add @upstash/ratelimit @upstash/redis
# or
bun add rate-limiter-flexible
```

**Required security headers:**

```typescript
// Add security headers middleware
app.use('*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  c.header('Content-Security-Policy', "default-src 'self'");
});
```

**Security checklist:**
- [ ] AUTH_SECRET is strong and unique
- [ ] Environment variables validated at startup
- [ ] Database uses SSL in production
- [ ] CORS origin is restricted, not `*`
- [ ] Rate limiting enabled
- [ ] Security headers added
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Drizzle handles this)
- [ ] Password hashing (bcrypt, argon2)

**Documentation:**
- [OWASP API Security](https://owasp.org/API-Security/editions/2023/en/)

---

## 8. Practice Plan

### Exercise 1: Project Initialization

**Goal:** Set up the complete project structure with Bun, TypeScript, and basic configuration.

**Steps:**
1. Create a new directory and initialize with `bun init`
2. Install all production and development dependencies
3. Configure `tsconfig.json` with strict settings
4. Set up `package.json` scripts
5. Create `.env.example` with required variables
6. Verify TypeScript compilation works: `bun build`

**Expected outcome:** A compilable project with no TypeScript errors.

**Common mistakes:**
- Forgetting to create `.env.example` and having undefined env vars
- Not setting `strict: true` in TypeScript
- Installing packages without distinguishing dev vs prod dependencies

**Further reading:**
- [Bun Getting Started](https://bun.sh/docs)
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)

---

### Exercise 2: Docker PostgreSQL Setup

**Goal:** Get PostgreSQL running in Docker with proper configuration.

**Steps:**
1. Create `docker-compose.yml` with PostgreSQL service
2. Configure environment variables for database connection
3. Start the container: `docker compose up -d`
4. Verify connection: `docker exec -it tasks-api-db psql -U postgres -d tasks_api`
5. Test basic SQL operations

**Expected outcome:** Running PostgreSQL instance accessible on port 5432.

**Common mistakes:**
- Not setting volume persistence, losing data on container restart
- Forgetting healthcheck, causing race conditions in startup scripts
- Using wrong user/password combinations

**Further reading:**
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)

---

### Exercise 3: Drizzle Schema and Migrations

**Goal:** Define database schema and create migration workflow.

**Steps:**
1. Configure `drizzle.config.ts`
2. Create `src/db/schema.ts` with users and tasks tables
3. Create `src/db/index.ts` for database connection
4. Generate migrations: `bun run db:generate`
5. Apply migrations: `bun run db:migrate`
6. Open Drizzle Studio: `bun run db:studio` to verify schema

**Expected outcome:** Tables created in PostgreSQL with proper relationships.

**Common mistakes:**
- Not defining foreign key constraints
- Forgetting `onDelete: cascade` for user-tasks relationship
- Running `db:push` in production (destroys data)

**Further reading:**
- [Drizzle Schema Guide](https://orm.drizzle.team/docs/schema)
- [Drizzle Migrations](https://orm.drizzle.team/docs/migrations)

---

### Exercise 4: Hono Application Setup

**Goal:** Build a basic Hono API with middleware and routing.

**Steps:**
1. Create `src/index.ts` with Hono app instance
2. Add CORS middleware with proper credentials handling
3. Implement logger middleware with request IDs
4. Create error handling middleware
5. Add health check endpoint
6. Mount route modules

**Expected outcome:** Running server with working routes and middleware.

**Common mistakes:**
- CORS origin set to `*` when using credentials
- Not ordering middleware correctly (CORS must be early)
- Forgetting async/await in middleware

**Further reading:**
- [Hono Basics](https://hono.dev/docs/getting-started/basic)
- [Hono Middleware](https://hono.dev/docs/middleware/builtin)

---

### Exercise 5: better-auth Integration

**Goal:** Implement complete authentication system.

**Steps:**
1. Configure `src/auth/index.ts` with better-auth
2. Set up Drizzle adapter for session/user storage
3. Create auth routes (sign up, sign in, sign out, session)
4. Implement auth middleware for protected routes
5. Test authentication flow with curl or Postman

**Expected outcome:** Working authentication with session management.

**Common mistakes:**
- CORS not allowing credentials
- Forgetting to mount auth handler for all auth routes
- Not validating email/password format on sign up

**Further reading:**
- [better-auth Getting Started](https://www.better-auth.com/docs/getting-started)

---

### Exercise 6: Task CRUD API

**Goal:** Build complete CRUD operations for tasks.

**Steps:**
1. Define task schema in `src/db/schema.ts`
2. Create task service with all CRUD methods
3. Implement validation with Zod
4. Build route handlers with pagination
5. Protect routes with auth middleware
6. Test all endpoints

**Expected outcome:** Full task management API with authentication.

**Common mistakes:**
- Not using parameterized queries (Drizzle handles this)
- Returning too much data in list endpoint
- Not handling empty results gracefully

**Further reading:**
- [Hono Routing](https://hono.dev/docs/api/routing)

---

### Exercise 7: Production Hardening

**Goal:** Prepare application for production deployment.

**Steps:**
1. Add security headers middleware
2. Implement rate limiting
3. Configure structured logging
4. Set up connection pooling (PgBouncer if needed)
5. Create production environment configuration
6. Write smoke tests for critical paths

**Expected outcome:** Production-ready API with security and observability.

**Common mistakes:**
- Skipping rate limiting until attacked
- Not using environment variables for secrets
- Forgetting health checks and graceful shutdown

**Further reading:**
- [Production Best Practices](https://owasp.org/www-pdf-archive/OWASP_Top_10_for_JavaScript_Apps.pdf)

---

### Exercise 8: Capstone - Complete API Verification

**Goal:** Run the complete stack and verify all functionality.

**Steps:**
1. Start Docker PostgreSQL: `docker compose up -d`
2. Run migrations: `bun run db:migrate`
3. Start server: `bun run dev`
4. Test auth flow:
   - Sign up: `POST /api/auth/sign-up`
   - Sign in: `POST /api/auth/sign-in`
   - Verify session: `GET /api/auth/session`
5. Test CRUD operations with authenticated requests
6. Verify error handling with invalid data
7. Check logs for proper request tracking

**Expected outcome:** Fully functional, authenticated Task API.

**Common mistakes:**
- Forgetting to pass Authorization header
- Not handling session expiration gracefully
- Missing validation on edge cases

---

## 9. Verification

### 9.1 Manual Test Plan

Use curl or HTTP client (HTTPie, Thunder Client, Postman) to verify:

```bash
# Health check
curl http://localhost:3000/health

# Sign up
curl -X POST http://localhost:3000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secure123","name":"Test User"}'

# Sign in (save the session cookie/token)
curl -X POST http://localhost:3000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secure123"}' \
  -c cookies.txt

# Get session (with cookie)
curl http://localhost:3000/api/auth/session \
  -b cookies.txt

# Create task (authenticated)
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Test Task","description":"A test task","priority":1}' \
  -b cookies.txt

# List tasks (authenticated)
curl http://localhost:3000/api/tasks?page=1&limit=10 \
  -b cookies.txt

# Update task (authenticated)
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}' \
  -b cookies.txt

# Delete task (authenticated)
curl -X DELETE http://localhost:3000/api/tasks/1 \
  -b cookies.txt
```

### 9.2 Automated Testing Strategy

**Recommended test structure:**

```
src/
├── __tests__/
│   ├── unit/
│   │   ├── validators.test.ts
│   │   └── services.test.ts
│   ├── integration/
│   │   ├── routes.test.ts
│   │   └── auth.test.ts
│   └── setup.ts
```

**Example unit test** (`src/__tests__/validators.test.ts`):

```typescript
import { describe, it, expect } from 'bun:test';
import { createTaskValidator } from '../validators/task.validator';

describe('Task Validator', () => {
  it('should pass with valid task data', () => {
    const data = {
      title: 'Valid task title',
      description: 'A valid description',
      priority: 1,
    };
    const result = createTaskValidator.safeParse({ body: data });
    expect(result.success).toBe(true);
  });

  it('should fail with empty title', () => {
    const data = {
      title: '',
      priority: 0,
    };
    const result = createTaskValidator.safeParse({ body: data });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('title');
    }
  });

  it('should fail with invalid priority', () => {
    const data = {
      title: 'Task',
      priority: 5,
    };
    const result = createTaskValidator.safeParse({ body: data });
    expect(result.success).toBe(false);
  });
});
```

**Example integration test** (`src/__tests__/routes.test.ts`):

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { app } from '../index';
import { connectDatabase, disconnectDatabase } from '../db';

// Use test database in CI

describe('Task Routes', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it('should return 401 without authentication', async () => {
    const res = await app.request('/api/tasks', {
      method: 'GET',
    });
    expect(res.status).toBe(401);
  });

  it('should create task with valid data', async () => {
    // First sign in to get session
    const signInRes = await app.request('/api/auth/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'secure123',
      }),
    });

    const sessionCookie = signInRes.headers.get('Set-Cookie');

    const createRes = await app.request('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie!,
      },
      body: JSON.stringify({
        title: 'Test Task',
        description: 'Test description',
      }),
    });

    expect(createRes.status).toBe(201);
  });
});
```

**Test commands:**

```bash
# Run all tests
bun test

# Run with coverage
bun test --coverage

# Run specific test file
bun test src/__tests__/validators.test.ts

# Watch mode
bun test --watch
```

**Documentation:**
- [Bun Test](https://bun.sh/docs/cli/test)

---

## 10. Documentation References

### Official Documentation Links

**Bun:**
- [Bun Installation](https://bun.sh/docs/installation)
- [Bun Runtime](https://bun.sh/docs/runtime)
- [Bun Package Manager](https://bun.sh/docs/cli/install)

**Hono:**
- [Hono Getting Started](https://hono.dev/docs/getting-started/basic)
- [Hono Routing](https://hono.dev/docs/api/routing)
- [Hono Middleware](https://hono.dev/docs/middleware/builtin)
- [Hono Validation](https://hono.dev/docs/guides/validation)

**Drizzle ORM:**
- [Drizzle Quick Start](https://orm.drizzle.team/docs/quick)
- [Drizzle Schema](https://orm.drizzle.team/docs/schema)
- [Drizzle Migrations](https://orm.drizzle.team/docs/migrations)
- [Drizzle Queries](https://orm.drizzle.team/docs/select)
- [Drizzle Relations](https://orm.drizzle.team/docs/relations)

**PostgreSQL:**
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)

**Docker:**
- [Docker Compose Documentation](https://docs.docker.com/compose/)

**better-auth:**
- [better-auth Getting Started](https://www.better-auth.com/docs/getting-started)
- [better-auth Configuration](https://www.better-auth.com/docs/configuration)
- [better-auth Drizzle Adapter](https://www.better-auth.com/docs/plugins/drizzle)
- [better-auth Hono Integration](https://www.better-auth.com/docs/integrations/hono)

**TypeScript:**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [TypeScript Configuration](https://www.typescriptlang.org/tsconfig)

**Security:**
- [OWASP API Security](https://owasp.org/API-Security/editions/2023/en/)
- [Mozilla Security Guidelines](https://wiki.mozilla.org/Security)

---

### Context7 MCP Usage Summary

During the creation of this skill pack, the following authoritative documentation was retrieved:

| Library | Documentation Source | Sections Used |
|---------|---------------------|---------------|
| **Drizzle ORM** | `/drizzle-team/drizzle-orm-docs` | Schema definition, migrations, database connection, TypeScript patterns |
| **Hono** | `/websites/hono_dev` | Middleware, CORS, validation, context extension, error handling |
| **better-auth** | `/better-auth/better-auth` | Hono integration, session management, auth middleware, protected routes |

All code examples and configuration patterns in this guide align with the official documentation retrieved via Context7 MCP.

---

### Additional Resources

**Performance:**
- [Bun Performance](https://bun.sh/benchmarks)
- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance-tips.html)

**Best Practices:**
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [TypeScript Best Practices](https://github.com/typescript-cheatsheets/react#reactjs-type-cheatsheet)

---

## Definition of Done

At the completion of this skill pack, you should be able to:

1. ✅ Run `docker compose up -d` and have PostgreSQL running
2. ✅ Run `bun run db:migrate` successfully
3. ✅ Start the Bun server with `bun run dev`
4. ✅ Register a new user via `/api/auth/sign-up`
5. ✅ Sign in and receive session authentication
6. ✅ Create, read, update, and delete tasks via authenticated routes
7. ✅ Follow clean folder structure with consistent naming conventions
8. ✅ Understand migration workflows and when to use them
9. ✅ Implement protected routes with better-auth middleware
10. ✅ Apply basic security headers and rate limiting

This guide provides the foundation for building production-ready REST APIs with the Bun + Hono + Drizzle ORM + PostgreSQL + better-auth stack.
