import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HELP_FAQS } from '../data/helpFaqs'
import { ApiError, supportApi } from '../lib/api'

const TOPICS = [
  { id: 'suggestion', label: 'Suggestion' },
  { id: 'bug', label: 'Bug' },
  { id: 'question', label: 'Question' },
  { id: 'other', label: 'Other' },
]

export default function HelpSupportPage({ user, state }) {
  const navigate = useNavigate()
  const [openId, setOpenId] = useState(HELP_FAQS[0]?.id || null)
  const [topic, setTopic] = useState('suggestion')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState({ type: '', text: '' })

  const userEmail = user?.email || ''
  const userName = user?.name || state?.name || 'Friend'

  const canSubmit = useMemo(() => {
    return subject.trim().length >= 3 && message.trim().length >= 10 && !sending
  }, [subject, message, sending])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setSending(true)
    setStatus({ type: '', text: '' })
    try {
      const res = await supportApi.contact({
        topic,
        subject: subject.trim(),
        message: message.trim(),
      })
      setSubject('')
      setMessage('')
      setTopic('suggestion')
      setStatus({
        type: 'ok',
        text: res?.message || 'Thanks. Your message was sent.',
      })
    } catch (err) {
      const text =
        err instanceof ApiError
          ? err.message
          : 'Could not send your message. Please try again.'
      setStatus({ type: 'err', text })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen text-[var(--app-text)] font-manrope selection:bg-[#e9c349]/30 pb-28 md:pl-[256px] overflow-x-hidden app-shell bg-[var(--app-bg)]">
      <header className="fixed md:hidden top-0 left-0 right-0 max-w-[430px] mx-auto z-50 h-16 flex items-center justify-between px-6 border-b border-[var(--app-border)] bg-[var(--app-nav-bg)]">
        <button
          type="button"
          onClick={() => navigate('/settings')}
          aria-label="Back to settings"
          className="flex items-center justify-center w-10 h-10 text-[var(--app-accent)] hover:opacity-80 transition-opacity active:scale-95"
        >
          <span className="material-symbols-outlined text-[28px]">arrow_back</span>
        </button>
        <h1 className="text-[var(--app-accent)] font-serif uppercase tracking-[0.2em] font-medium text-[16px]">
          Help
        </h1>
        <div className="w-10" />
      </header>

      <main className="pt-24 px-6 max-w-[430px] mx-auto space-y-8 md:pt-16 md:px-12 md:max-w-3xl md:mx-auto">
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="hidden md:inline-flex items-center gap-1 text-[var(--app-accent)] hover:opacity-80 -ml-1"
        >
          <span className="material-symbols-outlined text-[22px]">arrow_back</span>
          <span className="font-manrope text-sm font-semibold">Settings</span>
        </button>
        <section className="space-y-2">
          <p className="font-manrope text-[11px] uppercase tracking-[0.2em] text-[var(--app-accent)] font-semibold">
            Help &amp; Support
          </p>
          <h2 className="font-headline text-3xl text-[var(--app-accent)] font-semibold">
            FAQs and suggestions
          </h2>
          <p className="font-manrope text-sm text-[var(--app-text-muted)] leading-relaxed">
            Browse common questions below. Still stuck, or have an idea? Send us a message.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="font-manrope text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-accent)]">
            Frequently asked
          </h3>
          <div className="space-y-2">
            {HELP_FAQS.map((item) => {
              const open = openId === item.id
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : item.id)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
                    aria-expanded={open}
                  >
                    <span className="font-manrope text-sm font-semibold text-[var(--app-text)]">
                      {item.q}
                    </span>
                    <span
                      className={`material-symbols-outlined text-[var(--app-accent)] transition-transform ${
                        open ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                  {open ? (
                    <div className="px-4 pb-4">
                      <p className="font-manrope text-sm text-[var(--app-text-muted)] leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-5 sm:p-6 space-y-4">
          <div>
            <h3 className="font-headline text-xl text-[var(--app-text)] font-semibold">
              Send a query
            </h3>
            <p className="mt-1 font-manrope text-sm text-[var(--app-text-muted)]">
              Messages are emailed to Thabit support
              {import.meta.env.VITE_SUPPORT_TO_EMAIL ? (
                <>
                  {' '}
                  (
                  <span className="text-[var(--app-accent)]">
                    {import.meta.env.VITE_SUPPORT_TO_EMAIL}
                  </span>
                  )
                </>
              ) : null}
              .
              {userEmail ? (
                <>
                  {' '}
                  We&apos;ll reply to your account email (
                  <span className="text-[var(--app-accent)]">{userEmail}</span>
                  ).
                </>
              ) : (
                <> We&apos;ll reply using the email on your account.</>
              )}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)] mb-2">
                Topic
              </label>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTopic(t.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-colors ${
                      topic === t.id
                        ? 'bg-[#FFD700] text-[#062c21]'
                        : 'border border-[var(--app-accent)]/35 text-[var(--app-accent)] hover:bg-[var(--app-accent)]/10'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="support-subject"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)] mb-2"
              >
                Subject
              </label>
              <input
                id="support-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={120}
                placeholder="Short summary"
                className="w-full rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-sm text-[var(--app-text)] outline-none focus:border-[var(--app-accent)] font-manrope"
              />
            </div>

            <div>
              <label
                htmlFor="support-message"
                className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)] mb-2"
              >
                Message
              </label>
              <textarea
                id="support-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                maxLength={2000}
                placeholder={`Hi, I am ${userName}. Here is my idea or issue…`}
                className="w-full resize-none rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-sm text-[var(--app-text)] outline-none focus:border-[var(--app-accent)] font-manrope"
              />
              <p className="mt-1 text-[11px] text-[var(--app-text-muted)] text-right">
                {message.trim().length}/2000
              </p>
            </div>

            {status.text ? (
              <p
                className={`text-sm font-manrope ${
                  status.type === 'ok' ? 'text-emerald-300' : 'text-[var(--app-danger,#ffb4ab)]'
                }`}
                role="status"
              >
                {status.text}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full py-3.5 rounded-xl font-manrope text-sm font-bold tracking-wide transition-all ${
                canSubmit
                  ? 'bg-[#FFD700] text-[#062c21] active:scale-[0.99]'
                  : 'bg-[var(--app-accent)]/20 text-[var(--app-accent)]/50 cursor-not-allowed'
              }`}
            >
              {sending ? 'Sending…' : 'Send message'}
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}
