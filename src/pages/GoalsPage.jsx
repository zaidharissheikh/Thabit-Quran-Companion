import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function GoalsPage({ state, onUpdateGoal }) {
  const navigate = useNavigate()

  // Local state for the slider before saving
  const [quranGoal, setQuranGoal] = useState(state.goal || 10)

  return (
    <div className="bg-[#002b24] text-[#e5e2db] font-manrope selection:bg-[#ebc349] selection:text-[#3d2f00] min-h-screen pb-32">
      {/* Top AppBar Component */}
      <header className="fixed top-0 z-50 w-full bg-[#002b24] border-b border-white/10 max-w-[430px] mx-auto left-0 right-0">
        <div className="relative flex items-center justify-center w-full px-6 py-2 h-14">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-6 p-2 transition-colors hover:text-[#ebc349] active:scale-95 duration-150 text-[#D4AF37]"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-lg font-headline font-semibold text-[#FFD700]">Spiritual Goals</h1>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-[430px] mx-auto space-y-8">

        {/* Quran Goal Card */}
        <div className="bg-[#fdfaf3] text-[#131410] rounded-xl p-8 flex flex-col justify-between min-h-[340px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
          </div>

          <div className="relative z-10">
            <h3 className="text-2xl font-headline font-semibold text-[#131410] mb-2">Daily Quran Goal</h3>
            <p className="text-base text-[#353530] mb-8 font-medium">Nourish your soul with the Divine Word.</p>

            <div className="space-y-6">
              <div className="flex items-end justify-between border-b border-[#353530]/20 pb-4">
                <span className="text-5xl font-headline font-bold text-[#131410]">{quranGoal}</span>
                <span className="text-lg text-[#353530] mb-2 font-medium">Verses</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={quranGoal}
                onChange={(e) => setQuranGoal(parseInt(e.target.value))}
                className="w-full h-1 bg-[#353530]/20 rounded-lg appearance-none cursor-pointer accent-[#cda72f]"
              />
            </div>
          </div>

          <button
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
