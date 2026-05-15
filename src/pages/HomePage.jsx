import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
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
    <div className="font-inter noscroll min-h-screen bg-[#062c21] text-[#f3e5ab]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#062c21]/90 backdrop-blur-xl px-6 py-5 flex justify-between items-center border-b border-[#c5a059]/20 max-w-[430px] mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-arabic text-[#c5a059]">ثابت</span>
        </div>
        <div className="flex items-center gap-4">
          {/* <button type="button" onClick={onShowReturn} className="p-2 text-[#e9d19b] opacity-80">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button> */}
          <Link to="/settings" className="w-10 h-10 rounded-full border border-[#c5a059] flex items-center justify-center text-[#c5a059] font-semibold bg-[#0a3d2e] shadow-inner hover:opacity-80 transition-opacity">
            {state.name[0].toUpperCase()}
          </Link>
        </div>
      </header>

      <main className="pt-28 pb-32 px-6 bg-pattern-dark min-h-screen max-w-[430px] mx-auto">
        {/* Greeting */}
        <section className="afu mb-8">
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-[#c5a059]/70 font-bold mb-1">
            Essence of Mindfulness
          </h2>
          <h1 className="font-playfair text-2xl text-[#e9d19b]">
            {greeting}, {state.name}{' '}
            <span className="font-arabic text-lg opacity-60 ml-1">السلام عليكم</span>
          </h1>
        </section>

        {/* Streak Medallion */}
        <section className="afu2 flex flex-col items-center justify-center mb-12 py-4">
          <div className="relative flex flex-col items-center cursor-pointer" onClick={onMarkRead}>
            {/* Medallion Frame */}
            <div className="relative w-52 h-52 flex items-center justify-center">
              {/* Outer Decorative Ring */}
              <div className="absolute inset-0 rounded-full border border-[#c5a059]/30 animate-pulse" />
              <div className="absolute inset-4 rounded-full border-2 border-[#c5a059]/50" />
              {/* Main Medallion */}
              <div className="w-40 h-40 rounded-full gold-gradient flex flex-col items-center justify-center medallion-glow border-2 border-[#e9d19b]/30 relative overflow-hidden">
                <svg className="h-8 w-8 text-[#062c21] mb-1" fill="currentColor" viewBox="0 0 20 20">
                  <path clipRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-1.309-1.344-2.158-.188-.44-.36-.893-.541-1.339z" fillRule="evenodd" />
                </svg>
                <span className="text-6xl font-playfair font-extrabold text-[#062c21] leading-none">{state.streak}</span>
              </div>
              {/* Medallion Label */}
              <div className="absolute -bottom-2 bg-[#062c21] border border-[#c5a059] px-6 py-1.5 rounded-sm shadow-xl">
                <span className="text-[#c5a059] font-bold text-[10px] tracking-[0.25em] uppercase">Day Streak</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-14 w-full max-w-xs text-center">
              <div className="flex justify-between text-[10px] uppercase tracking-wider text-[#c5a059]/60 mb-2 font-bold">
                <span>Daily Devotion</span>
                <span className="text-[#e9d19b]">{state.versesReadToday} / {state.goal} Verses</span>
              </div>
              <div className="w-full h-1.5 bg-[#0a3d2e] rounded-full overflow-hidden border border-[#c5a059]/10">
                <div
                  className="h-full gold-gradient shadow-[0_0_10px_rgba(197,160,89,0.4)] transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-[#e9d19b]/80 mt-5 italic font-playfair">
                {state.streak > 0
                  ? `MashaAllah — ${state.streak} days consistent 🌿`
                  : '"Consistency is the key to spiritual growth."'}
              </p>
            </div>
          </div>
        </section>

        {/* Today's Verse */}
        <section className="afu3 mb-8">
          <div className="bg-[#fdfaf3] rounded-3xl p-10 text-[#062c21] relative overflow-hidden shadow-2xl border-b-4 border-[#c5a059]/30">
            <div className="relative z-10 text-center">
              <span className="text-[9px] uppercase tracking-[0.4em] text-[#8e6e33] font-bold mb-4 block">
                The Living Word
              </span>
              <h3 className="font-playfair text-2xl font-bold text-[#062c21] mb-8 italic">{verse.ref}</h3>
              <div className="font-arabic text-4xl mb-8 leading-loose text-center text-[#062c21]" dir="rtl">
                {verse.ar}
              </div>
              <div className="w-12 h-0.5 bg-[#c5a059]/30 mx-auto mb-8" />
              <p className="italic text-lg text-[#062c21]/80 mb-10 leading-relaxed font-playfair px-2">
                {verse.en}
              </p>

              {/* Action Buttons */}
              <div className="flex justify-center gap-10">
                <button
                  type="button"
                  onClick={() => onBookmarkTodayVerse(verse)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="p-2 border border-[#c5a059]/20 rounded-full group-hover:bg-[#c5a059]/10 transition-colors">
                    <svg className={`h-5 w-5 text-[#8e6e33] ${isTodayVerseBookmarked ? 'fill-[#8e6e33]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#8e6e33]">
                    {isTodayVerseBookmarked ? 'Saved' : 'Save'}
                  </span>
                </button>
                <Link to="/reader" className="flex flex-col items-center gap-2 group">
                  <div className="p-2 border border-[#c5a059]/20 rounded-full group-hover:bg-[#c5a059]/10 transition-colors">
                    <svg className="h-5 w-5 text-[#8e6e33]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#8e6e33]">Read</span>
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    onVerseReflection({
                      ref: verse.ref,
                      prompt: `The user just read: "${verse.ar}" meaning ${verse.en} from ${verse.surah}. Write a 2-3 sentence warm personal reflection connecting this to modern daily life.`,
                    })
                  }
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="p-2 border border-[#c5a059]/20 rounded-full group-hover:bg-[#c5a059]/10 transition-colors">
                    <svg className="h-5 w-5 text-[#8e6e33]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#8e6e33]">Reflect</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Reminder / AI Nudge */}
        <section className="afu4 mb-8">
          <button
            type="button"
            onClick={() =>
              onVerseReflection({
                ref: verse.ref,
                prompt: `The user just read: "${verse.ar}" meaning ${verse.en} from ${verse.surah}. Write a 2-3 sentence warm personal reflection connecting this to modern daily life.`,
              })
            }
            className="w-full bg-[#0a3d2e]/40 border border-[#c5a059]/20 rounded-2xl p-6 flex items-start gap-4 backdrop-blur-sm text-left"
          >
            <div className="gold-gradient rounded-full p-2.5 shadow-lg ring-4 ring-[#0a3d2e] flex-shrink-0">
              <svg className="h-5 w-5 text-[#062c21]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-playfair text-lg text-[#e9d19b] mb-1 italic">Royal Counsel</h4>
              <p className="text-sm text-[#e9d19b]/70 leading-relaxed font-light">
                {nudge || <LoadingDots />}
              </p>
            </div>
            <div className="self-center p-2 text-[#c5a059]">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
          </button>
        </section>
      </main>

      <BottomNav active="/" dark />
    </div>
  )
}
