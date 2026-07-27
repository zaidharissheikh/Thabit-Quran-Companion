import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { SURAHS } from '../data/content'
import { surahInJuz } from '../data/juz'

const FILTERS = ['All', 'Favorites', 'Makki', 'Madni']

function matchesSearch(surah, rawQuery) {
  const q = String(rawQuery || '').trim().toLowerCase()
  if (!q) return true

  const juzMatch = q.match(/^(?:juz|jews?|j)\s*(\d{1,2})$/i)
  if (juzMatch) {
    return surahInJuz(Number(juzMatch[1]), surah)
  }

  if (/^\d{1,3}$/.test(q)) {
    const n = Number(q)
    return surah.num === n || surah.verses === n || surahInJuz(n, surah)
  }

  const haystack = [
    surah.name,
    surah.ar,
    surah.meaning,
    surah.type,
    String(surah.num),
    `juz ${surah.juz}`,
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(q)
}

export default function ReaderPage({ state, onToggleFavoriteSurah }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const favoriteSurahIds = useMemo(() => {
    const fromPrefs = state.preferences?.favoriteSurahIds
    if (Array.isArray(fromPrefs)) {
      return new Set(fromPrefs.map(Number).filter((n) => n >= 1 && n <= 114))
    }
    // Fallback until the user sets chapter favorites explicitly
    return new Set(
      (state.bookmarks || []).map((b) => b.surahId).filter(Boolean),
    )
  }, [state.preferences?.favoriteSurahIds, state.bookmarks])

  const filtered = useMemo(() => {
    return SURAHS.filter((s) => {
      if (!matchesSearch(s, search)) return false
      if (activeFilter === 'Favorites') return favoriteSurahIds.has(s.num)
      if (activeFilter === 'Makki') return s.type === 'Makki'
      if (activeFilter === 'Madni') return s.type === 'Madni'
      return true
    })
  }, [search, activeFilter, favoriteSurahIds])

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] font-manrope geometric-bg-reader md:pl-[256px] overflow-x-hidden app-shell">
      <header className="fixed md:hidden top-0 left-0 right-0 z-50 bg-[var(--app-nav-bg)] border-b border-[var(--app-border)] max-w-[430px] mx-auto">
        <div className="flex justify-between items-center w-full px-6 py-4">
          <h1 className="font-headline text-[var(--app-accent)] tracking-[0.2em] uppercase text-sm">
            Read
          </h1>
          <span className="text-xs text-[var(--app-accent)]/70 font-manrope">
            {filtered.length} / 114
          </span>
        </div>
      </header>

      <main className="pt-24 pb-32 max-w-[430px] mx-auto px-4 md:pt-16 md:px-12 md:max-w-none md:mx-auto">
        <div className="mb-8">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--app-accent)]">
              search
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--app-surface)] border-b-2 border-[var(--app-border)] focus:border-[var(--app-accent)] text-[var(--app-text)] pl-12 pr-4 py-4 font-headline placeholder:text-[var(--app-text-muted)] transition-all outline-none rounded-xl"
              placeholder="Search Surah, Juz, or number…"
              aria-label="Search surahs"
            />
          </div>
          <p className="mt-2 text-[11px] text-[var(--app-text-muted)] font-manrope px-1">
            Try a name, Arabic, meaning, surah number, or &quot;juz 30&quot;.
          </p>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-6 noscroll">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-full font-manrope text-sm font-semibold tracking-[0.05em] transition-colors whitespace-nowrap ${
                activeFilter === filter
                  ? 'bg-[#FFD700] text-[#062c21] shadow-lg shadow-black/20'
                  : 'border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[var(--app-text-muted)]">
            <span className="material-symbols-outlined text-4xl mb-3 block opacity-50">
              search_off
            </span>
            <p className="font-headline text-lg">No surahs match</p>
            <p className="text-sm mt-1 font-manrope">Try another search or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filtered.map((surah) => {
              const isFavorite = favoriteSurahIds.has(surah.num)
              return (
                <button
                  key={surah.num}
                  type="button"
                  onClick={() => navigate(`/surah/${surah.num}`)}
                  className="gold-rimmed rounded-xl p-5 flex items-center justify-between group hover:shadow-xl transition-all text-left w-full"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
                      <div className="absolute inset-0 bg-[#D4AF37] opacity-10 rotate-45 rounded-sm" />
                      <span className="font-headline font-bold text-[#062c21] text-lg z-10">
                        {surah.num}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-headline text-[#062c21] leading-tight text-lg font-semibold truncate">
                        {surah.name}
                      </h3>
                      <p className="text-[#0a3d2e]/60 font-manrope text-xs uppercase tracking-widest mt-0.5 font-semibold truncate">
                        {surah.meaning} • {surah.verses} Verses • Juz {surah.juz}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0 ml-3">
                    <span className="font-arabic text-[#062c21] text-2xl" dir="rtl">
                      {surah.ar}
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      aria-pressed={isFavorite}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onToggleFavoriteSurah?.(surah.num)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          e.stopPropagation()
                          onToggleFavoriteSurah?.(surah.num)
                        }
                      }}
                      className={`material-symbols-outlined text-xl cursor-pointer hover:scale-110 transition-transform ${
                        isFavorite ? 'fill-icon text-[#D4AF37]' : 'text-[#0a3d2e]/30'
                      }`}
                    >
                      bookmark_heart
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent relative">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rotate-45 border border-[#D4AF37] bg-[#002B24]" />
          </div>
        </div>
      </main>

      <BottomNav active="/reader" />
    </div>
  )
}
