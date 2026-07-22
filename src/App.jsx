import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeSanitize from 'rehype-sanitize'
import { supabase } from './supabaseClient'

const markdownComponents = {
  h1: (props) => <h1 className="mb-1 mt-2 text-lg font-semibold text-slate-800 first:mt-0" {...props} />,
  h2: (props) => <h2 className="mb-1 mt-2 text-base font-semibold text-slate-800 first:mt-0" {...props} />,
  h3: (props) => <h3 className="mb-1 mt-2 text-sm font-semibold text-slate-800 first:mt-0" {...props} />,
  p: (props) => <p className="mb-1 text-slate-800 last:mb-0" {...props} />,
  ul: (props) => <ul className="mb-1 list-disc space-y-0.5 pl-5 last:mb-0" {...props} />,
  ol: (props) => <ol className="mb-1 list-decimal space-y-0.5 pl-5 last:mb-0" {...props} />,
  li: (props) => <li className="text-slate-800" {...props} />,
  blockquote: (props) => (
    <blockquote className="mb-1 border-l-2 border-slate-300 pl-3 italic text-slate-500 last:mb-0" {...props} />
  ),
  strong: (props) => <strong className="font-semibold text-slate-900" {...props} />,
  em: (props) => <em className="italic" {...props} />,
  code: (props) => <code className="rounded bg-slate-200 px-1 py-0.5 text-xs" {...props} />,
  a: (props) => (
    <a className="text-emerald-600 underline hover:text-emerald-700" target="_blank" rel="noopener noreferrer" {...props} />
  ),
}

function Markdown({ children }) {
  return (
    <div className="text-sm leading-normal">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeSanitize]}
        components={markdownComponents}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}

function MarkdownSplitEditor({ value, onChange, onKeyDown, placeholder, rows, textareaRef, autoFocus, textareaClassName = '' }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        rows={rows}
        autoFocus={autoFocus}
        className={`w-full min-h-[4.5rem] resize-none overflow-hidden rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${textareaClassName}`}
      />
      <div className="min-h-[4.5rem] overflow-auto rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        {value.trim() ? <Markdown>{value}</Markdown> : <p className="text-sm text-slate-400">Preview</p>}
      </div>
    </div>
  )
}

const TAG_COLORS = [
  'bg-emerald-100 text-emerald-700',
  'bg-blue-100 text-blue-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-purple-100 text-purple-700',
  'bg-cyan-100 text-cyan-700',
  'bg-pink-100 text-pink-700',
  'bg-lime-100 text-lime-700',
]

function tagColorClasses(tag) {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) | 0
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}

