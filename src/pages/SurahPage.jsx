import { Link, useParams, useNavigate } from 'react-router-dom'
import { FATIHA, SURAHS } from '../data/content'

export default function SurahPage({ state, onBookmarkVerse, onReflectVerse }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const surahNum = Number(id)
  const surah = SURAHS.find((s) => s.num === surahNum) || SURAHS[0]

  // For now only Al-Fatihah has verse data
  const verses = surahNum === 1 ? FATIHA : []

  return (
    <div className="min-h-screen bg-emerald-950 font-manrope text-[#e5e2db] royal-pattern pb-24 md:pl-[256px] overflow-x-hidden">
      {/* Header */}
      <header className="fixed md:hidden top-0 w-full z-50 flex items-center justify-between px-4 h-16 bg-emerald-950/95 max-w-[430px] mx-auto">
        <Link
          to="/reader"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-emerald-900/50 transition-colors"
        >
          <span className="material-symbols-outlined text-[#ffe088]">arrow_back</span>
        </Link>
        <h1 className="font-headline text-2xl font-semibold text-[#ffe088] tracking-wide">{surah.name}</h1>
        <button
          type="button"
          onClick={() => navigate(`/play/${surahNum}/1`)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-emerald-900/50 transition-colors"
        >
          <span className="material-symbols-outlined text-[#ffe088]">volume_up</span>
        </button>
      </header>

      <main className="pt-24 px-6 max-w-[430px] mx-auto space-y-8 md:pt-16 md:px-12 md:max-w-5xl md:mx-auto">
        {/* Surah Title */}
        <div className="text-center space-y-6">
          <div className="inline-block relative py-8">
            <div className="absolute inset-0 blur-[80px] bg-amber-500/10 rounded-full scale-150" />
            <h1 className="relative font-cormorant text-6xl gold-gradient-text font-bold tracking-widest py-4 uppercase">
              {surah.name}
            </h1>
          </div>
          {/* Diamond divider */}
          <div className="flex items-center justify-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
            <div className="w-3 h-3 rotate-45 border border-amber-500" />
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-500/50 to-transparent" />
          </div>
        </div>

        {/* Verses */}
        {verses.length > 0 ? (
          <div className="space-y-10">
            {verses.map((verse) => {
              const bookmarked = state.bookmarks.some((b) => b.num === verse.num)
              return (
                <div key={verse.num} className="space-y-4">
                  <div className="cream-card p-6 rounded-2xl space-y-6">
                    {/* Arabic + Number */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="ayah-medallion w-10 h-10 rounded-full flex items-center justify-center text-emerald-950 font-bold shrink-0">
                        {verse.num}
                      </div>
                      <p className="font-arabic text-right text-emerald-950 text-[28px] leading-[44px] font-medium" dir="rtl">
                        {verse.ar}
                      </p>
                    </div>
                    {/* Translation */}
                    <div className="space-y-2">
                      <p className="font-manrope text-base text-emerald-900 font-medium">{verse.en}</p>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-900/10">
                      <button
                        type="button"
                        onClick={() => onBookmarkVerse(verse)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-amber-700/80 hover:bg-amber-100 transition-colors text-sm"
                      >
                        <span className={`material-symbols-outlined text-[20px] ${bookmarked ? 'fill-icon' : ''}`}>bookmark</span>
                        <span className="font-manrope text-sm font-semibold tracking-[0.05em]">
                          {bookmarked ? 'Saved' : 'Bookmark'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onReflectVerse({
                            ref: `${surah.name} verse ${verse.num}`,
                            prompt: `User read: "${verse.ar}" meaning "${verse.en}". Write a warm 2-sentence reflection to apply today.`,
                          })
                        }
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-amber-700/80 hover:bg-amber-100 transition-colors text-sm"
                      >
                        <span className="material-symbols-outlined text-[20px]">psychology</span>
                        <span className="font-manrope text-sm font-semibold tracking-[0.05em]">Reflect</span>
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
            <span className="material-symbols-outlined text-5xl text-amber-500/30 mb-4 block">menu_book</span>
            <p className="text-[#e5e2db]/50 font-headline text-lg">Verses coming soon</p>
            <p className="text-[#e5e2db]/30 text-sm mt-2">This surah's content is being prepared.</p>
          </div>
        )}

        {/* Bottom Divider */}
        <div className="py-12 flex justify-center items-center">
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
          <span className="material-symbols-outlined text-amber-500/40 mx-4">diamond</span>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        </div>
      </main>
    </div>
  )
}
