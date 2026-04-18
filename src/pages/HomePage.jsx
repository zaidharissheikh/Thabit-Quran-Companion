import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import HeartRating from '../components/HeartRating'
import { VERSES } from '../data/content'
import LoadingDots from '../components/LoadingDots'

export default function HomePage({
  state,
  nudge,
  onMarkRead,
  onBookmarkTodayVerse,
  onRateHeart,
  onVerseReflection,
  onShowReturn,
}) {
  const verse = useMemo(() => VERSES[new Date().getDay() % VERSES.length], [])
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const progress = Math.min(100, Math.round((state.versesReadToday / state.goal) * 100))
  const isTodayVerseBookmarked = state.bookmarks.some((bookmark) => bookmark.ref === verse.ref)

  return (
    <div className="geo-dot min-h-screen bg-[#0D2B1F]">
      <header className="fixed top-0 z-50 flex h-20 w-full max-w-[430px] items-center justify-between bg-gradient-to-b from-[#0D2B1F] via-[#0D2B1F]/95 to-transparent px-6">
        <div className="flex items-center">
          <span className="font-serif text-2xl font-bold text-[#C9A84C]">ثابت</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onShowReturn}
            className="material-symbols-outlined text-[#C9A84C]/60 transition hover:text-[#C9A84C]"
          >
            nights_stay
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#C9A84C]/30 bg-[#1A4A33] text-sm font-bold text-[#C9A84C]">
            {state.name[0].toUpperCase()}
          </div>
        </div>
      </header>

      <main className="noscroll mx-auto max-h-[100dvh] max-w-lg space-y-5 overflow-y-auto px-5 pb-32 pt-24">
        <p className="afu text-xs uppercase tracking-widest text-[#7FA890]">
          {greeting}, {state.name} - السلام عليكم
        </p>

        <section className="afu flex flex-col items-center py-4">
          <div className="group relative cursor-pointer" onClick={onMarkRead}>
            <div className="streak-glow flex h-32 w-32 flex-col items-center justify-center rounded-full border-4 border-[#C9A84C]/50 bg-gradient-to-br from-[#ffe08f] to-[#755b00] transition-all duration-500 group-hover:scale-105">
              <span className="material-symbols-outlined fill-icon mt-1 text-4xl text-[#241a00]">local_fire_department</span>
              <span className="leading-none text-3xl font-bold text-[#241a00]">{state.streak}</span>
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#C9A84C]/20 bg-white/10 px-4 py-1 backdrop-blur-md">
              <span className="text-xs uppercase tracking-widest text-[#C9A84C]">Day Streak</span>
            </div>
          </div>
          <div className="mt-10 w-full px-2">
            <div className="mb-2 flex justify-between text-[10px] text-[#7FA890]">
              <span>Today's goal</span>
              <span>
                {state.versesReadToday} / {state.goal} verses
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#8A6E2F] to-[#C9A84C] transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-center text-[11px] text-[#7FA890]">
              {state.streak > 0 ? `MashaAllah - ${state.streak} days consistent! 🌿` : "Tap the flame to mark today's reading ✨"}
            </p>
          </div>
        </section>

        <section className="afu2 relative">
          <div className="absolute inset-0 scale-[1.02] rotate-1 rounded-[1.5rem] bg-[#C9A84C]/5" />
          <div className="islamic-pattern soft-glass relative overflow-hidden rounded-[1.5rem] border border-[#C9A84C]/20 p-7 shadow-xl">
            <div className="absolute right-0 top-0 h-28 w-28 opacity-10">
              <svg className="h-full w-full fill-[#755b00]" viewBox="0 0 100 100">
                <path d="M50 0L61 39L100 50L61 61L50 100L39 61L0 50L39 39Z" />
              </svg>
            </div>
            <div className="flex flex-col items-center space-y-5 text-center">
              <div>
                <span className="text-[10px] uppercase tracking-[.25em] text-secondary">Today's Verse</span>
                <h2 className="mt-1 font-serif text-xl font-bold text-primary">{verse.ref}</h2>
              </div>
              <p className="font-arabic text-3xl leading-[2] text-on-surface" dir="rtl">
                {verse.ar}
              </p>
              <p className="font-serif text-base italic leading-relaxed text-on-surface-variant/80">{verse.en}</p>
              <div className="flex gap-6 pt-2">
                <button
                  type="button"
                  onClick={() => onBookmarkTodayVerse(verse)}
                  className="flex items-center gap-1.5 text-sm text-secondary transition hover:text-primary"
                >
                  <span className={`material-symbols-outlined text-lg ${isTodayVerseBookmarked ? 'fill-icon' : ''}`}>bookmark</span>
                  {isTodayVerseBookmarked ? 'Saved' : 'Save'}
                </button>
                <Link to="/reader" className="flex items-center gap-1.5 text-sm text-secondary transition hover:text-primary">
                  <span className="material-symbols-outlined text-lg">menu_book</span>
                  Read
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    onVerseReflection({
                      ref: verse.ref,
                      prompt: `The user just read: "${verse.ar}" meaning ${verse.en} from ${verse.surah}. Write a 2-3 sentence warm personal reflection connecting this to modern daily life.`,
                    })
                  }
                  className="flex items-center gap-1.5 text-sm text-secondary transition hover:text-primary"
                >
                  <span className="material-symbols-outlined text-lg">auto_awesome</span>
                  Reflect
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="afu3">
          <button
            type="button"
            onClick={() =>
              onVerseReflection({
                ref: verse.ref,
                prompt: `The user just read: "${verse.ar}" meaning ${verse.en} from ${verse.surah}. Write a 2-3 sentence warm personal reflection connecting this to modern daily life.`,
              })
            }
            className="nudge-pulse flex w-full items-start gap-4 rounded-2xl border border-[#C9A84C]/10 bg-white/5 p-5 text-left transition-all duration-500 hover:bg-white/8"
          >
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary-container shadow-md">
              <span className="material-symbols-outlined fill-icon text-on-primary-container">auto_awesome</span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="mb-1 text-sm font-bold tracking-wide text-[#ffe08f]">Today's Reminder</h3>
              <p className="text-sm leading-relaxed text-[#FFF9EF]/70">{nudge || <LoadingDots />}</p>
            </div>
            <span className="material-symbols-outlined self-center text-[#C9A84C]/50">chevron_right</span>
          </button>
        </section>

        <section className="afu4 grid grid-cols-2 gap-3">
          <Link
            to="/momentum"
            className="flex h-36 cursor-pointer flex-col justify-between rounded-3xl border border-outline-variant/10 bg-surface-container-low p-5 transition-all duration-300 hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-secondary">query_stats</span>
            <div>
              <p className="text-sm font-bold text-on-surface">Momentum</p>
              <p className="mt-0.5 text-xs text-on-surface-variant">{state.sessions.length} active habits</p>
            </div>
          </Link>
          <Link
            to="/journal"
            className="flex h-36 cursor-pointer flex-col justify-between rounded-3xl border border-primary/20 bg-primary/10 p-5 transition-all duration-300 hover:bg-primary/15"
          >
            <span className="material-symbols-outlined text-[#C9A84C]">auto_stories</span>
            <div>
              <p className="text-sm font-bold text-[#C9A84C]">Journal</p>
              <p className="mt-0.5 text-xs text-[#C9A84C]/60">
                {state.journals.length} reflection{state.journals.length === 1 ? '' : 's'}
              </p>
            </div>
          </Link>
        </section>

        <section className="afu4 space-y-5 rounded-3xl bg-surface-container-low p-6 text-center">
          <h3 className="text-sm font-medium tracking-wide text-on-surface-variant">How does your heart feel now?</h3>
          <HeartRating value={state.heartRating} onChange={onRateHeart} />
        </section>
      </main>

      <BottomNav active="/" dark />
    </div>
  )
}
