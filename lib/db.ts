import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Conexão direta ao PostgreSQL do Supabase via wire protocol (mais rápido que REST/PostgREST)
// DATABASE_URL: supabase.com → Project Settings → Database → Connection string → URI (Transaction pooler, porta 6543)
const client = postgres(process.env.DATABASE_URL!, {
  prepare: false, // obrigatório para PgBouncer em transaction mode
  max: 1,         // serverless: 1 conexão por invocação
})

export const db = drizzle(client, { schema })
