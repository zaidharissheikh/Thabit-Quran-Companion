import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function GoalsPage({ state, onUpdateGoal }) {
  const navigate = useNavigate()
  const [quranGoal, setQuranGoal] = useState(state.goal || 10)

  useEffect(() => {
    setQuranGoal(state.goal || 10)
  }, [state.goal])

  return (
    <div className="bg-[var(--app-bg)] text-[var(--app-text)] font-manrope selection:bg-[#ebc349] selection:text-[#3d2f00] min-h-screen pb-32 md:pl-[256px] overflow-x-hidden app-shell">
      <header className="fixed md:hidden top-0 z-50 w-full bg-[var(--app-nav-bg)] border-b border-[var(--app-border)] max-w-[430px] mx-auto left-0 right-0">
        <div className="relative flex items-center justify-center w-full px-6 py-2 h-14">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute left-6 p-2 transition-colors hover:opacity-80 active:scale-95 duration-150 text-[var(--app-accent)]"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-lg font-headline font-semibold text-[var(--app-accent)]">
            Spiritual Goals
          </h1>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-[430px] mx-auto space-y-8 md:pt-16 md:px-12 md:max-w-2xl md:mx-auto">
        <div className="bg-[var(--app-card-bg)] text-[var(--app-card-text)] rounded-xl p-8 flex flex-col justify-between min-h-[340px] shadow-2xl relative overflow-hidden border border-[var(--app-border)]">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <span
              className="material-symbols-outlined text-[120px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              menu_book
            </span>
          </div>

          <div className="relative z-10">
            <h3 className="text-2xl font-headline font-semibold mb-2">Daily Quran Goal</h3>
            <p className="text-base opacity-70 mb-8 font-medium">
              Nourish your soul with the Divine Word.
            </p>

            <div className="space-y-6">
              <div className="flex items-end justify-between border-b border-current/20 pb-4">
                <span className="text-5xl font-headline font-bold">{quranGoal}</span>
                <span className="text-lg opacity-70 mb-2 font-medium">Verses</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={quranGoal}
                onChange={(e) => setQuranGoal(parseInt(e.target.value, 10))}
                className="w-full h-1 bg-current/20 rounded-lg appearance-none cursor-pointer accent-[#cda72f]"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onUpdateGoal(quranGoal)
              navigate(-1)
            }}
            className="mt-8 relative z-10 w-full bg-[#cda72f] hover:bg-[#ebc349] text-[#4f3e00] font-manrope font-bold text-sm py-4 rounded-lg transition-all active:scale-95 flex items-center justify-center space-x-2 shadow-md uppercase tracking-wider"
          >
            <span>Set Goal</span>
            <span className="material-symbols-outlined text-[18px]">done_all</span>
          </button>
        </div>
      </main>
    </div>
  )
}
