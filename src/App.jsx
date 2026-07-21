import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [notes, setNotes] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchNotes()
  }, [])

  async function fetchNotes() {
    setLoading(true)
    const { data, error } = await supabase
      .from('notes')
      .select('id, content, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setNotes(data)
      setError(null)
    }
    setLoading(false)
  }

  async function handleSave() {
    const trimmed = content.trim()
    if (!trimmed) return

    setSaving(true)
    const { error } = await supabase.from('notes').insert({ content: trimmed })

    if (error) {
      setError(error.message)
    } else {
      setContent('')
      setError(null)
      await fetchNotes()
    }
    setSaving(false)
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this note?')) return

    const { error } = await supabase.from('notes').delete().eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      setError(null)
      setNotes((prev) => prev.filter((note) => note.id !== id))
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      handleSave()
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-start justify-center py-16 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-semibold text-slate-800 mb-6">Notes</h1>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a note..."
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <button
            onClick={handleSave}
            disabled={saving || !content.trim()}
            className="rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-600">{error}</p>
        )}

        {loading ? (
          <p className="text-sm text-slate-400">Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-slate-400">No notes yet.</p>
        ) : (
          <ul className="space-y-3">
            {notes.map((note) => (
              <li
                key={note.id}
                className="rounded-lg border border-slate-200 px-3 py-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-slate-800 whitespace-pre-wrap break-words">
                    {note.content}
                  </p>
                  <button
                    onClick={() => handleDelete(note.id)}
                    aria-label="Delete note"
                    className="shrink-0 text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(note.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default App
