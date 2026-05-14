'use client'

import { useState, useEffect, useCallback } from 'react'

const basePath = '/notes-app'

interface Note {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch(`${basePath}/api/notes`)
      const data = await res.json()
      setNotes(data.notes || [])
    } catch (e) {
      console.error('Failed to fetch notes', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note)
    setTitle(note.title)
    setContent(note.content)
  }

  const handleNewNote = () => {
    setSelectedNote(null)
    setTitle('')
    setContent('')
  }

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      if (selectedNote) {
        const res = await fetch(`${basePath}/api/notes`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedNote.id, title, content })
        })
        const data = await res.json()
        setSelectedNote(data.note)
        setNotes(prev => prev.map(n => n.id === data.note.id ? data.note : n))
      } else {
        const res = await fetch(`${basePath}/api/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content })
        })
        const data = await res.json()
        setNotes(prev => [data.note, ...prev])
        setSelectedNote(data.note)
      }
    } catch (e) {
      console.error('Failed to save note', e)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await fetch(`${basePath}/api/notes`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      setNotes(prev => prev.filter(n => n.id !== id))
      if (selectedNote?.id === id) {
        setSelectedNote(null)
        setTitle('')
        setContent('')
      }
    } catch (e) {
      console.error('Failed to delete note', e)
    }
  }

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800 mb-3">📝 Notes</h1>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="p-3">
          <button
            onClick={handleNewNote}
            className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            + New Note
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-400 text-sm">Loading...</div>
          ) : filteredNotes.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">
              {searchQuery ? 'No results found' : 'No notes yet. Create one!'}
            </div>
          ) : (
            filteredNotes.map(note => (
              <div
                key={note.id}
                onClick={() => handleSelectNote(note)}
                className={`p-3 mx-2 mb-1 rounded-lg cursor-pointer group ${
                  selectedNote?.id === note.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{note.title}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{note.content || 'No content'}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(note.updated_at)}</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(note.id) }}
                    className="ml-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {selectedNote === null && title === '' && content === '' ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-xl font-medium">Select a note or create a new one</p>
              <p className="text-sm mt-1">Your notes are saved locally</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-3">
              <input
                type="text"
                placeholder="Note title..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="flex-1 text-lg font-semibold border-none outline-none text-gray-800 placeholder-gray-400"
              />
              <button
                onClick={handleSave}
                disabled={saving || !title.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              {selectedNote && (
                <button
                  onClick={() => handleDelete(selectedNote.id)}
                  className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
            <textarea
              placeholder="Start writing..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="flex-1 p-6 text-gray-700 text-sm leading-relaxed resize-none outline-none bg-white"
            />
            {selectedNote && (
              <div className="px-6 py-2 border-t border-gray-100 bg-white text-xs text-gray-400">
                Created: {formatDate(selectedNote.created_at)} · Updated: {formatDate(selectedNote.updated_at)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
