import { NextRequest, NextResponse } from 'next/server'
import { PGlite } from '@electric-sql/pglite'
import path from 'path'
import fs from 'fs'

const dataDir = path.join(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

let db: PGlite | null = null

async function getDb(): Promise<PGlite> {
  if (db) return db
  db = new PGlite(path.join(dataDir, 'notes.db'))
  await db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
  return db
}

export async function GET() {
  const database = await getDb()
  const result = await database.query<{ id: number; title: string; content: string; created_at: string }>(
    'SELECT * FROM notes ORDER BY created_at DESC'
  )
  return NextResponse.json({ notes: result.rows })
}

export async function POST(req: NextRequest) {
  const { title, content = '' } = await req.json()
  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })
  const database = await getDb()
  const result = await database.query<{ id: number; title: string; content: string; created_at: string }>(
    'INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING *',
    [title, content]
  )
  return NextResponse.json({ note: result.rows[0] }, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const { id, title, content = '' } = await req.json()
  if (!id || !title) return NextResponse.json({ error: 'ID and title required' }, { status: 400 })
  const database = await getDb()
  const result = await database.query<{ id: number; title: string; content: string; created_at: string }>(
    'UPDATE notes SET title = $1, content = $2 WHERE id = $3 RETURNING *',
    [title, content, id]
  )
  if (result.rows.length === 0) return NextResponse.json({ error: 'Note not found' }, { status: 404 })
  return NextResponse.json({ note: result.rows[0] })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
  const database = await getDb()
  await database.query('DELETE FROM notes WHERE id = $1', [id])
  return NextResponse.json({ success: true })
}
