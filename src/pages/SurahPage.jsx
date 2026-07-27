import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import JournalComposeModal from '../components/JournalComposeModal'
import LoadingDots from '../components/LoadingDots'
import { FATIHA, SURAHS } from '../data/content'
import { getCachedChapterVerses, hydrateChapterFromIdb, loadChapterVerses } from '../lib/verseCache'
import { hasReadVerseToday } from '../lib/verseRead'

export default function SurahPage({
  state,
  onBookmarkVerse,
  onReflectVerse,
  onPostReflection,
  onVerseRead,
}) {
  const { id } = useParams()
  const navigate = useNavigate()
  const surahNum = Number(id)
  const surah = SURAHS.find((s) => s.num === surahNum) || SURAHS[0]
  const [journalVerse, setJournalVerse] = useState(null)
  const [readTick, setReadTick] = useState(0)
  const cached = getCachedChapterVerses(surahNum)
  const [verses, setVerses] = useState(cached?.length ? cached : surahNum === 1 ? FATIHA : [])
  const [loading, setLoading] = useState(!(cached?.length || surahNum === 1))
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const hit = getCachedChapterVerses(surahNum)
    if (hit?.length) {
      setVerses(hit)
      setLoading(false)
      setError('')
    } else {
      setLoading(true)
      setError('')
      setVerses(surahNum === 1 ? FATIHA : [])
    }

    ;(async () => {
      try {
        if (!hit?.length) {
          const fromIdb = await hydrateChapterFromIdb(surahNum)
          if (cancelled) return
          if (fromIdb?.length) {
            setVerses(fromIdb)
            setLoading(false)
            setError('')
          }
        }

        const rows = await loadChapterVerses(surahNum)
        if (cancelled) return
        if (rows.length > 0) {
          setVerses(rows)
          setError('')
        } else if (surahNum !== 1) {
          setError('No verses returned for this chapter.')
        }
      } catch (err) {
        if (cancelled) return
        if (surahNum === 1) {
          setVerses(FATIHA)
          setError('')
        } else if (!getCachedChapterVerses(surahNum)?.length) {
          setError(err?.message || 'Could not load verses. Is the API running?')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [surahNum])

  // Scroll to the ayah anchor (#ayah-N) once verses are rendered
  useEffect(() => {
    if (loading || verses.length === 0) return undefined
    const hash = window.location.hash
    if (!hash || !hash.startsWith('#ayah-')) return undefined
    const id = hash.slice(1)
    let cancelled = false
    let tries = 0

    const attempt = () => {
      if (cancelled) return
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
      tries += 1
      if (tries < 20) {
        window.setTimeout(attempt, 50)
      }
    }

    const t = window.setTimeout(attempt, 30)
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
  }, [loading, verses, surahNum])

  function isVerseBookmarked(verse) {
    return state.bookmarks.some(
      (b) => b.surahId === surahNum && b.ayahNumber === verse.num,
    )
  }

  async function handleMarkRead(verseNum) {
    await onVerseRead?.(surahNum, verseNum)
    setReadTick((n) => n + 1)
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)] font-manrope text-[var(--app-text)] royal-pattern pb-24 md:pl-[256px] overflow-x-hidden app-shell">
      <header className="fixed md:hidden top-0 w-full z-50 flex items-center justify-between px-4 h-16 bg-[var(--app-nav-bg)] max-w-[430px] mx-auto">
        <Link
          to="/reader"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-emerald-900/50 transition-colors"
        >
          <span className="material-symbols-outlined text-[var(--app-accent)]">arrow_back</span>
        </Link>
        <h1 className="font-headline text-2xl font-semibold text-[var(--app-accent)] tracking-wide">
          {surah.name}
        </h1>
        <button
          type="button"
          onClick={() => navigate(`/play/${surahNum}/1?mode=surah`)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:opacity-80 transition-colors"
          aria-label="Play entire surah"
        >
          <span className="material-symbols-outlined text-[var(--app-accent)]">volume_up</span>
        </button>
      </header>

      <main className="pt-24 px-6 max-w-[430px] mx-auto space-y-8 md:pt-16 md:px-12 md:max-w-5xl md:mx-auto">
        <div className="text-center space-y-4">
          <div className="inline-block relative py-6">
            <div className="absolute inset-0 blur-[80px] bg-amber-500/10 rounded-full scale-150" />
            <h1 className="relative font-cormorant text-5xl md:text-6xl gold-gradient-text font-bold tracking-widest py-2 uppercase">
              {surah.name}
            </h1>
            <p className="relative font-arabic text-3xl text-[var(--app-accent)] mt-2" dir="rtl">
              {surah.ar}
            </p>
            <p className="relative text-sm text-[var(--app-text-muted)] mt-3 font-manrope">
              {surah.meaning} · {surah.verses} ayahs · {surah.type} · Juz {surah.juz}
            </p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
            <div className="w-3 h-3 rotate-45 border border-amber-500" />
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-500/50 to-transparent" />
          </div>
          <button
            type="button"
            onClick={() => navigate(`/play/${surahNum}/1?mode=surah`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FFD700] text-[#062c21] font-manrope text-sm font-bold tracking-wide"
          >
            <span className="material-symbols-outlined text-[20px]">play_arrow</span>
            Play entire surah
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-16 text-[var(--app-accent)]">
            <LoadingDots />
            <p className="text-sm font-manrope text-[var(--app-text-muted)]">Loading ayahs…</p>
          </div>
        ) : null}

        {error && !loading ? (
          <div className="text-center py-10 space-y-3">
            <p className="text-red-300/90 font-manrope text-sm" role="alert">
              {error}
            </p>
            <p className="text-[var(--app-text-muted)] text-xs font-manrope">
              Make sure <code className="text-[var(--app-accent)]">vercel dev</code> is running on
              port 3000 with Quran production credentials.
            </p>
          </div>
        ) : null}

        {!loading && verses.length > 0 ? (
          <div className="space-y-8">
            {verses.map((verse) => {
              const bookmarked = isVerseBookmarked(verse)
              void readTick
              const alreadyRead = hasReadVerseToday(surahNum, verse.num)
              return (
                <div key={verse.num} id={`ayah-${verse.num}`} className="space-y-4 scroll-mt-20">
                  <div className="cream-card p-6 rounded-2xl space-y-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="ayah-medallion w-10 h-10 rounded-full flex items-center justify-center text-emerald-950 font-bold shrink-0">
                        {verse.num}
                      </div>
                      <p className="ayah-arabic text-right text-emerald-950 flex-1" dir="rtl">
                        {verse.ar}
                      </p>
                    </div>
                    {verse.en ? (
                      <p className="ayah-translation ayah-translation--plain text-emerald-900 font-medium">
                        {verse.en}
                      </p>
                    ) : null}
                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-amber-900/10 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleMarkRead(verse.num)}
                        disabled={alreadyRead}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                          alreadyRead
                            ? 'text-emerald-800/50 cursor-default'
                            : 'text-amber-700/80 hover:bg-amber-100'
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-[20px] ${alreadyRead ? 'fill-icon' : ''}`}
                        >
                          {alreadyRead ? 'check_circle' : 'menu_book'}
                        </span>
                        <span className="font-manrope text-sm font-semibold tracking-[0.05em]">
                          {alreadyRead ? 'Read' : 'Mark read'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onBookmarkVerse(verse, surah)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-amber-700/80 hover:bg-amber-100 transition-colors text-sm"
                      >
                        <span
                          className={`material-symbols-outlined text-[20px] ${bookmarked ? 'fill-icon' : ''}`}
                        >
                          bookmark
                        </span>
                        <span className="font-manrope text-sm font-semibold tracking-[0.05em]">
                          {bookmarked ? 'Saved' : 'Bookmark'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setJournalVerse(verse)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-amber-700/80 hover:bg-amber-100 transition-colors text-sm"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit_note</span>
                        <span className="font-manrope text-sm font-semibold tracking-[0.05em]">
                          Journal
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onReflectVerse({
                            ref: `${surah.name} verse ${verse.num}`,
                            prompt: `User read: "${verse.ar}" meaning "${verse.en}". Write a strictly 1.5-sentence warm reflection to apply today.`,
                          })
                        }
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-amber-700/80 hover:bg-amber-100 transition-colors text-sm"
                      >
                        <span className="material-symbols-outlined text-[20px]">psychology</span>
                        <span className="font-manrope text-sm font-semibold tracking-[0.05em]">
                          Reflect
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/play/${surahNum}/${verse.num}`)}
                        className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-200 hover:bg-amber-200 transition-colors"
                        aria-label={`Play ayah ${verse.num}`}
                      >
                        <span className="material-symbols-outlined fill-icon">play_arrow</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : null}

        <div className="py-12 flex justify-center items-center">
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
          <span className="material-symbols-outlined text-amber-500/40 mx-4">diamond</span>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        </div>
      </main>

      <JournalComposeModal
        open={Boolean(journalVerse)}
        title="Add to journal"
        subtitle="Your note will be saved under this ayah in Sacred Journal."
        verseHint={
          journalVerse ? `${surah.name} ${surahNum}:${journalVerse.num}` : ''
        }
        onClose={() => setJournalVerse(null)}
        onSave={async (text) => {
          if (!journalVerse) return
          await onPostReflection(text, {
            verseLabel: `${surah.name} ${surahNum}:${journalVerse.num}`,
            verseRef: `${surahNum}:${journalVerse.num}`,
          })
        }}
      />
    </div>
  )
}
