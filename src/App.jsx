import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [notes, setNotes] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) {
      fetchNotes(session.user.id)
    }
  }, [session])

  async function handleSignInWithGoogle() {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
    if (error) setError(error.message)
  }

  async function handleSignOut() {
    setError(null)
    const { error } = await supabase.auth.signOut()
    if (error) {
      setError(error.message)
    } else {
      setNotes([])
    }
  }

  async function fetchNotes(userId) {
    setLoading(true)
    const { data, error } = await supabase
      .from('notes')
      .select('id, content, created_at')
      .eq('user_id', userId)
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
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('notes')
      .insert({ content: trimmed, user_id: user.id })

    if (error) {
      setError(error.message)
    } else {
      setContent('')
      setError(null)
      await fetchNotes(session.user.id)
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-start justify-center py-16 px-4">
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-start justify-center py-16 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-800 mb-6">Notes</h1>
          <p className="text-sm text-slate-500 mb-6">Sign in to view and create your notes.</p>

          {error && (
            <p className="mb-4 text-sm text-red-600">{error}</p>
          )}

          <button
            onClick={handleSignInWithGoogle}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.94-2.91l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.1A12 12 0 0 0 12 24Z" />
              <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.27a12 12 0 0 0 0 10.78l4-3.1Z" />
              <path fill="#EA4335" d="M12 4.75c1.76 0 3.35.6 4.6 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.61l4 3.1C6.22 6.86 8.87 4.75 12 4.75Z" />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    )
  }

  const displayName = session.user.user_metadata?.full_name || session.user.email

  return (
    <div className="min-h-screen bg-slate-100 flex items-start justify-center py-16 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-start justify-between gap-3 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Notes</h1>
          <div className="text-right">
            <p className="text-xs text-slate-500 truncate max-w-[180px]">
              {displayName}
            </p>
            <button
              onClick={handleSignOut}
              className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

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
                  {displayName} &middot; {new Date(note.created_at).toLocaleString()}
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
