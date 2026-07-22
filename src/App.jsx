import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeSanitize from 'rehype-sanitize'
import { supabase } from './supabaseClient'

const markdownComponents = {
  h1: (props) => <h1 className="mb-1 mt-2 text-lg font-semibold text-slate-800 first:mt-0 dark:text-slate-100" {...props} />,
  h2: (props) => <h2 className="mb-1 mt-2 text-base font-semibold text-slate-800 first:mt-0 dark:text-slate-100" {...props} />,
  h3: (props) => <h3 className="mb-1 mt-2 text-sm font-semibold text-slate-800 first:mt-0 dark:text-slate-100" {...props} />,
  p: (props) => <p className="mb-1 text-slate-800 last:mb-0 dark:text-slate-100" {...props} />,
  ul: (props) => <ul className="mb-1 list-disc space-y-0.5 pl-5 last:mb-0" {...props} />,
  ol: (props) => <ol className="mb-1 list-decimal space-y-0.5 pl-5 last:mb-0" {...props} />,
  li: (props) => <li className="text-slate-800 dark:text-slate-100" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="mb-1 border-l-2 border-slate-300 pl-3 italic text-slate-500 last:mb-0 dark:border-slate-600 dark:text-slate-400"
      {...props}
    />
  ),
  strong: (props) => <strong className="font-semibold text-slate-900 dark:text-white" {...props} />,
  em: (props) => <em className="italic" {...props} />,
  code: (props) => <code className="rounded bg-slate-200 px-1 py-0.5 text-xs dark:bg-slate-700 dark:text-slate-100" {...props} />,
  a: (props) => (
    <a
      className="text-emerald-600 underline hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
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
        className={`w-full min-h-[4.5rem] resize-none overflow-hidden rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 ${textareaClassName}`}
      />
      <div className="min-h-[4.5rem] overflow-auto rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/60">
        {value.trim() ? <Markdown>{value}</Markdown> : <p className="text-sm text-slate-400 dark:text-slate-500">Preview</p>}
      </div>
    </div>
  )
}

const TAG_COLORS = [
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  'bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300',
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
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-300 px-2 py-1.5 focus-within:ring-2 focus-within:ring-emerald-400 dark:border-slate-600">
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
        className="min-w-[6rem] flex-1 border-none bg-transparent p-0.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0 dark:text-slate-100 dark:placeholder-slate-500"
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

function PinIcon({ className = 'h-4 w-4', filled = false }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
      />
    </svg>
  )
}

function ImageAttachment({ imageUrl, uploading, onSelectFile, onRemove, inputId }) {
  return (
    <div className="mt-3">
      {imageUrl ? (
        <div className="relative inline-block">
          <img src={imageUrl} alt="" className="max-h-32 rounded-lg border border-slate-200 dark:border-slate-700" />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/60 dark:bg-slate-900/60">
              <Spinner className="h-5 w-5 text-slate-500 dark:text-slate-300" />
            </div>
          )}
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove image"
            className="absolute -right-2 -top-2 rounded-full bg-slate-800 p-1 text-xs text-white hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            &times;
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          {uploading && <Spinner className="h-4 w-4" />}
          {uploading ? 'Uploading...' : 'Add image'}
        </label>
      )}
      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={onSelectFile}
        disabled={uploading}
        className="hidden"
      />
    </div>
  )
}

function ShareIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.933 2.185 2.25 2.25 0 00-3.933-2.185zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
      />
    </svg>
  )
}

function EmptyNotesIcon() {
  return (
    <svg className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h4M13.5 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V7.5L13.5 3z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 3V7.5H18" />
    </svg>
  )
}

function SunIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v1.5m0 15V21m9-9h-1.5M4.5 12H3m15.364 6.364-1.06-1.06M6.696 6.696 5.636 5.636m12.728 0-1.06 1.06M6.696 17.304l-1.06 1.06M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0Z"
      />
    </svg>
  )
}

function MoonIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998Z"
      />
    </svg>
  )
}

function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="fixed right-4 top-4 z-40 rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-md hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
    >
      {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </button>
  )
}

