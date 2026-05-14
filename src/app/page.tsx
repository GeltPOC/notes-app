'use client'

import { useEffect, useState } from 'react'

const basePath = '/notes-app'

type Note = {
  id: number
  title: string
  content: string
  created_at: string
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)

  const fetchNotes = async () => {
    const res = await fetch(`${basePath}/api/notes`)
    const data = await res.json()
    setNotes(data.notes || [])
  }

  useEffect(() => { fetchNotes() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    if (editId !== null) {
      await fetch(`${basePath}/api/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editId, title, content }),
      })
      setEditId(null)
    } else {
      await fetch(`${basePath}/api/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })
    }
    setTitle('')
    setContent('')
    setLoading(false)
    fetchNotes()
  }

  const handleDelete = async (id: number) => {
    await fetch(`${basePath}/api/notes`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchNotes()
  }

  const handleEdit = (note: Note) => {
    setEditId(note.id)
    setTitle(note.title)
    setContent(note.content)
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">📝 Notes App</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 mb-8 space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">{editId !== null ? 'Edit Note' : 'New Note'}</h2>
          <input
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <textarea
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            placeholder="Content (optional)"
            rows={3}
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : editId !== null ? 'Update' : 'Add Note'}
            </button>
            {editId !== null && (
              <button
                type="button"
                onClick={() => { setEditId(null); setTitle(''); setContent('') }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-6 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        <div className="space-y-4">
          {notes.length === 0 && (
            <p className="text-center text-gray-400">No notes yet. Create your first one!</p>
          )}
          {notes.map(note => (
            <div key={note.id} className="bg-white rounded-2xl shadow p-5 flex justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 text-lg">{note.title}</h3>
                {note.content && <p className="text-gray-500 mt-1 whitespace-pre-wrap">{note.content}</p>}
                <p className="text-xs text-gray-300 mt-2">{new Date(note.created_at).toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleEdit(note)}
                  className="text-blue-400 hover:text-blue-600 text-sm font-medium"
                >Edit</button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="text-red-400 hover:text-red-600 text-sm font-medium"
                >Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
