import { PGlite } from '@electric-sql/pglite'
import path from 'path'
import fs from 'fs'

let db: PGlite | null = null

export async function getDb(): Promise<PGlite> {
  if (db) return db

  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  db = new PGlite(path.join(dataDir, 'notes.db'))

  await db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  return db
}

export interface Note {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
}
