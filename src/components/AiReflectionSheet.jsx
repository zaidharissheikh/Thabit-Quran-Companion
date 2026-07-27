import LoadingDots from './LoadingDots'

export default function AiReflectionSheet({ open, verseRef, body, loading, onClose }) {
  return (
    <div className={`sheet-overlay ${open ? 'open' : ''}`} onClick={onClose}>
      <div
        className="sheet fixed bottom-0 left-0 right-0 mx-auto max-w-[430px] rounded-t-3xl border-t border-outline-variant/20 bg-surface p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-outline-variant/40" />
        <div className="mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined fill-icon text-lg text-primary">auto_awesome</span>
          <h3 className="font-serif text-lg text-on-surface">AI Reflection</h3>
        </div>
        <p className="mb-4 text-xs italic text-on-surface-variant">{verseRef}</p>
        <div className="min-h-[60px] text-sm leading-relaxed text-on-surface">{loading ? <LoadingDots /> : body}</div>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-surface-container py-3 text-sm font-medium text-on-surface-variant transition hover:bg-surface-container-high"
        >
          Close
        </button>
      </div>
    </div>
  )
}
