import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { SURAHS } from '../data/content'

const FILTERS = ['All', 'Favorites', 'Makki', 'Madni']

export default function ReaderPage({ state }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const bookmarkedNums = new Set(state.bookmarks.filter((b) => b.num).map((b) => b.num))

  const filtered = SURAHS.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.ar.includes(search)) return false
    if (activeFilter === 'Favorites') return bookmarkedNums.has(s.num)
    if (activeFilter === 'Makki') return s.type === 'Makki'
    if (activeFilter === 'Madni') return s.type === 'Madni'
    return true
  })

  return (
    <div className="min-h-screen bg-[#002B24] text-[#e5e2db] font-manrope geometric-bg-reader md:pl-[256px] overflow-x-hidden">
      {/* Header */}
      <header className="fixed md:hidden top-0 left-0 right-0 z-50 bg-[#002B24] border-b border-[#D4AF37]/30 max-w-[430px] mx-auto">
        <div className="flex justify-between items-center w-full px-6 py-4">
          <button type="button" className="material-symbols-outlined text-[#FFD700] hover:bg-[#003D33] transition-colors p-2 rounded-full active:scale-95">
            menu
          </button>
          <button type="button" className="material-symbols-outlined text-[#FFD700] hover:bg-[#003D33] transition-colors p-2 rounded-full active:scale-95">
            search
          </button>
        </div>
      </header>

      <main className="pt-24 pb-32 max-w-[430px] mx-auto px-4 md:pt-16 md:px-12 md:max-w-7xl md:mx-0">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#003D33]/40 border-b-2 border-[#D4AF37]/50 focus:border-[#FFD700] text-[#E5E2DB] pl-12 pr-4 py-4 font-headline placeholder-[#A0A0A0]/60 transition-all outline-none rounded-xl"
              placeholder="Search Surah, Juz, or Ayah..."
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-3 overflow-x-auto pb-6 noscroll">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-full font-manrope text-sm font-semibold tracking-[0.05em] transition-colors whitespace-nowrap ${activeFilter === filter
                ? 'bg-[#FFD700] text-[#062c21] shadow-lg shadow-black/20'
                : 'border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10'
                }`}
            >
              {filter}
            </button>
          ))}
          {/* <button
            type="button"
            className="flex items-center gap-2 px-5 py-2 rounded-full border border-[#D4AF37]/40 text-[#D4AF37] font-manrope text-sm font-semibold tracking-[0.05em] hover:bg-[#D4AF37]/10 transition-colors whitespace-nowrap"
          >
            Topics
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </button> */}
        </div>

        {/* Surah Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filtered.map((surah) => {
            const isBookmarked = bookmarkedNums.has(surah.num)
            return (
              <div
                key={surah.num}
                onClick={() => navigate(`/surah/${surah.num}`)}
                className="gold-rimmed rounded-xl p-5 flex items-center justify-between group hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {/* Number Diamond */}
                  <div className="relative flex items-center justify-center w-12 h-12">
                    <div className="absolute inset-0 bg-[#D4AF37] opacity-10 rotate-45 rounded-sm" />
                    <span className="font-headline font-bold text-[#062c21] text-lg z-10">{surah.num}</span>
                  </div>
                  <div>
                    <h3 className="font-headline text-[#062c21] leading-tight text-lg font-semibold">{surah.name}</h3>
                    <p className="text-[#0a3d2e]/60 font-manrope text-xs uppercase tracking-widest mt-0.5 font-semibold">
                      {surah.meaning} • {surah.verses} Verses
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-arabic text-[#062c21] text-2xl" dir="rtl">{surah.ar}</span>
                  <span
                    className={`material-symbols-outlined text-xl ${isBookmarked ? 'fill-icon text-[#D4AF37]' : 'text-[#0a3d2e]/30'
                      }`}
                  >
                    bookmark_heart
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Decorative Divider */}
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