function getInitialTheme() {
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function App() {
  const [theme, setTheme] = useState(getInitialTheme)
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [notes, setNotes] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [tags, setTags] = useState([])
  const [imageUrl, setImageUrl] = useState(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState(null)
  const [sortOption, setSortOption] = useState('newest')
  const [pinningId, setPinningId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [editTags, setEditTags] = useState([])
  const [editImageUrl, setEditImageUrl] = useState(null)
  const [editImageUploading, setEditImageUploading] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [shareModalNote, setShareModalNote] = useState(null)
  const [shareEmail, setShareEmail] = useState('')
  const [sharing, setSharing] = useState(false)
  const [shareError, setShareError] = useState(null)
  const [revokingShareId, setRevokingShareId] = useState(null)
  const [toast, setToast] = useState(null)
  const textareaRef = useRef(null)
  const editTextareaRef = useRef(null)
  const toastTimeoutRef = useRef(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

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
      fetchNotes()
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

  useEffect(() => {
    if (!shareModalNote) return
    function onKeyDown(e) {
      if (e.key === 'Escape') handleShareClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [shareModalNote])

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  function showToast(message) {
    setToast(message)
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => setToast(null), 2500)
  }

  async function uploadImage(file) {
    const { data: { user } } = await supabase.auth.getUser()
    const path = `${user.id}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage.from('notes-images').upload(path, file)
    if (uploadError) throw uploadError
    const { data } = supabase.storage.from('notes-images').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleImageSelect(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setImageUploading(true)
    try {
      setImageUrl(await uploadImage(file))
      setError(null)
    } catch (err) {
      setError(err.message)
    }
    setImageUploading(false)
  }

  async function handleEditImageSelect(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setEditImageUploading(true)
    try {
      setEditImageUrl(await uploadImage(file))
      setError(null)
    } catch (err) {
      setError(err.message)
    }
    setEditImageUploading(false)
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

  async function fetchNotes() {
    setLoading(true)
    const { data, error } = await supabase
      .from('notes')
      .select('id, content, tags, pinned, image_url, created_at, user_id, note_shares(id, shared_with_email)')
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
      .insert({ content: trimmed, user_id: user.id, tags, image_url: imageUrl })

    if (error) {
      setError(error.message)
    } else {
      setContent('')
      setTags([])
      setImageUrl(null)
      setError(null)
      await fetchNotes()
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

  async function handleTogglePin(note) {
    setPinningId(note.id)
    const { error } = await supabase.from('notes').update({ pinned: !note.pinned }).eq('id', note.id)

    if (error) {
      setError(error.message)
    } else {
      setError(null)
      setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, pinned: !n.pinned } : n)))
    }
    setPinningId(null)
  }

  function handleShareOpen(note) {
    setShareModalNote(note)
    setShareEmail('')
    setShareError(null)
  }

  function handleShareClose() {
    setShareModalNote(null)
    setShareEmail('')
    setShareError(null)
  }

  async function handleShareSubmit() {
    const email = shareEmail.trim().toLowerCase()
    if (!email) return

    setSharing(true)
    setShareError(null)

    const { data: userId, error: lookupError } = await supabase.rpc('find_user_id_by_email', {
      lookup_email: email,
    })

    if (lookupError) {
      setShareError(lookupError.message)
      setSharing(false)
      return
    }

    if (!userId) {
      setShareError('No user found with that email.')
      setSharing(false)
      return
    }

    const { data: inserted, error: insertError } = await supabase
      .from('note_shares')
      .insert({ note_id: shareModalNote.id, shared_with_email: email, shared_with_user_id: userId })
      .select('id, shared_with_email')
      .single()

    if (insertError) {
      setShareError(insertError.code === '23505' ? 'Already shared with this email.' : insertError.message)
    } else {
      setNotes((prev) =>
        prev.map((n) => (n.id === shareModalNote.id ? { ...n, note_shares: [...n.note_shares, inserted] } : n))
      )
      setShareModalNote((prev) => ({ ...prev, note_shares: [...prev.note_shares, inserted] }))
      setShareEmail('')
      showToast('Note shared')
    }
    setSharing(false)
  }

  async function handleRevokeShare(shareId, noteId) {
    setRevokingShareId(shareId)
    const { error: revokeError } = await supabase.from('note_shares').delete().eq('id', shareId)

    if (revokeError) {
      setShareError(revokeError.message)
    } else {
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, note_shares: n.note_shares.filter((s) => s.id !== shareId) } : n))
      )
      setShareModalNote((prev) =>
        prev ? { ...prev, note_shares: prev.note_shares.filter((s) => s.id !== shareId) } : prev
      )
      showToast('Share revoked')
    }
    setRevokingShareId(null)
  }

  function handleShareKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleShareSubmit()
    }
  }

  function handleEditStart(note) {
    setEditingId(note.id)
    setEditContent(note.content)
    setEditTags(note.tags || [])
    setEditImageUrl(note.image_url || null)
  }

  function handleEditCancel() {
    setEditingId(null)
    setEditContent('')
    setEditTags([])
    setEditImageUrl(null)
  }

  async function handleEditSave(id) {
    const trimmed = editContent.trim()
    if (!trimmed) return

    setEditSaving(true)
    const { error } = await supabase
      .from('notes')
      .update({ content: trimmed, tags: editTags, image_url: editImageUrl })
      .eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      setError(null)
      setNotes((prev) =>
        prev.map((note) => (note.id === id ? { ...note, content: trimmed, tags: editTags, image_url: editImageUrl } : note))
      )
      setEditingId(null)
      setEditContent('')
      setEditTags([])
      setEditImageUrl(null)
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
      <div className="min-h-screen bg-slate-100 flex items-start justify-center py-16 px-4 dark:bg-slate-900">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <p className="text-sm text-slate-400 dark:text-slate-500">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-start justify-center py-16 px-4 dark:bg-slate-900">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 text-center dark:bg-slate-800">
          <h1 className="text-2xl font-semibold text-slate-800 mb-6 dark:text-slate-100">Notes</h1>
          <p className="text-sm text-slate-500 mb-6 dark:text-slate-400">Sign in to view and create your notes.</p>

          {error && (
            <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <button
            onClick={handleSignInWithGoogle}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 transition-colors dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
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
  const myNotes = notes.filter((note) => note.user_id === session.user.id)
  const sharedNotes = notes.filter((note) => note.user_id !== session.user.id)
  const trimmedQuery = searchQuery.trim().toLowerCase()
  const allTags = [...new Set(myNotes.flatMap((note) => note.tags || []))].sort()
  const filteredNotes = myNotes
    .filter((note) => !trimmedQuery || note.content.toLowerCase().includes(trimmedQuery))
    .filter((note) => !selectedTag || (note.tags || []).includes(selectedTag))
  const hasActiveFilter = Boolean(trimmedQuery || selectedTag)

  function sortGroup(group) {
    const sorted = [...group]
    if (sortOption === 'oldest') {
      sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    } else if (sortOption === 'alpha') {
      sorted.sort((a, b) => a.content.localeCompare(b.content))
    } else {
      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }
    return sorted
  }

  const orderedNotes = [
    ...sortGroup(filteredNotes.filter((note) => note.pinned)),
    ...sortGroup(filteredNotes.filter((note) => !note.pinned)),
  ]

  return (
    <div className="min-h-screen bg-slate-100 flex items-start justify-center py-16 px-4 dark:bg-slate-900">
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md p-6 dark:bg-slate-800">
        <div className="flex items-start justify-between gap-3 mb-6">
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Notes</h1>
          <div className="text-right">
            <p className="text-xs text-slate-500 truncate max-w-[180px] dark:text-slate-400">
              {displayName}
            </p>
            <button
              onClick={handleSignOut}
              className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors dark:text-slate-500 dark:hover:text-slate-300"
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
          <ImageAttachment
            imageUrl={imageUrl}
            uploading={imageUploading}
            onSelectFile={handleImageSelect}
            onRemove={() => setImageUrl(null)}
            inputId="new-note-image"
          />
          <div className="mt-2 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving || imageUploading || !content.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving && <Spinner className="h-4 w-4" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {!loading && myNotes.length > 0 && (
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
            />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="alpha">Alphabetical</option>
            </select>
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
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-400 dark:text-slate-500">
            <Spinner className="h-4 w-4" />
            Loading notes...
          </div>
        ) : myNotes.length === 0 ? (
          <div className="py-8 text-center">
            <EmptyNotesIcon />
            <p className="mt-3 text-sm text-slate-400 dark:text-slate-500">No notes yet — write your first one above.</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">
            {hasActiveFilter ? 'No notes match your filters.' : 'No notes yet.'}
          </p>
        ) : (
          <ul className="space-y-3">
            {orderedNotes.map((note) => (
              <li
                key={note.id}
                className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
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
                    <ImageAttachment
                      imageUrl={editImageUrl}
                      uploading={editImageUploading}
                      onSelectFile={handleEditImageSelect}
                      onRemove={() => setEditImageUrl(null)}
                      inputId={`edit-note-image-${note.id}`}
                    />
                    <div className="mt-2 flex justify-end gap-3">
                      <button
                        onClick={handleEditCancel}
                        className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors dark:text-slate-500 dark:hover:text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEditSave(note.id)}
                        disabled={editSaving || editImageUploading || !editContent.trim()}
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
                        {note.image_url && (
                          <a href={note.image_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block">
                            <img
                              src={note.image_url}
                              alt=""
                              className="max-h-[200px] rounded-lg border border-slate-200 dark:border-slate-700"
                            />
                          </a>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          onClick={() => handleShareOpen(note)}
                          aria-label="Share note"
                          className="text-slate-400 hover:text-slate-600 transition-colors dark:text-slate-500 dark:hover:text-slate-300"
                        >
                          <ShareIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleTogglePin(note)}
                          disabled={pinningId === note.id}
                          aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
                          className={`disabled:opacity-50 transition-colors ${
                            note.pinned
                              ? 'text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300'
                              : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                          }`}
                        >
                          {pinningId === note.id ? <Spinner className="h-4 w-4" /> : <PinIcon className="h-4 w-4" filled={note.pinned} />}
                        </button>
                        <button
                          onClick={() => handleEditStart(note)}
                          aria-label="Edit note"
                          className="text-slate-400 hover:text-slate-600 transition-colors dark:text-slate-500 dark:hover:text-slate-300"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(note.id)}
                          aria-label="Delete note"
                          className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      {displayName} &middot; {new Date(note.created_at).toLocaleString()}
                    </p>
                    {note.note_shares?.length > 0 && (
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        Shared with: {note.note_shares.map((s) => s.shared_with_email).join(', ')}
                      </p>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        {sharedNotes.length > 0 && (
          <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-700">
            <h2 className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Shared with me</h2>
            <ul className="space-y-3">
              {sharedNotes.map((note) => (
                <li
                  key={note.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/40"
                >
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
                  {note.image_url && (
                    <a href={note.image_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block">
                      <img
                        src={note.image_url}
                        alt=""
                        className="max-h-[200px] rounded-lg border border-slate-200 dark:border-slate-700"
                      />
                    </a>
                  )}
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    {new Date(note.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {confirmDeleteId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-slate-700 dark:text-slate-200">Delete this note? This can&apos;t be undone.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors dark:text-slate-400 dark:hover:text-slate-200"
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

      {shareModalNote && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          onClick={handleShareClose}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">Share note</h2>

            {shareModalNote.note_shares?.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-1.5">
                {shareModalNote.note_shares.map((share) => (
                  <span
                    key={share.id}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  >
                    {share.shared_with_email}
                    <button
                      type="button"
                      onClick={() => handleRevokeShare(share.id, shareModalNote.id)}
                      disabled={revokingShareId === share.id}
                      aria-label={`Revoke access for ${share.shared_with_email}`}
                      className="hover:opacity-70 disabled:opacity-50"
                    >
                      {revokingShareId === share.id ? <Spinner className="h-3 w-3" /> : <>&times;</>}
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                onKeyDown={handleShareKeyDown}
                placeholder="Enter email address"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500"
              />
              <button
                onClick={handleShareSubmit}
                disabled={sharing || !shareEmail.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sharing && <Spinner className="h-3.5 w-3.5" />}
                Share
              </button>
            </div>

            {shareError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{shareError}</p>}

            <div className="mt-5 flex justify-end">
              <button
                onClick={handleShareClose}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors dark:text-slate-400 dark:hover:text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed inset-x-0 bottom-6 flex justify-center px-4">
          <div className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white shadow-lg dark:bg-slate-700">
            {toast}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
