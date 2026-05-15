import { useNavigate, useParams } from 'react-router-dom'
import { FATIHA, SURAHS } from '../data/content'

export default function PlaybackPage() {
  const { surahId, verseId } = useParams()
  const navigate = useNavigate()
  
  const surahNum = Number(surahId)
  const verseNum = Number(verseId)
  
  const surah = SURAHS.find((s) => s.num === surahNum) || SURAHS[0]
  
  // For now, only Al-Fatihah has verse data
  const verses = surahNum === 1 ? FATIHA : []
  const verse = verses.find(v => v.num === verseNum) || verses[0]

  return (
    <div className="bg-[#002A24] text-[#e5e2db] font-manrope min-h-screen selection:bg-[#ebc349] selection:text-[#3d2f00] relative overflow-x-hidden">
      <div className="absolute top-0 left-0 p-6 z-50">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center justify-center text-[#ebc349] hover:opacity-80 transition-opacity active:scale-95"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
      </div>

      {/* Background Texture */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#002A24]/40 via-[#002A24] to-[#002A24] pointer-events-none"></div>

      <main className="px-6 flex flex-col items-center pt-16 relative z-10 max-w-[430px] mx-auto">
        {/* Surah Info */}
        <div className="text-center mb-6 w-full">
          <h1 className="font-headline text-3xl font-bold text-[#ebc349] uppercase tracking-wider">
            {surah.name}
          </h1>
        </div>

        {/* Playback Medallion Section */}
        <section className="relative flex justify-center items-center my-8">
          {/* Outer Glow */}
          <div className="absolute w-72 h-72 rounded-full bg-[#ebc349]/10 blur-3xl"></div>
          
          {/* Circular Progress Indicator */}
          <div className="relative w-[280px] h-[280px] flex items-center justify-center p-4">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-900/30"></div>
            
            {/* Simulated Progress Arc */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="none" r="46" stroke="url(#goldGradient)" strokeDasharray="289" strokeDashoffset="100" strokeLinecap="round" strokeWidth="4"></circle>
              <defs>
                <linearGradient id="goldGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffe088" stopOpacity={1}></stop>
                  <stop offset="100%" stopColor="#af8d11" stopOpacity={1}></stop>
                </linearGradient>
              </defs>
            </svg>
            
            {/* Central Medallion */}
            <div className="relative z-10 w-48 h-48 rounded-full gold-rimmed shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,224,136,0.3)] flex flex-col items-center justify-center overflow-hidden bg-[#0a2e28]">
              <span className="font-headline text-[48px] gold-gradient-text relative z-20 font-bold leading-none mb-1">
                {verseNum}
              </span>
              <span className="font-manrope text-sm text-[#ebc349] tracking-widest uppercase relative z-20 font-semibold">
                Ayah
              </span>
            </div>
          </div>
        </section>

        {/* Ayah Text Display */}
        <section className="w-full max-w-lg space-y-6 text-center mt-4 pb-48">
          <div className="relative py-6 px-4">
            {/* Geometric Divider Top */}
            <div className="flex items-center justify-center space-x-4 mb-6 opacity-40">
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#ebc349]"></div>
              <span className="material-symbols-outlined text-[#ebc349] text-xs" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
              <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#ebc349]"></div>
            </div>
            
            <h2 className="font-arabic text-[32px] leading-[48px] text-[#ffe08b] mb-6 px-4 font-medium" dir="rtl">
              {verse ? verse.ar : 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ'}
            </h2>
            
            <p className="font-manrope text-lg text-[#bfc9c4] max-w-sm mx-auto leading-relaxed italic">
              "{verse ? verse.en : 'In the name of Allah, the Entirely Merciful, the Especially Merciful.'}"
            </p>
            
            {/* Geometric Divider Bottom */}
            <div className="flex items-center justify-center space-x-4 mt-6 opacity-40">
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#ebc349]"></div>
              <span className="material-symbols-outlined text-[#ebc349] text-xs" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
              <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#ebc349]"></div>
            </div>
          </div>
        </section>
      </main>

      {/* Playback Controls */}
      <section className="fixed bottom-10 left-0 w-full px-6 z-40">
        <div className="max-w-[400px] mx-auto bg-emerald-950/80 backdrop-blur-md rounded-2xl p-6 gold-rimmed shadow-2xl flex flex-col gap-6">
          {/* Time Info */}
          <div className="flex justify-between items-center px-2">
            <span className="text-[10px] font-manrope font-semibold text-[#89938f] uppercase tracking-wider">0:14</span>
            <span className="text-[10px] font-manrope font-semibold text-[#89938f] uppercase tracking-wider">-0:42</span>
          </div>
          
          {/* Buttons Cluster */}
          <div className="flex items-center justify-between px-2">
            <button className="text-[#ebc349]/60 active:text-[#ebc349] transition-colors">
              <span className="material-symbols-outlined">shuffle</span>
            </button>
            <div className="flex items-center gap-8">
              <button 
                onClick={() => verseNum > 1 && navigate(`/play/${surahNum}/${verseNum - 1}`)}
                className={`transition-transform ${verseNum > 1 ? 'text-[#ebc349] active:scale-90' : 'text-[#ebc349]/30'}`}
              >
                <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>skip_previous</span>
              </button>
              <button className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ffe088] to-[#af8d11] shadow-lg flex items-center justify-center text-[#241a00] active:scale-95 transition-all">
                <span className="material-symbols-outlined text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>pause</span>
              </button>
              <button 
                onClick={() => verseNum < verses.length && navigate(`/play/${surahNum}/${verseNum + 1}`)}
                className={`transition-transform ${verseNum < verses.length ? 'text-[#ebc349] active:scale-90' : 'text-[#ebc349]/30'}`}
              >
                <span className="material-symbols-outlined text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>skip_next</span>
              </button>
            </div>
            <button className="text-[#ebc349]/60 active:text-[#ebc349] transition-colors">
              <span className="material-symbols-outlined">repeat</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
