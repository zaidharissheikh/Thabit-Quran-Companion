import { useEffect, useState } from 'react'

/**
 * Simple modal for writing a journal entry (free or verse-linked).
 */
export default function JournalComposeModal({
  open,
  title = 'Add to journal',
  subtitle = '',
  verseHint = '',
  onClose,
  onSave,
}) {
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setText('')
      setSaving(false)
    }
  }, [open])

  if (!open) return null

  async function handleSave() {
    const trimmed = text.trim()
    if (!trimmed || saving) return
    setSaving(true)
    try {
      await onSave(trimmed)
      setText('')
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-2xl bg-[#f9f7f2] text-[#004d40] shadow-2xl border border-[#e9c349]/40 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="journal-compose-title"
      >
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-[#004d40]/10">
          <div>
            <h2 id="journal-compose-title" className="font-headline text-xl font-semibold text-[#004d40]">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-sm text-[#004d40]/70 font-manrope">{subtitle}</p>
            ) : null}
            {verseHint ? (
              <p className="mt-2 text-xs font-manrope font-semibold uppercase tracking-wider text-[#8e6e33]">
                {verseHint}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#004d40]/50 hover:bg-[#004d40]/10"
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="px-5 py-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            autoFocus
            placeholder="Write your reflection…"
            className="w-full resize-none rounded-xl border border-[#004d40]/15 bg-white px-4 py-3 text-sm text-[#004d40] outline-none focus:border-[#c5a059] font-manrope"
          />
        </div>

        <div className="px-5 pb-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-[#004d40]/60 hover:text-[#004d40]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!text.trim() || saving}
            onClick={handleSave}
            className="px-5 py-2.5 rounded-full text-sm font-bold text-[#3c2f00] disabled:opacity-40"
            style={{ backgroundColor: '#e9c349' }}
          >
            {saving ? 'Saving…' : 'Save to journal'}
          </button>
        </div>
      </div>
    </div>
  )
}
