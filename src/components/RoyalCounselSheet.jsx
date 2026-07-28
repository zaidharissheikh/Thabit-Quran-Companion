/**
 * Bottom sheet for full Royal Counsel text (mobile / truncated card).
 */
export default function RoyalCounselSheet({ open, body, onClose }) {
  return (
    <div className={`sheet-overlay ${open ? 'open' : ''}`} onClick={onClose}>
      <div
        className="sheet fixed bottom-0 left-0 right-0 mx-auto max-w-[430px] rounded-t-3xl border-t border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[var(--app-border)]" />
        <div className="mb-3 flex items-center gap-2">
          <div className="gold-gradient rounded-full p-2 flex items-center justify-center">
            <i className="fa-solid fa-mosque text-[#062c21] text-sm" aria-hidden />
          </div>
          <h3 className="font-playfair text-lg text-[var(--app-accent)] italic">Royal Counsel</h3>
        </div>
        <p className="min-h-[60px] text-sm leading-relaxed text-[var(--app-accent-text)] font-light">
          {body}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] py-3 text-sm font-medium text-[var(--app-accent)] transition hover:opacity-90"
        >
          Close
        </button>
      </div>
    </div>
  )
}
