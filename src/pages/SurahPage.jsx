import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import JournalComposeModal from '../components/JournalComposeModal'
import { FATIHA, SURAHS } from '../data/content'
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

  function isVerseBookmarked(verse) {
    return state.bookmarks.some(
      (b) => b.surahId === surahNum && b.ayahNumber === verse.num,
    )
  }

  async function handleMarkRead(verseNum) {
    await onVerseRead?.(surahNum, verseNum)
    setReadTick((n) => n + 1)
  }

  const verses = surahNum === 1 ? FATIHA : []

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
          onClick={() => navigate(`/play/${surahNum}/1`)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:opacity-80 transition-colors"
        >
          <span className="material-symbols-outlined text-[var(--app-accent)]">volume_up</span>
        </button>
      </header>

      <main className="pt-24 px-6 max-w-[430px] mx-auto space-y-8 md:pt-16 md:px-12 md:max-w-7xl md:mx-auto">
        <div className="text-center space-y-6">
          <div className="inline-block relative py-8">
            <div className="absolute inset-0 blur-[80px] bg-amber-500/10 rounded-full scale-150" />
            <h1 className="relative font-cormorant text-6xl gold-gradient-text font-bold tracking-widest py-4 uppercase">
              {surah.name}
            </h1>
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
            <div className="w-3 h-3 rotate-45 border border-amber-500" />
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-500/50 to-transparent" />
          </div>
        </div>

        {verses.length > 0 ? (
          <div className="space-y-10">
            {verses.map((verse) => {
              const bookmarked = isVerseBookmarked(verse)
              void readTick
              const alreadyRead = hasReadVerseToday(surahNum, verse.num)
              return (
                <div key={verse.num} className="space-y-4">
                  <div className="cream-card p-6 rounded-2xl space-y-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="ayah-medallion w-10 h-10 rounded-full flex items-center justify-center text-emerald-950 font-bold shrink-0">
                        {verse.num}
                      </div>
                      <p className="ayah-arabic text-right text-emerald-950" dir="rtl">
                        {verse.ar}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="ayah-translation ayah-translation--plain text-emerald-900 font-medium">
                        {verse.en}
                      </p>
                    </div>
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
                        title={alreadyRead ? 'Already counted today' : 'Mark this ayah as read'}
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
                        title="Add to journal"
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
                      >
                        <span className="material-symbols-outlined fill-icon">play_arrow</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-amber-500/30 mb-4 block">
              menu_book
            </span>
            <p className="text-[#e5e2db]/50 font-headline text-lg">Verses coming soon</p>
            <p className="text-[#e5e2db]/30 text-sm mt-2">
              This surah&apos;s content is being prepared.
            </p>
          </div>
        )}

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
