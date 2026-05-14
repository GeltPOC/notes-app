import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import type { Note } from '@/lib/db'

export async function GET() {
  try {
    const db = await getDb()
    const result = await db.query<Note>('SELECT * FROM notes ORDER BY updated_at DESC')
    return NextResponse.json({ notes: result.rows })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error al obtener notas' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { title, content } = await request.json()
    if (!title?.trim()) {
      return NextResponse.json({ error: 'El título es obligatorio' }, { status: 400 })
    }
    const db = await getDb()
    const result = await db.query<Note>(
      'INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING *',
      [title.trim(), (content ?? '').trim()]
    )
    return NextResponse.json({ note: result.rows[0] }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error al crear nota' }, { status: 500 })
  }
}
