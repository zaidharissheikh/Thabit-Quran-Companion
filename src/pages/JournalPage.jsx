import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import LoadingDots from '../components/LoadingDots'
import { AvatarBadge } from '../assets/avatars'
import { VERSES } from '../data/content'
import { parseRefIds } from '../lib/bookmarks'

const MODES = [
  {
    id: 'free',
    label: 'Anything',
    hint: 'A thought, dua, or feeling - not tied to a specific ayah.',
  },
  {
    id: 'today',
    label: 'Ayah of the day',
    hint: 'Reflect on the verse shown on your Home screen today.',
  },
]

export default function JournalPage({
  state,
  avatarId,
  todayVerse,
  reflectionQuestion,
  onGenerateReflectionQuestion,
  onPostReflection,
}) {
  const [mode, setMode] = useState('free')
  const [reflectionText, setReflectionText] = useState('')
  const [saving, setSaving] = useState(false)
  const journals = state.journals || []

  const verseOfDay = useMemo(
    () => todayVerse || VERSES[new Date().getDay() % VERSES.length],
    [todayVerse],
  )

  async function handleSave() {
    const text = reflectionText.trim()
    if (!text || saving) return
    setSaving(true)
    try {
      if (mode === 'today') {
        const ids = parseRefIds(verseOfDay.ref)
        await onPostReflection(text, {
          verseLabel: verseOfDay.ref,
          verseRef: ids ? `${ids.surahId}:${ids.ayahNumber}` : null,
        })
      } else {
        await onPostReflection(text, { verseLabel: null, verseRef: null })
      }
      setReflectionText('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen text-[var(--app-text)] font-manrope selection:bg-amber-500/30 pb-24 md:pl-[256px] overflow-x-hidden app-shell bg-[var(--app-bg)]">
      <header className="fixed md:hidden top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[var(--app-nav-bg)] border-b border-[var(--app-border)] max-w-[430px] mx-auto">
        <h1 className="font-serif uppercase font-medium text-[var(--app-accent)] text-sm tracking-[0.2em]">
          Reflections
        </h1>
        <Link
          to="/settings"
          className="w-8 h-8 rounded-full border border-[var(--app-accent)] bg-[var(--app-surface)] overflow-hidden hover:opacity-80 transition-opacity"
          aria-label="Open settings"
        >
          <AvatarBadge id={avatarId} className="w-full h-full" alt={state.name} />
        </Link>
      </header>

      <main className="pt-24 max-w-[430px] mx-auto px-6 space-y-10 md:space-y-0 md:pt-16 md:px-12 md:max-w-none md:mx-auto md:grid md:grid-cols-12 md:gap-12 md:items-start flex flex-col">
        <section className="text-center md:text-left md:col-span-12 md:flex md:items-end md:gap-6 md:mb-4">
          <div className="flex justify-center md:justify-start mb-4 md:mb-0">
            <div className="w-12 h-12 md:w-16 md:h-16 ayah-medallion flex items-center justify-center rounded-full text-[#3c2f00]">
              <span
                className="material-symbols-outlined md:text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_stories
              </span>
            </div>
          </div>
          <div>
            <h2 className="font-headline text-3xl md:text-5xl text-[var(--app-accent)] mb-2 font-semibold">
              Sacred Journal
            </h2>
            <p className="font-manrope text-[var(--app-text-muted)] text-sm md:text-lg">
              Write freely, about today&apos;s ayah, or from any verse while you read.
            </p>
          </div>
        </section>

        <section className="mb-10 md:mb-0 md:col-span-5 md:sticky md:top-12">
          <div
            className="rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden"
            style={{ backgroundColor: '#f9f7f2' }}
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-8xl text-[#004d40]">menu_book</span>
            </div>

            <div className="relative z-10">
              <span className="font-manrope font-semibold uppercase tracking-[0.2em] text-[#004d40]/70 mb-3 block text-xs text-center">
                New reflection
              </span>

              <div className="flex gap-2 mb-4">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id)}
                    className={`flex-1 px-3 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-colors ${
                      mode === m.id
                        ? 'bg-[#004d40] text-[#e9c349]'
                        : 'bg-[#004d40]/10 text-[#004d40]/70 hover:bg-[#004d40]/15'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <p className="text-sm text-[#004d40]/70 font-manrope mb-4 text-center">
                {MODES.find((m) => m.id === mode)?.hint}
              </p>

              {mode === 'today' ? (
                <div className="mb-4 rounded-xl bg-[#004d40]/5 border border-[#004d40]/10 p-3 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#8e6e33] mb-1">
                    {verseOfDay.ref}
                  </p>
                  <p className="font-arabic text-lg text-[#004d40] leading-relaxed" dir="rtl">
                    {verseOfDay.ar}
                  </p>
                </div>
              ) : (
                <div className="mb-4 text-center">
                  <p className="font-headline text-base text-[#004d40]/80 italic px-2">
                    {reflectionQuestion ? (
                      `"${reflectionQuestion}"`
                    ) : (
                      <span className="not-italic text-sm opacity-60">
                        Optional prompt: <LoadingDots />
                      </span>
                    )}
                  </p>
                </div>
              )}

              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                className="w-full bg-[#004d40]/5 border border-[#004d40]/15 focus:border-[#004d40] outline-none py-4 px-3 min-h-[120px] font-manrope text-[#004d40] placeholder-[#004d40]/50 resize-none transition-all rounded-lg text-sm"
                placeholder="Begin your reflection…"
              />

              <div className="mt-6 flex justify-between items-center gap-3">
                {mode === 'free' ? (
                  <button
                    type="button"
                    onClick={() => onGenerateReflectionQuestion(true)}
                    className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-[#004d40]/50 hover:text-[#004d40] transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    New prompt
                  </button>
                ) : (
                  <span className="text-[10px] text-[#004d40]/40 font-manrope">Linked to Home ayah</span>
                )}
                <button
                  type="button"
                  disabled={!reflectionText.trim() || saving}
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-manrope font-bold transition-transform active:scale-95 shadow-lg text-sm text-[#004d40] disabled:opacity-40"
                  style={{ backgroundColor: '#e9c349' }}
                >
                  Save Entry
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="md:col-span-7 flex flex-col gap-6 w-full">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-manrope font-semibold text-[var(--app-accent)] tracking-widest uppercase text-xs md:text-sm">
              Past Reflections
            </h4>
            <div className="h-[1px] flex-grow ml-4 bg-[var(--app-border)]" />
          </div>

          <div className="space-y-6">
            {journals.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-[var(--app-text-muted)] font-manrope">No past reflections yet.</p>
              </div>
            ) : (
              journals.map((journal) => (
                <div key={journal.id || `${journal.date}-${journal.text}`} className="group">
                  <div className="flex flex-col gap-1 mb-2">
                    <span className="font-manrope text-[var(--app-text-muted)] uppercase tracking-tighter text-xs font-semibold">
                      {journal.date}
                    </span>
                    <h5 className="font-headline text-[var(--app-accent)] transition-colors text-lg font-semibold">
                      {journal.verse || journal.verseLabel || 'Personal note'}
                    </h5>
                  </div>
                  <p className="font-manrope text-[var(--app-text)]/80 italic leading-relaxed border-l-2 border-[var(--app-border)] pl-4 text-sm font-medium">
                    &quot;{journal.text}&quot;
                  </p>
                  <div className="mt-6 h-[1px] w-full bg-[var(--app-border)]" />
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <BottomNav active="/journal" />
    </div>
  )
}
