import { useMemo, useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import HeartRating from '../components/HeartRating'
import { AvatarBadge } from '../assets/avatars'
import { getMoodStickers } from '../assets/moodStickers'
import { HEART_OPTIONS } from '../data/content'

import { localDateKey } from '../lib/localDay'
import moodVerses from '../data/moodVerses.json'
import MoodCalendar from '../components/MoodCalendar'

function buildWeekDays(sessions) {
  const byDate = new Map((sessions || []).map((s) => [s.date, s.verses || 0]))
  const days = []
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date()
    d.setHours(12, 0, 0, 0)
    d.setDate(d.getDate() - i)
    const key = localDateKey(d)
    days.push({
      date: key,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      verses: byDate.get(key) || 0,
    })
  }
  return days
}

export default function MomentumPage({
  state,
  avatarId,
  onPostReflection: _onPostReflection,
  onRateHeart,
  onUpdateRamadanVerses,
  onUpdateStickerPack: _onUpdateStickerPack,
}) {

  const [isEditingRamadan, setIsEditingRamadan] = useState(false)
  const [tempRamadanVerses, setTempRamadanVerses] = useState(
    String(state.ramadanVerses ?? 0),
  )
  const [detail, setDetail] = useState(null)
  const [verseIdx, setVerseIdx] = useState(0)
  const navigate = useNavigate()

  // Reset verse index whenever mood changes
  const prevRating = useRef(state.heartRating)
  useEffect(() => {
    if (prevRating.current !== state.heartRating) {
      setVerseIdx(0)
      prevRating.current = state.heartRating
    }
  }, [state.heartRating])

  const weekDays = useMemo(() => buildWeekDays(state.sessions), [state.sessions])
  const dailyGoal = Math.max(1, Number(state.goal) || 10)
  const maxDay = Math.max(...weekDays.map((d) => d.verses), 1)
  const daysActive = weekDays.filter((d) => d.verses > 0).length
  const totalVersesThisWeek = weekDays.reduce((sum, d) => sum + d.verses, 0)
  const goalDaysMet = weekDays.filter((d) => d.verses >= dailyGoal).length
  const avgVerses = daysActive
    ? Math.round(totalVersesThisWeek / daysActive)
    : 0
  const totalVersesAllTime = (state.sessions || []).reduce(
    (sum, item) => sum + (item.verses || 0),
    0,
  )
  const bookmarkedSurahCount = new Set(
    (state.bookmarks || []).map((b) => b.surahId).filter(Boolean),
  ).size
  const reflectionsCount = state.notesTotal ?? state.journals?.length ?? 0
  const ramadanVerses = state.ramadanVerses ?? 0

  const currentMoodOption = HEART_OPTIONS.find((o) => o.value === state.heartRating) || null

  const versePool = useMemo(() => {
    const ratingStr = state.heartRating ? String(state.heartRating) : null
    if (!ratingStr) return []
    return moodVerses[ratingStr] || []
  }, [state.heartRating])

  const recommendedVerse = versePool.length > 0
    ? versePool[verseIdx % versePool.length]
    : null

  const weekSummary =
    totalVersesThisWeek === 0
      ? 'You have not logged any verses this week yet. Open Read and mark a session when you finish.'
      : daysActive === 1
        ? `You read ${totalVersesThisWeek} verse${totalVersesThisWeek === 1 ? '' : 's'} on one day this week. A little each day builds the habit.`
        : `You read ${totalVersesThisWeek} verses across ${daysActive} days this week. Keep the rhythm going.`

  function openDetail(kind) {
    setDetail(kind)
  }

  function saveRamadan() {
    setIsEditingRamadan(false)
    onUpdateRamadanVerses(tempRamadanVerses)
  }

  return (
    <div className="min-h-screen royal-bg text-[var(--app-text)] font-manrope pb-24 md:pl-[256px] overflow-x-hidden app-shell bg-[var(--app-bg)]">
      <header className="fixed md:hidden top-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-[#082620] border-b-2 border-[#D4AF37]/20 max-w-[430px] mx-auto">
        <div className="flex items-center gap-4">
          <h1 className="font-headline text-center uppercase tracking-[0.2em] text-sm font-normal text-[#E9D7A5]">
            Statistics
          </h1>
        </div>
        <Link
          to="/settings"
          className="w-10 h-10 rounded-full border overflow-hidden border-[#D4AF37] bg-[#0a3d2e] hover:opacity-80 transition-opacity"
          aria-label="Open settings"
        >
          <AvatarBadge id={avatarId} className="w-full h-full" alt={state.name} />
        </Link>
      </header>

      <main className="pt-20 max-w-[430px] mx-auto px-5 space-y-5 md:space-y-0 md:pt-16 md:px-12 md:max-w-none md:mx-auto md:grid md:grid-cols-2 md:gap-8 flex flex-col"
        style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {/* This week - bars scaled to daily goal */}
        <section className="cream-card rounded-xl p-6 md:col-span-2">
          <div className="flex justify-between items-start gap-4 mb-2">
            <div>
              <h3 className="font-headline text-xl text-[#004D40] font-semibold">
                Your week in verses
              </h3>
              <p className="font-manrope text-sm text-[#004D40]/70 mt-1">
                How much Qur&apos;an you logged each day
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="font-headline text-2xl text-[#D4AF37] font-semibold">
                {totalVersesThisWeek}
              </span>
              <p className="font-manrope text-xs text-[#004D40] font-semibold uppercase tracking-wide">
                This week
              </p>
            </div>
          </div>

          <p className="font-manrope text-sm text-[#004D40]/85 leading-relaxed mb-3 italic">
            {weekSummary}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-[11px] font-manrope text-[#004D40]/75">
            <p>
              <span className="font-semibold text-[#004D40]">Full bar</span>
              {' = '}
              daily goal of{' '}
              <span className="font-bold text-[#8e6e33]">{dailyGoal} verses</span>
            </p>
            <p className="text-[#004D40]/60">
              Goal met {goalDaysMet}/7 days
              {maxDay > dailyGoal ? ` · Peak day ${maxDay}` : ''}
            </p>
          </div>

          <div className="relative flex items-end justify-between gap-2 h-44 px-1">
            {weekDays.map((day) => {
              const metGoal = day.verses >= dailyGoal
              const heightPct =
                day.verses <= 0
                  ? 4
                  : Math.min(100, Math.max(8, Math.round((day.verses / dailyGoal) * 100)))
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                  <span
                    className={`text-[11px] font-bold tabular-nums leading-none ${
                      metGoal ? 'text-[#8e6e33]' : 'text-[#004D40]'
                    }`}
                    title={
                      day.verses === 0
                        ? 'No verses logged'
                        : metGoal
                          ? `Goal met (${day.verses}/${dailyGoal})`
                          : `${day.verses} of ${dailyGoal} toward goal`
                    }
                  >
                    {day.verses}
                    {metGoal && day.verses > 0 ? (
                      <span className="sr-only"> (goal met)</span>
                    ) : null}
                  </span>
                  <div className="w-full max-w-[36px] h-28 rounded-full bg-[#004D40]/8 flex items-end overflow-hidden relative">
                    <div
                      className={`w-full rounded-full transition-all duration-500 ${
                        metGoal
                          ? 'bg-gradient-to-t from-[#af8d11] to-[#ffe088]'
                          : 'bg-gradient-to-t from-[#8e6e33]/80 to-[#D4AF37]/70'
                      }`}
                      style={{ height: `${heightPct}%` }}
                      title={`${day.label}: ${day.verses} / ${dailyGoal} verses`}
                    />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#004D40]/60">
                    {day.label}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Ramadan vs Now */}
        <section className="cream-card rounded-xl p-6">
          <h3 className="font-manrope text-sm font-semibold uppercase tracking-[0.1em] mb-6 text-[#004D40]">
            Ramadan vs Now
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#F2EDE1] rounded-xl p-4 flex flex-col items-center text-center border border-[#D4AF37]/10 relative group">
              <p className="font-manrope text-[10px] font-semibold uppercase tracking-widest text-[#004D40] opacity-60 mb-2">
                Ramadan goal
              </p>
              {isEditingRamadan ? (
                <input
                  type="number"
                  min={0}
                  value={tempRamadanVerses}
                  onChange={(e) => setTempRamadanVerses(e.target.value)}
                  onBlur={saveRamadan}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveRamadan()
                  }}
                  autoFocus
                  className="font-headline text-4xl text-[#004D40] font-bold leading-none mb-1 w-20 text-center bg-transparent border-b border-[#004D40]/30 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              ) : (
                <button
                  type="button"
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={() => {
                    setTempRamadanVerses(String(ramadanVerses))
                    setIsEditingRamadan(true)
                  }}
                >
                  <p className="font-headline text-4xl text-[#004D40] font-bold leading-none mb-1">
                    {ramadanVerses}
                  </p>
                  <span className="material-symbols-outlined text-[14px] text-[#004D40]/40 group-hover:text-[#D4AF37] transition-colors">
                    edit
                  </span>
                </button>
              )}
              <p className="font-manrope text-xs font-semibold text-[#004D40] opacity-70">
                verses / day
              </p>
            </div>
            <div className="bg-[#F2EDE1] rounded-xl p-4 flex flex-col items-center text-center border border-[#D4AF37]/10">
              <p className="font-manrope text-[10px] font-semibold uppercase tracking-widest text-[#004D40] opacity-60 mb-2">
                Now (Avg)
              </p>
              <p className="font-headline text-4xl text-[#004D40] font-bold leading-none mb-1">
                {avgVerses}
              </p>
              <p className="font-manrope text-xs font-semibold text-[#004D40] opacity-70">
                verses / day
              </p>
            </div>
          </div>
          <p className="font-manrope text-sm text-[#004D40] opacity-80 leading-relaxed italic text-center px-4">
            {ramadanVerses === 0 && avgVerses === 0
              ? 'Set your Ramadan pace (tap the number), then log reading - both sides will grow with you.'
              : '"Every verse today is a step toward the person you were in Ramadan."'}
          </p>
        </section>

        {/* Stat cards */}
        <section className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => openDetail('verses')}
            className="cream-card rounded-lg p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow"
          >
            <i className="fa-solid fa-book-quran text-[#D4AF37] mb-2 text-3xl" aria-hidden />
            <p className="font-headline text-2xl text-[#004D40] font-semibold">
              {totalVersesAllTime}
            </p>
            <p className="font-manrope text-[11px] font-bold uppercase tracking-tighter text-[#004D40]">
              Total Verses
            </p>
            <span className="mt-2 text-[10px] text-[#8e6e33] font-semibold uppercase tracking-wide">
              Tap for details
            </span>
          </button>

          <button
            type="button"
            onClick={() => openDetail('streak')}
            className="cream-card rounded-lg p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow"
          >
            <i className="fa-solid fa-fire text-[#D4AF37] mb-2 text-3xl" aria-hidden />
            <p className="font-headline text-2xl text-[#004D40] font-semibold">{state.streak}</p>
            <p className="font-manrope text-[11px] font-bold uppercase tracking-tighter text-[#004D40]">
              Day Streak
            </p>
            <span className="mt-2 text-[10px] text-[#8e6e33] font-semibold uppercase tracking-wide">
              Tap for details
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/bookmarks')}
            className="cream-card rounded-lg p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow"
          >
            <i className="fa-solid fa-bookmark text-[#D4AF37] mb-2 text-3xl" aria-hidden />
            <p className="font-headline text-2xl text-[#004D40] font-semibold">
              {bookmarkedSurahCount}
            </p>
            <p className="font-manrope text-[11px] font-bold uppercase tracking-tighter text-[#004D40]">
              Surahs Bookmarked
            </p>
            <span className="mt-2 text-[10px] text-[#8e6e33] font-semibold uppercase tracking-wide">
              View all
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/journal')}
            className="cream-card rounded-lg p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow"
          >
            <i className="fa-solid fa-marker text-[#D4AF37] mb-2 text-3xl" aria-hidden />
            <p className="font-headline text-2xl text-[#004D40] font-semibold">
              {reflectionsCount}
            </p>
            <p className="font-manrope text-[11px] font-bold uppercase tracking-tighter text-[#004D40]">
              Reflections
            </p>
            <span className="mt-2 text-[10px] text-[#8e6e33] font-semibold uppercase tracking-wide">
              Open journal
            </span>
          </button>
        </section>

        {/* Heart + Mood Calendar - full width, tight padding */}
        <section className="cream-card rounded-xl px-3 sm:px-4 pt-5 pb-3 md:col-span-2">
          <h3 className="font-manrope text-sm font-semibold uppercase tracking-[0.1em] mb-2 text-[#004D40] text-center">
            How does your heart feel now?
          </h3>
          <p className="font-manrope text-[11px] text-[#004D40]/65 text-center mb-3 leading-relaxed px-2">
            You can change mood stickers anytime in{' '}
            <button
              type="button"
              onClick={() => navigate('/settings/display')}
              className="text-[#8e6e33] font-semibold underline underline-offset-2 hover:opacity-80"
            >
              Settings → Display
            </button>
            .
          </p>

          <div className="flex justify-center mb-3 border-b border-[#D4AF37]/20 pb-3">
            <HeartRating value={state.heartRating} onChange={onRateHeart} stickerPack={state.preferences?.stickerPack} />
          </div>
          <MoodCalendar moodHistory={state.moodHistory} stickerPack={state.preferences?.stickerPack} />
        </section>

        <section className="pb-8 md:col-span-2">
          <h4 className="font-headline text-sm uppercase tracking-[0.25em] mb-4 flex items-center gap-2 text-[#FDFBF7]">
            Recommended for You
          </h4>

          {/* Empty state - no mood set */}
          {!state.heartRating && (
            <div className="cream-card rounded-xl p-6 flex flex-col items-center gap-3 text-center">
              <div className="flex gap-2">
                {HEART_OPTIONS.map((o) => (
                  <img
                    key={o.value}
                    src={getMoodStickers(state.preferences?.stickerPack)[o.stickerKey]}
                    alt={o.label}
                    className="w-8 h-8 object-contain grayscale opacity-40"
                    draggable={false}
                  />
                ))}
              </div>
              <p className="font-manrope text-sm text-[#004D40]/70 leading-relaxed">
                Rate how your heart feels above to receive a personalised āyah.
              </p>
              <span className="material-symbols-outlined text-[#D4AF37] animate-bounce text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                arrow_upward
              </span>
            </div>
          )}

          {/* Verse card */}
          {recommendedVerse && currentMoodOption && (
            <div className="cream-card rounded-xl p-6 flex flex-col items-center gap-5 overflow-hidden shadow-lg">
              {/* Mood chip */}
              <div className="flex items-center gap-2 self-start bg-[#004D40]/8 rounded-full px-3 py-1.5">
                <img
                  src={getMoodStickers(state.preferences?.stickerPack)[currentMoodOption.stickerKey]}
                  alt={currentMoodOption.label}
                  className="w-5 h-5 object-contain"
                  draggable={false}
                />
                <span className="font-manrope text-[11px] font-bold uppercase tracking-wider text-[#004D40]/70">
                  For your{' '}
                  <span className="text-[#8e6e33]">{currentMoodOption.label}</span>{' '}heart
                </span>
              </div>

              <div className="relative w-full text-center">
                <p className="font-headline text-[#D4AF37] font-semibold mb-4 text-lg">
                  {recommendedVerse.ref}
                </p>
                <div
                  className="font-arabic text-[#004D40] text-[1.4rem] leading-relaxed mb-5 px-2"
                  dir="rtl"
                >
                  {recommendedVerse.ar}
                </div>
                <div className="w-8 h-px bg-[#D4AF37]/40 mx-auto mb-4" />
                <p className="font-manrope text-sm text-[#004D40]/90 italic max-w-sm mx-auto leading-snug">
                  {recommendedVerse.en}
                </p>
              </div>

              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setVerseIdx((i) => i + 1)}
                  className="flex items-center justify-center gap-1.5 border border-[#D4AF37]/50 text-[#8e6e33] rounded-full px-4 py-2.5 font-manrope text-xs font-bold uppercase tracking-wider hover:bg-[#D4AF37]/10 transition-colors shrink-0"
                  title="Show another verse"
                >
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                  New verse
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/surah/${recommendedVerse.surahNum}#ayah-${recommendedVerse.ayahNum}`)}
                  className="flex-1 bg-gradient-to-br from-[#FFF0BE] via-[#E9C349] to-[#D4AF37] px-4 py-2.5 rounded-full font-manrope text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg font-bold text-[#004D40]"
                >
                  Read Context
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {detail ? (
        <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#f9f7f2] text-[#004d40] p-6 shadow-2xl">
            {detail === 'verses' ? (
              <>
                <h3 className="font-headline text-2xl font-semibold mb-2">Your verse count</h3>
                <p className="text-sm text-[#004d40]/70 mb-5 font-manrope">
                  Verses count when you finish an ayah on Play, or tap Mark read on a surah ayah.
                </p>
                <ul className="space-y-3 font-manrope text-sm">
                  <li className="flex justify-between border-b border-[#004d40]/10 pb-2">
                    <span>All time</span>
                    <strong>{totalVersesAllTime}</strong>
                  </li>
                  <li className="flex justify-between border-b border-[#004d40]/10 pb-2">
                    <span>Today</span>
                    <strong>{state.versesReadToday || 0}</strong>
                  </li>
                  <li className="flex justify-between border-b border-[#004d40]/10 pb-2">
                    <span>This week</span>
                    <strong>{totalVersesThisWeek}</strong>
                  </li>
                  <li className="flex justify-between">
                    <span>Daily goal</span>
                    <strong>{state.goal || 0}</strong>
                  </li>
                </ul>
              </>
            ) : (
              <>
                <h3 className="font-headline text-2xl font-semibold mb-2">Day streak</h3>
                <p className="text-sm text-[#004d40]/70 mb-5 font-manrope">
                  Your streak grows when you log reading on consecutive days. Miss a day and it
                  resets - start again gently.
                </p>
                <p className="font-headline text-5xl text-[#D4AF37] font-bold mb-2">
                  {state.streak}
                </p>
                <p className="text-sm font-manrope text-[#004d40]/80">
                  {state.streak === 0
                    ? "No streak yet. Mark today's reading on Home to begin."
                    : state.streak === 1
                      ? 'One day so far - come back tomorrow to make it two.'
                      : `${state.streak} days in a row. MashaAllah - keep showing up.`}
                </p>
              </>
            )}
            <button
              type="button"
              onClick={() => setDetail(null)}
              className="mt-6 w-full py-3 rounded-full font-bold text-[#3c2f00]"
              style={{ backgroundColor: '#e9c349' }}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

      <BottomNav active="/momentum" />
    </div>
  )
}
