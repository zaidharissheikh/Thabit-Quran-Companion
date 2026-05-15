import { useState } from 'react'
import { Link } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import LoadingDots from '../components/LoadingDots'

export default function JournalPage({ state, reflectionQuestion, onGenerateReflectionQuestion, onPostReflection }) {
  const [reflectionText, setReflectionText] = useState('')
  const journals = state.journals || []

  return (
    <div className="min-h-screen text-[#e5e2db] font-manrope selection:bg-amber-500/30 pb-24" style={{ backgroundColor: '#0d2119' }}>
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-teal-950 border-b border-amber-500/20 max-w-[430px] mx-auto">
        <h1 className="font-serif uppercase font-medium text-[#e9c349]/80 text-sm tracking-[0.2em]">Reflections</h1>
        <Link to="/settings" className="w-8 h-8 rounded-full border border-amber-400 bg-teal-900 flex items-center justify-center text-[#e9c349] font-bold hover:opacity-80 transition-opacity">
          {state.name[0].toUpperCase()}
        </Link>
      </header>

      <main className="pt-24 max-w-[430px] mx-auto px-6 space-y-10">
        {/* Header Section */}
        <section className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 ayah-medallion flex items-center justify-center rounded-full text-[#3c2f00]">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
            </div>
          </div>
          <h2 className="font-headline text-3xl text-[#e9c349] mb-2 font-semibold">Sacred Journal</h2>
          <p className="font-manrope text-[#bfc9c4] opacity-80 text-sm">Capture your spiritual journey and personal insights.</p>
        </section>

        {/* Weekly Reflection Prompt */}
        <section className="mb-10">
          <div className="rounded-2xl p-6 shadow-2xl relative overflow-hidden" style={{ backgroundColor: '#f9f7f2' }}>
            {/* Background Pattern Detail */}
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-8xl text-[#004d40]">menu_book</span>
            </div>
            
            <div className="relative z-10 text-center">
              <span className="font-manrope font-semibold uppercase tracking-[0.2em] text-[#004d40]/70 mb-4 block text-xs">Prompt of the Week</span>
              <h3 className="font-headline text-xl text-[#004d40] mb-6 px-2 font-semibold">
                {reflectionQuestion ? `"${reflectionQuestion}"` : <LoadingDots />}
              </h3>
              
              <div className="relative group text-left">
                <textarea 
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  className="w-full bg-[#004d40]/5 border-b border-[#004d40]/20 focus:border-[#004d40] outline-none py-4 px-3 min-h-[120px] font-manrope text-[#004d40] placeholder-[#004d40]/50 resize-none transition-all rounded-lg text-sm" 
                  placeholder="Begin your reflection..."
                />
                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#004d40] transition-all duration-500 group-focus-within:w-full"></div>
              </div>
              
              <div className="mt-6 flex justify-between items-center">
                <button
                  type="button"
                  onClick={onGenerateReflectionQuestion}
                  className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-[#004d40]/50 hover:text-[#004d40] transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  Refresh
                </button>
                <button 
                  onClick={() => {
                    onPostReflection(reflectionText)
                    setReflectionText('')
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-manrope font-bold transition-transform active:scale-95 shadow-lg text-sm text-[#004d40]" 
                  style={{ backgroundColor: '#e9c349' }}
                >
                  Save Entry
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Past Entries Header */}
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-manrope font-semibold text-[#e9c349] tracking-widest uppercase text-xs">Past Reflections</h4>
          <div className="h-[1px] flex-grow ml-4 bg-[#e9c349]/20"></div>
        </div>

        {/* Entry List */}
        <div className="space-y-6">
          {journals.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-[#bfc9c4]/50 font-manrope">No past reflections yet.</p>
            </div>
          ) : (
            journals.map((journal, index) => (
              <div key={`${journal.date}-${index}`} className="group">
                <div className="flex flex-col gap-1 mb-2">
                  <span className="font-manrope text-[#bfc9c4]/60 uppercase tracking-tighter text-xs font-semibold">{journal.date}</span>
                  <h5 className="font-headline text-[#e9c349] group-hover:text-[#ffe08b] transition-colors text-lg font-semibold">{journal.verse}</h5>
                </div>
                <p className="font-manrope text-[#e5e2db]/80 italic leading-relaxed border-l-2 border-[#e9c349]/20 pl-4 text-sm font-medium">
                  "{journal.text}"
                </p>
                <div className="mt-6 h-[1px] w-full bg-[#353530]/50"></div>
              </div>
            ))
          )}
        </div>

        {/* Geometric Divider Detail */}
        <div className="my-10 flex items-center justify-center gap-4 opacity-30 pb-4">
          <div className="h-[1px] w-12 bg-[#e9c349]"></div>
          <span className="material-symbols-outlined text-[#e9c349] text-xs">auto_awesome</span>
          <div className="h-[1px] w-12 bg-[#e9c349]"></div>
        </div>
      </main>

      <BottomNav active="/journal" />
    </div>
  )
}
