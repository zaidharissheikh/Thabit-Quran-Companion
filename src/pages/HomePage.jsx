import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { VERSES } from '../data/content'
import LoadingDots from '../components/LoadingDots'
import { parseRefIds } from '../lib/bookmarks'
import { greetingForNow } from '../lib/localDay'
import { AvatarBadge } from '../assets/avatars'
import { getRoyalCounsel } from '../lib/royalCounsel'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export default function HomePage({
  state,
  nudge: _nudge,
  avatarId,
  onBookmarkTodayVerse,
  onVerseReflection,
}) {
  const verse = useMemo(() => VERSES[new Date().getDay() % VERSES.length], [])
  const verseIds = useMemo(() => parseRefIds(verse.ref), [verse.ref])
  const greeting = useMemo(() => greetingForNow(), [])
  // Changes every 3 hours - stable per render within the same window
  const counsel = useMemo(() => getRoyalCounsel(3), [])

  const progress = Math.min(100, Math.round((state.versesReadToday / state.goal) * 100))
  const readHref = verseIds
    ? `/surah/${verseIds.surahId}#ayah-${verseIds.ayahNumber}`
    : '/reader'
  const isTodayVerseBookmarked = state.bookmarks.some((bookmark) => {
    if (bookmark.ref === verse.ref) return true
    const m = verse.ref.match(/(\d+)\s*:\s*(\d+)/)
    if (!m) return false
    return bookmark.surahId === Number(m[1]) && bookmark.ayahNumber === Number(m[2])
  })
  const container = useRef(null)

  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 768px)', () => {
      gsap.from('.desktop-hero', {
        y: 24,
        opacity: 0,
        duration: 0.9,
        ease: 'power4.out',
        stagger: 0.12,
      })

      gsap.from('.bento-card', {
        y: 32,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.08,
        delay: 0.15,
      })
    })
  }, { scope: container })

  return (
    <div
      ref={container}
      className="font-inter min-h-dvh md:h-dvh bg-[var(--app-bg)] text-[var(--app-text)] overflow-x-hidden md:overflow-hidden md:pl-[256px] app-shell"
    >
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[var(--app-nav-bg)] backdrop-blur-xl px-5 py-3 flex justify-between items-center border-b border-[var(--app-border)] max-w-[430px] mx-auto">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Thabit" className="w-9 h-9 rounded-lg object-contain" />
          <span className="text-xl font-arabic text-[var(--app-accent)]">ثابت</span>
        </div>
        <Link
          to="/settings"
          className="w-10 h-10 rounded-full border border-[var(--app-accent)] overflow-hidden bg-[var(--app-surface)] shadow-inner hover:opacity-80 transition-opacity"
          aria-label="Open settings"
        >
          <AvatarBadge id={avatarId} className="w-full h-full" alt={state.name} />
        </Link>
      </header>

      <main className="pt-[4.5rem] pb-28 px-5 max-w-[430px] mx-auto flex flex-col gap-4 bg-pattern-dark min-h-dvh md:pt-6 md:pb-6 md:px-10 md:max-w-none md:mx-auto md:h-full md:min-h-0 md:gap-4 md:overflow-hidden">
        <section className="afu desktop-hero shrink-0">
          <h2 className="text-[10px] md:text-xs uppercase tracking-[0.28em] md:tracking-[0.4em] text-[var(--app-accent)]/80 font-bold mb-1 md:mb-2 md:pl-0.5">
            Essence of Mindfulness
          </h2>
          <h1
            className="font-playfair text-[var(--app-accent-text)] leading-tight md:max-w-4xl"
            style={{ fontSize: 'clamp(1.35rem, 2.4vw + 0.6rem, 2.65rem)' }}
          >
            {greeting}, {state.name}{' '}
            <span
              className="font-arabic opacity-60 ml-1 md:ml-3 inline-block align-middle"
              style={{ fontSize: 'clamp(1rem, 1.8vw + 0.4rem, 2rem)' }}
            >
              السلام عليكم
            </span>
          </h1>
        </section>

        <div className="md:grid md:grid-cols-12 md:grid-rows-[minmax(0,1.35fr)_auto] md:gap-4 flex flex-col gap-4 md:flex-1 md:min-h-0">
          <section className="afu2 md:col-span-4 md:row-span-2 bento-card relative overflow-hidden group app-streak-panel md:border md:border-[var(--app-border)] md:rounded-2xl flex flex-col items-center justify-center py-3 md:py-4 md:px-5 shadow-none md:shadow-[0_4px_15px_-3px_rgba(0,0,0,0.08)] md:min-h-0 md:h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-[#c5a059]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 hidden md:block" />
            <div className="relative flex flex-col items-center w-full max-w-xs">
              <div className="relative w-[8.5rem] h-[8.5rem] md:w-[clamp(8rem,14vh,11rem)] md:h-[clamp(8rem,14vh,11rem)] flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-[var(--app-accent)]/30 animate-pulse" />
                <div className="absolute inset-3 rounded-full border-2 border-[var(--app-accent)]/50" />
                <div className="w-[6.5rem] h-[6.5rem] md:w-[78%] md:h-[78%] rounded-full gold-gradient flex flex-col items-center justify-center medallion-glow border-2 border-[#e9d19b]/30 relative overflow-hidden">
                  <i
                    className="fa-solid fa-fire text-[#062c21] mb-1 text-3xl md:text-4xl"
                    aria-hidden
                  />
                  <span
                    className="font-playfair font-extrabold text-[#062c21] leading-none"
                    style={{ fontSize: 'clamp(1.75rem, 4vh, 2.75rem)' }}
                  >
                    {state.streak}
                  </span>
                </div>
                <div className="absolute -bottom-1 bg-[var(--app-surface)] border border-[var(--app-accent)] px-4 py-1 rounded-sm shadow-xl">
                  <span className="text-[var(--app-accent)] font-bold text-[9px] md:text-[10px] tracking-[0.22em] uppercase">
                    Day Streak
                  </span>
                </div>
              </div>

              <div className="mt-8 w-full text-center relative z-10">
                <div className="flex justify-between text-[10px] uppercase tracking-wider text-[var(--app-text-muted)] mb-1.5 font-bold">
                  <span>Daily Devotion</span>
                  <span className="text-[var(--app-accent-text)]">
                    {state.versesReadToday} / {state.goal} Verses
                  </span>
                </div>
                <div
                  className="w-full h-1.5 bg-[var(--app-bg-soft)] rounded-full overflow-hidden border border-[var(--app-border)]"
                  role="progressbar"
                  aria-valuenow={state.versesReadToday}
                  aria-valuemin={0}
                  aria-valuemax={state.goal}
                  aria-label="Verses read toward daily goal"
                >
                  <div
                    className="h-full gold-gradient shadow-[0_0_10px_rgba(197,160,89,0.4)] transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs md:text-sm text-[var(--app-text-muted)] mt-3 italic font-playfair">
                  {state.streak > 0
                    ? `MashaAllah - ${state.streak} day${state.streak === 1 ? '' : 's'} consistent`
                    : '"Consistency is the key to spiritual growth."'}
                </p>
                <p className="mt-2 text-[10px] md:text-[11px] text-[var(--app-text-muted)] font-manrope leading-snug">
                  Verses count when you finish listening on Play, or tap Mark read on an ayah.
                </p>
              </div>
            </div>
          </section>

          <section className="afu3 md:col-span-8 md:row-span-1 bento-card group md:min-h-0 md:h-full">
            <div className="bg-[#fdfaf3] rounded-2xl md:rounded-3xl px-6 py-6 md:px-10 md:py-8 text-[#062c21] relative overflow-hidden shadow-2xl border-b-4 border-[#c5a059]/30 h-full flex flex-col justify-between transition-transform duration-700 ease-out md:group-hover:scale-[1.01]">
              <div className="absolute inset-0 royal-pattern opacity-40" />
              <div className="relative z-10 text-center flex flex-col justify-center h-full min-h-0 py-2">
                <div className="flex flex-col items-center mb-2 md:mb-3">
                  <span className="text-[10px] md:text-[11px] uppercase tracking-[0.38em] text-[#8e6e33] font-bold block">
                    The Living Word
                  </span>
                </div>
                <h3 className="font-playfair text-xl md:text-2xl font-bold text-[#062c21] mb-3 md:mb-5 italic">
                  {verse.ref}
                </h3>
                <div
                  className="ayah-arabic home-ayah mb-4 md:mb-6 text-center text-[#062c21] leading-relaxed px-2"
                  dir="rtl"
                >
                  {verse.ar}
                </div>
                
                <div className="flex items-center justify-center gap-3 my-2 md:my-4 opacity-75">
                  <div className="w-14 md:w-20 h-px bg-gradient-to-r from-transparent to-[#c5a059]" />
                  <span className="text-[#8e6e33] text-xs font-serif">❖</span>
                  <div className="w-14 md:w-20 h-px bg-gradient-to-l from-transparent to-[#c5a059]" />
                </div>

                <p className="ayah-translation home-ayah-translation text-[#062c21]/90 mb-6 md:mb-8 px-2 md:px-10 md:max-w-3xl md:mx-auto leading-relaxed">
                  &ldquo;{verse.en}&rdquo;
                </p>

                <div className="flex justify-center items-center gap-6 md:gap-12 mt-1">
                  <button
                    type="button"
                    onClick={() => onBookmarkTodayVerse(verse)}
                    className="flex flex-col items-center gap-1.5 group/btn transition-transform hover:scale-105"
                  >
                    <div className="p-2.5 md:p-3 bg-[#062c21]/5 border border-[#c5a059]/30 rounded-full group-hover/btn:bg-[#c5a059]/20 group-hover/btn:border-[#c5a059] shadow-sm transition-all duration-300">
                      <svg className={`h-5 w-5 text-[#8e6e33] ${isTodayVerseBookmarked ? 'fill-[#8e6e33]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </div>
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[#8e6e33]">
                      {isTodayVerseBookmarked ? 'Saved' : 'Save'}
                    </span>
                  </button>
                  <Link
                    to={readHref}
                    className="flex flex-col items-center gap-1.5 group/btn transition-transform hover:scale-105"
                  >
                    <div className="p-2.5 md:p-3 bg-[#062c21]/5 border border-[#c5a059]/30 rounded-full group-hover/btn:bg-[#c5a059]/20 group-hover/btn:border-[#c5a059] shadow-sm transition-all duration-300">
                      <svg className="h-5 w-5 text-[#8e6e33]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </div>
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[#8e6e33]">Read</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      onVerseReflection({
                        ref: verse.ref,
                        prompt: `The user just read: "${verse.ar}" meaning ${verse.en} from ${verse.surah}. Write a strictly 1-sentence warm personal reflection (under 20 words) connecting this to daily life.`,
                      })
                    }
                    className="flex flex-col items-center gap-1.5 group/btn transition-transform hover:scale-105"
                  >
                    <div className="p-2.5 md:p-3 bg-[#062c21]/5 border border-[#c5a059]/30 rounded-full group-hover/btn:bg-[#c5a059]/20 group-hover/btn:border-[#c5a059] shadow-sm transition-all duration-300">
                      <svg className="h-5 w-5 text-[#8e6e33]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </div>
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[#8e6e33]">Reflect</span>
                  </button>
                  <Link
                    to="/journal?mode=today"
                    className="flex flex-col items-center gap-1.5 group/btn transition-transform hover:scale-105"
                  >
                    <div className="p-2.5 md:p-3 bg-[#062c21]/5 border border-[#c5a059]/30 rounded-full group-hover/btn:bg-[#c5a059]/20 group-hover/btn:border-[#c5a059] shadow-sm transition-all duration-300 flex items-center justify-center">
                      <i className="fa-solid fa-file-pen text-[#8e6e33] text-[18px]" aria-hidden />
                    </div>
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[#8e6e33]">
                      Journal
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="afu4 md:col-span-8 md:row-span-1 bento-card md:min-h-0">
            <div
              className="w-full h-full min-h-[5.5rem] bg-[#0a3d2e]/40 md:bg-[#083327] border border-[#c5a059]/20 rounded-2xl px-4 py-4 md:px-6 md:py-4 flex items-start md:items-center gap-3 md:gap-5 backdrop-blur-sm text-left"
            >
              <div className="gold-gradient rounded-full p-2 md:p-2.5 shadow-lg ring-4 ring-[#0a3d2e] flex-shrink-0 flex items-center justify-center">
                <i className="fa-solid fa-mosque text-[#062c21] text-sm md:text-base" aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-playfair text-base md:text-lg text-[var(--app-accent)] mb-0.5 italic">Royal Counsel</h4>
                <p className="text-xs md:text-sm text-[var(--app-accent)] opacity-80 leading-snug font-light md:max-w-3xl line-clamp-3">
                  {counsel}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <BottomNav active="/" dark />
    </div>
  )
}
