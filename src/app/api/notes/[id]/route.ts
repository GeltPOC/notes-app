import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import type { Note } from '@/lib/db'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params
    const db = await getDb()
    const result = await db.query<Note>('SELECT * FROM notes WHERE id = $1', [parseInt(id, 10)])
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 })
    }
    return NextResponse.json({ note: result.rows[0] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error al obtener nota' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const { title, content } = await request.json()
    if (!title?.trim()) {
      return NextResponse.json({ error: 'El título es obligatorio' }, { status: 400 })
    }
    const db = await getDb()
    const result = await db.query<Note>(
      'UPDATE notes SET title = $1, content = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [title.trim(), (content ?? '').trim(), parseInt(id, 10)]
    )
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 })
    }
    return NextResponse.json({ note: result.rows[0] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error al actualizar nota' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params
    const db = await getDb()
    await db.query('DELETE FROM notes WHERE id = $1', [parseInt(id, 10)])
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error al eliminar nota' }, { status: 500 })
  }
}
