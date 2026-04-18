import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import HeartRating from '../components/HeartRating'
import LoadingDots from '../components/LoadingDots'

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function buildPoints(data) {
  const width = 300
  const height = 140
  const pt = 10
  const pb = 20
  const pl = 8
  const pr = 8

  const innerWidth = width - pl - pr
  const innerHeight = height - pt - pb
  const maxVerses = Math.max(...data.map((item) => item.verses), 1)

  const px = (index) => pl + (index / (data.length - 1 || 1)) * innerWidth
  const pyVerses = (verses) => pt + innerHeight - (verses / maxVerses) * innerHeight
  const pyHeart = (heart) => pt + innerHeight - ((heart || 0) / 5) * innerHeight

  const versePoints = data.map((item, index) => ({ x: px(index), y: pyVerses(item.verses) }))
  const heartPoints = data.map((item, index) => ({ x: px(index), y: pyHeart(item.heart) }))

  return {
    pl,
    pt,
    innerWidth,
    innerHeight,
    versePoints,
    heartPoints,
    polygon: `${pl},${pt + innerHeight} ${versePoints.map((point) => `${point.x},${point.y}`).join(' ')} ${pl + innerWidth},${pt + innerHeight}`,
    toPolyline: (points) => points.map((point) => `${point.x},${point.y}`).join(' '),
  }
}

