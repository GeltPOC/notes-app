'use client'

import { useEffect, useState, useCallback } from 'react'

const BASE = '/notes-app'

interface Note {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
}

type Mode = 'list' | 'create' | 'edit'

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [mode, setMode] = useState<Mode>('list')
  const [selected, setSelected] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/api/notes`)
      const data = await res.json()
      setNotes(data.notes ?? [])
    } catch {
      setError('Error al cargar las notas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  function openCreate() {
    setTitle('')
    setContent('')
    setSelected(null)
    setError('')
    setMode('create')
  }

  function openEdit(note: Note) {
    setTitle(note.title)
    setContent(note.content)
    setSelected(note)
    setError('')
    setMode('edit')
  }

  function cancelForm() {
    setMode('list')
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('El título es obligatorio'); return }
    setLoading(true)
    setError('')
    try {
      if (mode === 'create') {
        const res = await fetch(`${BASE}/api/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: title.trim(), content: content.trim() })
        })
        if (!res.ok) throw new Error('Error al crear')
      } else if (mode === 'edit' && selected) {
        const res = await fetch(`${BASE}/api/notes/${selected.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: title.trim(), content: content.trim() })
        })
        if (!res.ok) throw new Error('Error al editar')
      }
      setMode('list')
      await fetchNotes()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: number) {
    setLoading(true)
    try {
      await fetch(`${BASE}/api/notes/${id}`, { method: 'DELETE' })
      setDeleteId(null)
      await fetchNotes()
    } catch {
      setError('Error al eliminar')
    } finally {
      setLoading(false)
    }
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })
    } catch {
      return iso
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Mis Notas</h1>
          </div>
          {mode === 'list' && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva nota
            </button>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* FORM (create / edit) */}
        {(mode === 'create' || mode === 'edit') && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">
              {mode === 'create' ? 'Nueva nota' : 'Editar nota'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Título de la nota"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Escribe el contenido de tu nota..."
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {loading ? 'Guardando...' : mode === 'create' ? 'Crear nota' : 'Guardar cambios'}
                </button>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* LIST */}
        {mode === 'list' && (
          <div>
            {loading && notes.length === 0 && (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {!loading && notes.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">No tienes notas todavía.</p>
                <p className="text-gray-400 text-xs mt-1">Pulsa «Nueva nota» para empezar.</p>
              </div>
            )}
            {notes.length > 0 && (
              <div className="space-y-4">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{notes.length} nota{notes.length !== 1 ? 's' : ''}</p>
                {notes.map(note => (
                  <div key={note.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{note.title}</h3>
                        {note.content && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-3 whitespace-pre-wrap">{note.content}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-3">
                          Actualizada: {formatDate(note.updated_at)}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => openEdit(note)}
                          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteId(note.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Delete modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Eliminar nota?</h3>
            <p className="text-sm text-gray-500 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={loading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {loading ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
