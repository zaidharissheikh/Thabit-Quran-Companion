import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import HeartRating from '../components/HeartRating'
import LoadingDots from '../components/LoadingDots'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function buildPoints(data) {
  const width = 700
  const height = 200
  const pt = 20
  const pb = 40
  const pl = 20
  const pr = 20

  const innerWidth = width - pl - pr
  const innerHeight = height - pt - pb
  const maxVerses = Math.max(...data.map((item) => item.verses), 1)

  const px = (index) => pl + (index / (data.length - 1 || 1)) * innerWidth
  const pyVerses = (verses) => pt + innerHeight - (verses / maxVerses) * innerHeight

  const versePoints = data.map((item, index) => ({ x: px(index), y: pyVerses(item.verses) }))

  return {
    pl,
    pt,
    innerWidth,
    innerHeight,
    versePoints,
    toPolyline: (points) => points.map((point) => `${point.x},${point.y}`).join(' '),
  }
}

export default function MomentumPage({ state, reflectionQuestion, onGenerateReflectionQuestion, onPostReflection, onRateHeart, onUpdateRamadanVerses }) {
  const [reflectionText, setReflectionText] = useState('')
  const [isEditingRamadan, setIsEditingRamadan] = useState(false)
  const [tempRamadanVerses, setTempRamadanVerses] = useState(state.ramadanVerses || 18)
  const navigate = useNavigate()

  const sessions = state.sessions.slice(-7)
  const graph = useMemo(() => buildPoints(sessions.length ? sessions : [{ verses: 0, heart: 0 }]), [sessions])
  
  const avgVerses = sessions.length
    ? Math.round(sessions.reduce((sum, item) => sum + item.verses, 0) / sessions.length)
    : 0

  const totalVersesThisWeek = sessions.reduce((sum, item) => sum + item.verses, 0)
  const totalVersesAllTime = state.sessions.reduce((sum, item) => sum + item.verses, 0)

  return (
    <div className="min-h-screen royal-bg text-[#e5e2db] font-manrope pb-24">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-[#082620] border-b-2 border-[#D4AF37]/20 max-w-[430px] mx-auto">
        <div className="flex items-center gap-4">
          <h1 className="font-headline text-center uppercase tracking-[0.2em] text-sm font-normal text-[#E9D7A5]">Statistics</h1>
        </div>
        <div className="flex items-center">
          <Link to="/settings" className="w-10 h-10 rounded-full border overflow-hidden border-[#D4AF37] bg-[#0a3d2e] flex items-center justify-center text-[#c5a059] font-bold hover:opacity-80 transition-opacity">
            {state.name[0].toUpperCase()}
          </Link>
        </div>
      </header>

      <main className="pt-24 max-w-[430px] mx-auto px-6 space-y-10">
        
        {/* Weekly Progress Graph Section */}
        <section className="cream-card rounded-xl p-6">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="font-headline text-xl text-[#004D40] font-semibold">Weekly Progress</h3>
              <p className="font-manrope text-sm text-[#004D40] font-semibold">Verses Read Per Day</p>
            </div>
            <div className="text-right">
              <span className="font-headline text-2xl text-[#D4AF37] font-semibold">{totalVersesThisWeek}</span>
              <p className="font-manrope text-sm text-[#004D40] font-semibold">This Week</p>
            </div>
          </div>
          
          <div className="h-40 w-full relative mt-6">
            <div className="absolute inset-0 flex flex-col justify-between py-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border-b border-[#002B24]/10 w-full h-0" />
              ))}
            </div>
            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 200">
              <defs>
                <filter height="140%" id="gold-glow" width="140%" x="-20%" y="-20%">
                  <feGaussianBlur result="blur" stdDeviation="3" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <path 
                d={`M ${graph.toPolyline(graph.versePoints)}`} 
                fill="none" 
                filter="url(#gold-glow)" 
                stroke="#D4AF37" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="4" 
              />
              {graph.versePoints.map((point, index) => (
                <circle key={index} cx={point.x} cy={point.y} fill="#D4AF37" r="8" stroke="#FDFBF7" strokeWidth="3" />
              ))}
            </svg>
            <div className="absolute -bottom-6 w-full flex justify-between px-2 font-manrope text-xs font-semibold text-[#004D40] opacity-80">
              {sessions.map((_, index) => (
                <span key={index}>{DAYS[index % 7]}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Ramadan vs Now Section */}
        <section className="cream-card rounded-xl p-6">
          <h3 className="font-manrope text-sm font-semibold uppercase tracking-[0.1em] mb-6 text-[#004D40]">Ramadan vs Now</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#F2EDE1] rounded-xl p-4 flex flex-col items-center text-center border border-[#D4AF37]/10 relative group">
              <p className="font-manrope text-[10px] font-semibold uppercase tracking-widest text-[#004D40] opacity-60 mb-2">Ramadan 1446</p>
              {isEditingRamadan ? (
                <input 
                  type="number" 
                  value={tempRamadanVerses} 
                  onChange={(e) => setTempRamadanVerses(e.target.value)}
                  onBlur={() => {
                    setIsEditingRamadan(false)
                    onUpdateRamadanVerses(tempRamadanVerses)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsEditingRamadan(false)
                      onUpdateRamadanVerses(tempRamadanVerses)
                    }
                  }}
                  autoFocus
                  className="font-headline text-4xl text-[#004D40] font-bold leading-none mb-1 w-20 text-center bg-transparent border-b border-[#004D40]/30 outline-none"
                />
              ) : (
                <div 
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={() => setIsEditingRamadan(true)}
                >
                  <p className="font-headline text-4xl text-[#004D40] font-bold leading-none mb-1">{state.ramadanVerses || 18}</p>
                  <span className="material-symbols-outlined text-[14px] text-[#004D40]/40 group-hover:text-[#D4AF37] transition-colors">edit</span>
                </div>
              )}
              <p className="font-manrope text-xs font-semibold text-[#004D40] opacity-70">verses / day</p>
            </div>
            <div className="bg-[#F2EDE1] rounded-xl p-4 flex flex-col items-center text-center border border-[#D4AF37]/10">
              <p className="font-manrope text-[10px] font-semibold uppercase tracking-widest text-[#004D40] opacity-60 mb-2">Now (Avg)</p>
              <p className="font-headline text-4xl text-[#004D40] font-bold leading-none mb-1">{avgVerses}</p>
              <p className="font-manrope text-xs font-semibold text-[#004D40] opacity-70">verses / day</p>
            </div>
          </div>
          <p className="font-manrope text-sm text-[#004D40] opacity-80 leading-relaxed italic text-center px-4">
            "Every verse today is a step toward the person you were in Ramadan."
          </p>
        </section>

        {/* Stat Grid */}
        <section className="grid grid-cols-2 gap-4">
          <div className="cream-card rounded-lg p-4 flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-[#D4AF37] mb-2 text-3xl">menu_book</span>
            <p className="font-headline text-2xl text-[#004D40] font-semibold">{totalVersesAllTime}</p>
            <p className="font-manrope text-[11px] font-bold uppercase tracking-tighter text-[#004D40]">Total Verses</p>
          </div>
          <div className="cream-card rounded-lg p-4 flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-[#D4AF37] mb-2 text-3xl">local_fire_department</span>
            <p className="font-headline text-2xl text-[#004D40] font-semibold">{state.streak}</p>
            <p className="font-manrope text-[11px] font-bold uppercase tracking-tighter text-[#004D40]">Day Streak</p>
          </div>
          <div className="cream-card rounded-lg p-4 flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-[#D4AF37] mb-2 text-3xl">library_books</span>
            <p className="font-headline text-2xl text-[#004D40] font-semibold">
              {new Set(state.bookmarks.map(b => b.num)).size}
            </p>
            <p className="font-manrope text-[11px] font-bold uppercase tracking-tighter text-[#004D40]">Surahs Bookmarked</p>
          </div>
          <div className="cream-card rounded-lg p-4 flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-[#D4AF37] mb-2 text-3xl">history_edu</span>
            <p className="font-headline text-2xl text-[#004D40] font-semibold">{state.reflections?.length || 0}</p>
            <p className="font-manrope text-[11px] font-bold uppercase tracking-tighter text-[#004D40]">Reflections</p>
          </div>
        </section>

        {/* Reflection & Heart Rate Section */}
        <section className="cream-card rounded-xl p-6">
          <h3 className="font-manrope text-sm font-semibold uppercase tracking-[0.1em] mb-4 text-[#004D40] text-center">
            How does your heart feel now?
          </h3>
          <div className="mb-6 flex justify-center">
            <HeartRating value={state.heartRating} onChange={onRateHeart} />
          </div>
          
          <div className="pt-6 border-t border-[#D4AF37]/20">
            <p className="font-manrope text-[10px] font-bold uppercase tracking-[.15em] text-[#D4AF37] mb-2">Weekly Reflection</p>
            <p className="min-h-14 font-headline text-lg italic leading-relaxed text-[#004D40]/80 mb-4">
              {reflectionQuestion ? reflectionQuestion : <LoadingDots />}
            </p>
            <textarea
              rows="3"
              value={reflectionText}
              onChange={(event) => setReflectionText(event.target.value)}
              className="w-full resize-none rounded-xl border border-[#D4AF37]/30 bg-[#F2EDE1] px-4 py-3 text-sm text-[#004D40] outline-none transition placeholder:text-[#004D40]/40 focus:border-[#D4AF37]"
              placeholder="Write your reflection here..."
            />
            <div className="flex gap-2 mt-4 justify-end">
              <button
                type="button"
                onClick={() => onGenerateReflectionQuestion()}
                className="flex items-center gap-1.5 text-sm font-semibold text-[#004D40]/60 transition hover:text-[#004D40]"
              >
                <span className="material-symbols-outlined text-lg">refresh</span>Refresh
              </button>
              <button
                type="button"
                onClick={() => {
                  onPostReflection(reflectionText)
                  setReflectionText('')
                }}
                className="flex items-center gap-1.5 text-sm font-semibold text-[#D4AF37] transition hover:text-[#b08c20] ml-4"
              >
                <span className="material-symbols-outlined text-lg">send</span>Post Reflection
              </button>
            </div>
          </div>
        </section>

        {/* Suggested Surah Card */}
        <section className="pb-8">
          <h4 className="font-headline text-sm uppercase tracking-[0.25em] mb-4 flex items-center gap-2 text-[#FDFBF7]">
            Recommended for You
          </h4>
          <div onClick={() => navigate('/surah/67')} className="cream-card rounded-xl p-6 flex flex-col items-center gap-6 overflow-hidden group cursor-pointer hover:shadow-xl transition-all">
            <div className="relative">
              <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-[#FFF0BE] via-[#E9C349] to-[#D4AF37]">
                <span className="material-symbols-outlined text-3xl text-[#004D40]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
            </div>
            <div className="text-center">
              <div className="flex flex-col items-center gap-2 mb-2">
                <h5 className="font-headline text-2xl text-[#D4AF37] font-semibold">Surah Al-Mulk</h5>
                <span className="inline-flex items-center px-3 py-1 rounded-full border border-[#D4AF37] text-[#004D40] text-[10px] font-bold uppercase tracking-widest bg-[#FDFBF7]">Featured</span>
              </div>
              <p className="font-manrope text-sm text-[#004D40] max-w-[250px] mx-auto mt-3 font-medium">
                "The Sovereignty". Recommended to read every night for protection and blessings.
              </p>
            </div>
            <button className="bg-gradient-to-br from-[#FFF0BE] via-[#E9C349] to-[#D4AF37] px-6 py-3 rounded-full font-manrope text-sm uppercase tracking-widest transition-all shadow-lg font-bold text-[#004D40] w-full">
              Read Now
            </button>
          </div>
        </section>

      </main>

      <BottomNav active="/momentum" />
    </div>
  )
}