function TagInput({ tags, onChange, placeholder = 'Add a tag...' }) {
  const [inputValue, setInputValue] = useState('')

  function addTag(raw) {
    const tag = raw.trim()
    if (!tag || tags.includes(tag)) {
      setInputValue('')
      return
    }
    onChange([...tags, tag])
    setInputValue('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-300 px-2 py-1.5 focus-within:ring-2 focus-within:ring-emerald-400">
      {tags.map((tag) => (
        <span
          key={tag}
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${tagColorClasses(tag)}`}
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter((t) => t !== tag))}
            aria-label={`Remove tag ${tag}`}
            className="hover:opacity-70"
          >
            &times;
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(inputValue)}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="min-w-[6rem] flex-1 border-none p-0.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0"
      />
    </div>
  )
}

function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

function PencilIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
      />
    </svg>
  )
}

function EmptyNotesIcon() {
  return (
    <svg className="mx-auto h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h4M13.5 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V7.5L13.5 3z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 3V7.5H18" />
    </svg>
  )
}

function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [notes, setNotes] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [tags, setTags] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [editTags, setEditTags] = useState([])
  const [editSaving, setEditSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [toast, setToast] = useState(null)
  const textareaRef = useRef(null)
  const editTextareaRef = useRef(null)
  const toastTimeoutRef = useRef(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = ''
    el.style.height = `${el.scrollHeight}px`
  }, [content])

  useEffect(() => {
    const el = editTextareaRef.current
    if (!el) return
    el.style.height = ''
    el.style.height = `${el.scrollHeight}px`
  }, [editContent])

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

  useEffect(() => {
    if (confirmDeleteId === null) return
    function onKeyDown(e) {
      if (e.key === 'Escape') setConfirmDeleteId(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [confirmDeleteId])

  function showToast(message) {
    setToast(message)
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => setToast(null), 2500)
  }

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
      .select('id, content, tags, created_at')
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
      .insert({ content: trimmed, user_id: user.id, tags })

    if (error) {
      setError(error.message)
    } else {
      setContent('')
      setTags([])
      setError(null)
      await fetchNotes(session.user.id)
      showToast('Note saved')
    }
    setSaving(false)
  }

  async function handleDeleteConfirmed() {
    const id = confirmDeleteId

    setDeletingId(id)
    const { error } = await supabase.from('notes').delete().eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      setError(null)
      setNotes((prev) => prev.filter((note) => note.id !== id))
      showToast('Note deleted')
    }
    setDeletingId(null)
    setConfirmDeleteId(null)
  }

  function handleEditStart(note) {
    setEditingId(note.id)
    setEditContent(note.content)
    setEditTags(note.tags || [])
  }

  function handleEditCancel() {
    setEditingId(null)
    setEditContent('')
    setEditTags([])
  }

  async function handleEditSave(id) {
    const trimmed = editContent.trim()
    if (!trimmed) return

    setEditSaving(true)
    const { error } = await supabase.from('notes').update({ content: trimmed, tags: editTags }).eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      setError(null)
      setNotes((prev) => prev.map((note) => (note.id === id ? { ...note, content: trimmed, tags: editTags } : note)))
      setEditingId(null)
      setEditContent('')
      setEditTags([])
      showToast('Note updated')
    }
    setEditSaving(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSave()
    }
  }

  function handleEditKeyDown(e, id) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleEditSave(id)
    } else if (e.key === 'Escape') {
      handleEditCancel()
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
  const trimmedQuery = searchQuery.trim().toLowerCase()
  const allTags = [...new Set(notes.flatMap((note) => note.tags || []))].sort()
  const filteredNotes = notes
    .filter((note) => !trimmedQuery || note.content.toLowerCase().includes(trimmedQuery))
    .filter((note) => !selectedTag || (note.tags || []).includes(selectedTag))
  const hasActiveFilter = Boolean(trimmedQuery || selectedTag)

  return (
    <div className="min-h-screen bg-slate-100 flex items-start justify-center py-16 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md p-6">
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

        <div className="mb-6">
          <MarkdownSplitEditor
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a note in Markdown... (Ctrl+Enter to save)"
            rows={3}
            textareaRef={textareaRef}
          />
          <div className="mt-3">
            <TagInput tags={tags} onChange={setTags} placeholder="Add tags (press Enter or comma)" />
          </div>
          <div className="mt-2 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving || !content.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving && <Spinner className="h-4 w-4" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-600">{error}</p>
        )}

        {!loading && notes.length > 0 && (
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        )}

        {!loading && allTags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag((prev) => (prev === tag ? null : tag))}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-emerald-500 text-white'
                    : `${tagColorClasses(tag)} hover:opacity-80`
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-400">
            <Spinner className="h-4 w-4" />
            Loading notes...
          </div>
        ) : notes.length === 0 ? (
          <div className="py-8 text-center">
            <EmptyNotesIcon />
            <p className="mt-3 text-sm text-slate-400">No notes yet — write your first one above.</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            {hasActiveFilter ? 'No notes match your filters.' : 'No notes yet.'}
          </p>
        ) : (
          <ul className="space-y-3">
            {filteredNotes.map((note) => (
              <li
                key={note.id}
                className="rounded-lg border border-slate-200 px-3 py-2"
              >
                {editingId === note.id ? (
                  <div>
                    <MarkdownSplitEditor
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyDown={(e) => handleEditKeyDown(e, note.id)}
                      rows={2}
                      textareaRef={editTextareaRef}
                      autoFocus
                      textareaClassName="text-sm px-2 py-1.5"
                    />
                    <div className="mt-2">
                      <TagInput tags={editTags} onChange={setEditTags} placeholder="Add tags" />
                    </div>
                    <div className="mt-2 flex justify-end gap-3">
                      <button
                        onClick={handleEditCancel}
                        className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEditSave(note.id)}
                        disabled={editSaving || !editContent.trim()}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {editSaving && <Spinner className="h-3 w-3" />}
                        {editSaving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 break-words">
                        <Markdown>{note.content}</Markdown>
                        {note.tags?.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {note.tags.map((tag) => (
                              <span
                                key={tag}
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${tagColorClasses(tag)}`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          onClick={() => handleEditStart(note)}
                          aria-label="Edit note"
                          className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(note.id)}
                          aria-label="Delete note"
                          className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {displayName} &middot; {new Date(note.created_at).toLocaleString()}
                    </p>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {confirmDeleteId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-slate-700">Delete this note? This can&apos;t be undone.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                disabled={deletingId === confirmDeleteId}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deletingId === confirmDeleteId && <Spinner className="h-3.5 w-3.5" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed inset-x-0 bottom-6 flex justify-center px-4">
          <div className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