export default function MomentumPage({ state, reflectionQuestion, onGenerateReflectionQuestion, onPostReflection, onRateHeart }) {
  const [reflectionText, setReflectionText] = useState('')

  const sessions = state.sessions.slice(-7)
  const graph = useMemo(() => buildPoints(sessions.length ? sessions : [{ verses: 0, heart: 0 }]), [sessions])
  const avgVerses = sessions.length
    ? Math.round(sessions.reduce((sum, item) => sum + item.verses, 0) / sessions.length)
    : 0
  const alignPct = Math.min(100, Math.round((avgVerses / 18) * 100))

  return (
    <div className="min-h-screen bg-surface">
      <header className="fixed top-0 z-50 flex h-20 w-full max-w-[430px] items-center justify-between border-b border-outline-variant/20 bg-[#FFF9EF]/92 px-6 backdrop-blur-md">
        <Link to="/" className="material-symbols-outlined text-primary transition hover:opacity-70">
          arrow_back
        </Link>
        <h1 className="font-serif text-xl font-bold text-primary">ثابت</h1>
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/20 bg-surface-container-high text-sm font-bold text-primary">
          {state.name[0].toUpperCase()}
        </div>
      </header>

      <main className="noscroll mx-auto max-h-[100dvh] max-w-lg space-y-8 overflow-y-auto px-5 pb-32 pt-24">
        <section className="space-y-2 pt-2 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[.2em] text-secondary">Your Spiritual State</p>
          <h2 className="font-serif text-4xl text-on-surface">Momentum of Soul</h2>
          <p className="mx-auto max-w-xs text-sm leading-relaxed text-on-surface-variant/70">
            Take a breath. Reflect on the movement of your heart this week.
          </p>
        </section>

        <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0D2B1F] p-7 shadow-2xl">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <h3 className="font-serif text-xl text-[#e6c364]">Weekly Flow</h3>
              <p className="mt-1 text-xs text-white/40">Consistency in Reflection</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-[#ffe08f]">{alignPct}%</span>
              <p className="text-[10px] uppercase tracking-widest text-white/40">Alignment</p>
            </div>
          </div>
          <div className="relative h-44 w-full">
            <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 300 160" preserveAspectRatio="none">
              <defs>
                <linearGradient id="ga" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#e6c364" stopOpacity=".18" />
                  <stop offset="100%" stopColor="#755b00" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1={graph.pl} y1={graph.pt} x2={graph.pl} y2={graph.pt + graph.innerHeight} stroke="rgba(255,255,255,.06)" strokeWidth="1" />
              <line
                x1={graph.pl}
                y1={graph.pt + graph.innerHeight}
                x2={graph.pl + graph.innerWidth}
                y2={graph.pt + graph.innerHeight}
                stroke="rgba(255,255,255,.06)"
                strokeWidth="1"
              />
              <line
                x1={graph.pl}
                y1={graph.pt + graph.innerHeight / 2}
                x2={graph.pl + graph.innerWidth}
                y2={graph.pt + graph.innerHeight / 2}
                stroke="rgba(255,255,255,.04)"
                strokeWidth="1"
                strokeDasharray="4,3"
              />
              <polygon points={graph.polygon} fill="url(#ga)" />
              <polyline
                points={graph.toPolyline(graph.versePoints)}
                fill="none"
                stroke="#e6c364"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points={graph.toPolyline(graph.heartPoints)}
                fill="none"
                stroke="#C4856A"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="5,3"
              />
              {graph.versePoints.map((point) => (
                <circle key={`v-${point.x}`} cx={point.x} cy={point.y} r="3.5" fill="#e6c364" opacity=".9" />
              ))}
              {graph.heartPoints.map((point) => (
                <circle key={`h-${point.x}`} cx={point.x} cy={point.y} r="2.5" fill="#C4856A" opacity=".8" />
              ))}
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
              {sessions.map((_, index) => (
                <span key={`${DAYS[index % 7]}-${index}`} className="text-[10px] text-white/30">
                  {DAYS[index % 7]}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-2 flex gap-4">
            <div className="flex items-center gap-1.5 text-[10px] text-white/40">
              <div className="h-0.5 w-4 bg-[#e6c364]" />Verses
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-white/40">
              <div className="h-0.5 w-4 border-t border-dashed border-[#C4856A] bg-[#C4856A]" />Heart
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-outline-variant/10 bg-surface-container-low p-6">
          <p className="text-[10px] font-medium uppercase tracking-[.2em] text-secondary">Ramadan vs Now</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-5 text-center">
              <p className="mb-1 text-[10px] uppercase tracking-widest text-primary/60">Ramadan 1446</p>
              <p className="text-3xl font-bold text-primary">18</p>
              <p className="mt-1 text-xs text-primary/60">verses / day</p>
            </div>
            <div className="rounded-2xl bg-surface-container p-5 text-center">
              <p className="mb-1 text-[10px] uppercase tracking-widest text-on-surface-variant/60">Today</p>
              <p className="text-3xl font-bold text-on-surface">{avgVerses}</p>
              <p className="mt-1 text-xs text-on-surface-variant/60">verses / day</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-on-surface-variant/60">
            Every verse today is a step toward the person you were in Ramadan.
          </p>
        </section>

        <section className="space-y-6 rounded-3xl border border-outline-variant/10 bg-surface-container-low p-8 text-center">
          <h3 className="text-sm font-medium tracking-wide text-on-surface-variant">How does your heart feel now?</h3>
          <HeartRating value={state.heartRating} onChange={onRateHeart} />
        </section>

        <section className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-outline-variant/10 bg-surface-container p-5 transition-all duration-300 hover:bg-surface-bright">
            <div className="mb-4 flex items-start justify-between">
              <span className="material-symbols-outlined text-secondary">auto_awesome</span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-on-secondary">Insight</span>
            </div>
            <h4 className="mb-1 font-serif text-base">Steady Growth</h4>
            <p className="text-xs leading-relaxed text-on-surface-variant">Your consistency has been building this week.</p>
          </div>
          <div className="mt-4 rounded-2xl border border-outline-variant/10 bg-surface-container p-5 transition-all duration-300 hover:bg-surface-bright">
            <div className="mb-4 flex items-start justify-between">
              <span className="material-symbols-outlined text-tertiary">menu_book</span>
              <span className="rounded-full bg-tertiary px-2 py-0.5 text-[10px] font-bold text-on-tertiary">Suggested</span>
            </div>
            <h4 className="mb-1 font-serif text-base">Surah Al-Inshirah</h4>
            <p className="text-xs leading-relaxed text-on-surface-variant">With every hardship comes ease.</p>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-outline-variant/10 bg-surface-container-low p-6">
          <p className="text-[10px] font-medium uppercase tracking-[.15em] text-secondary">Weekly Reflection</p>
          <p className="min-h-14 font-serif text-lg italic leading-relaxed text-on-surface/70">
            {reflectionQuestion ? reflectionQuestion : <LoadingDots />}
          </p>
          <textarea
            rows="3"
            value={reflectionText}
            onChange={(event) => setReflectionText(event.target.value)}
            className="w-full resize-none rounded-xl border border-outline-variant/20 bg-surface-container px-4 py-3 text-sm text-on-surface outline-none transition placeholder:text-on-surface-variant/40 focus:border-primary/40"
            placeholder="Write your reflection here..."
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onGenerateReflectionQuestion()}
              className="flex items-center gap-2 text-sm font-medium text-on-surface-variant transition hover:opacity-70"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>Refresh prompt
            </button>
            <button
              type="button"
              onClick={() => {
                onPostReflection(reflectionText)
                setReflectionText('')
              }}
              className="flex items-center gap-2 text-sm font-medium text-primary transition hover:opacity-70"
            >
              <span className="material-symbols-outlined text-lg">send</span>Post Reflection
            </button>
          </div>
        </section>

        <section className="border-t border-outline-variant/20 py-10 text-center">
          <p className="font-serif text-xl italic leading-loose text-on-surface/50">
            "Hearts find peace only in the remembrance of the Divine."
          </p>
        </section>
      </main>

      <BottomNav active="/momentum" />
    </div>
  )
}
