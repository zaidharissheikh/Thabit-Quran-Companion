import { Link, useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { SURAHS } from '../data/content'

export default function BookmarksPage({ state }) {
  const navigate = useNavigate()
  const bookmarks = state.bookmarks || []

  const bySurah = bookmarks.reduce((acc, b) => {
    const id = b.surahId || 0
    if (!acc[id]) acc[id] = []
    acc[id].push(b)
    return acc
  }, {})

  const surahIds = Object.keys(bySurah)
    .map(Number)
    .sort((a, b) => a - b)

  return (
    <div className="min-h-screen royal-bg text-[#e5e2db] font-manrope pb-24 md:pl-[256px] overflow-x-hidden">
      <header className="fixed md:hidden top-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-[#082620] border-b border-[#D4AF37]/20 max-w-[430px] mx-auto">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center text-[#E9D7A5]"
          aria-label="Back"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-headline uppercase tracking-[0.2em] text-sm text-[#E9D7A5]">
          Bookmarks
        </h1>
        <div className="w-10" />
      </header>

      <main className="pt-24 max-w-[430px] mx-auto px-6 space-y-8 md:pt-16 md:px-12 md:max-w-3xl md:mx-0">
        <section>
          <h2 className="font-headline text-3xl text-[#e9c349] font-semibold mb-2">Saved verses</h2>
          <p className="text-sm text-[#bfc9c4]/80">
            Surahs and ayahs you bookmarked while reading.
          </p>
        </section>

        {bookmarks.length === 0 ? (
          <div className="cream-card rounded-xl p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-[#D4AF37] mb-3 block">
              bookmark
            </span>
            <p className="font-headline text-lg text-[#004D40] mb-2">No bookmarks yet</p>
            <p className="text-sm text-[#004D40]/70 mb-6">
              Tap Bookmark on any ayah while you read, then find it here.
            </p>
            <Link
              to="/reader"
              className="inline-flex px-5 py-2.5 rounded-full bg-[#D4AF37] text-[#004D40] font-semibold text-sm"
            >
              Go to Read
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {surahIds.map((surahId) => {
              const surah = SURAHS.find((s) => s.num === surahId)
              const items = bySurah[surahId].sort(
                (a, b) => (a.ayahNumber || 0) - (b.ayahNumber || 0),
              )
              return (
                <section key={surahId} className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-headline text-xl text-[#e9c349]">
                      {surah?.name || items[0]?.surahName || `Surah ${surahId}`}
                    </h3>
                    {surahId > 0 ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/surah/${surahId}`)}
                        className="text-xs uppercase tracking-widest text-[#c5a059] font-semibold"
                      >
                        Open surah
                      </button>
                    ) : null}
                  </div>
                  <div className="space-y-3">
                    {items.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          if (b.surahId && b.ayahNumber) {
                            navigate(`/play/${b.surahId}/${b.ayahNumber}`)
                          }
                        }}
                        className="w-full text-left cream-card rounded-xl p-4 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex justify-between items-start gap-3 mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#8e6e33]">
                            {b.ref || `${b.surahName || 'Ayah'} ${b.ayahNumber || ''}`}
                          </span>
                          <span className="material-symbols-outlined text-[#D4AF37] text-xl fill-icon">
                            bookmark
                          </span>
                        </div>
                        {b.arabic ? (
                          <p
                            className="font-arabic text-xl text-[#004D40] mb-2 leading-relaxed"
                            dir="rtl"
                          >
                            {b.arabic}
                          </p>
                        ) : null}
                        {b.translation ? (
                          <p className="text-sm text-[#004D40]/75 italic font-manrope">
                            {b.translation}
                          </p>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </main>

      <BottomNav active="/reader" />
    </div>
  )
}
