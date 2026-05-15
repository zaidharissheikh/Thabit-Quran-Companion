import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function DisplayPage({ theme, onUpdateTheme }) {
  const navigate = useNavigate()
  const [fontSize, setFontSize] = useState(3)

  return (
    <div className="emerald-pattern min-h-screen text-[#e5e2db] font-manrope selection:bg-[#e9c349]/30 pb-32">
      <header className="fixed top-0 left-0 right-0 max-w-[430px] mx-auto z-50 h-16 flex items-center justify-between px-6 border-b" style={{ backgroundColor: 'transparent', borderColor: 'rgba(233, 195, 73, 0.15)' }}>
        <button 
          onClick={() => navigate(-1)}
          aria-label="Go back" 
          className="flex items-center justify-center w-10 h-10 text-[#e9c349] hover:opacity-80 transition-opacity active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[28px]">arrow_back</span>
        </button>
        <h1 className="text-[#e9c349] font-serif uppercase tracking-[0.2em] font-medium text-[16px]">Display</h1>
        <div className="w-10"></div>
      </header>

      <main className="pt-24 px-6 max-w-[430px] mx-auto space-y-10">
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#e9c349] text-[20px]">palette</span>
            <h2 className="font-manrope font-semibold text-[#e9c349] uppercase tracking-[0.2em] text-[12px]">Appearance</h2>
          </div>
          <div className="bg-[#F5F2EA] gold-rim-cream rounded-xl p-6">
            <div className="flex flex-col gap-5">
              <label className="text-[#004d40] font-manrope font-semibold uppercase tracking-widest text-[11px] opacity-60">Choose Theme</label>
              <div className="grid grid-cols-3 gap-4">
                <button 
                  onClick={() => onUpdateTheme('light')}
                  className={`flex flex-col items-center justify-center py-4 px-2 rounded-lg transition-all shadow-sm ${theme === 'light' ? 'bg-[#EBE7DD] border border-[#e9c349]/40 text-[#e9c349]' : 'hover:bg-[#EBE7DD]/50 text-[#004d40]/40'}`}
                >
                  <span className="material-symbols-outlined mb-1 text-[24px]">light_mode</span>
                  <span className="font-manrope font-semibold text-[10px] uppercase tracking-wider">Light</span>
                  {theme === 'light' && <span className="material-symbols-outlined text-[14px] mt-1" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>}
                </button>
                <button 
                  onClick={() => onUpdateTheme('dark')}
                  className={`flex flex-col items-center justify-center py-4 px-2 rounded-lg transition-all shadow-sm ${theme === 'dark' ? 'bg-[#EBE7DD] border border-[#e9c349]/40 text-[#e9c349]' : 'hover:bg-[#EBE7DD]/50 text-[#004d40]/40'}`}
                >
                  <span className="material-symbols-outlined mb-1 text-[24px]">dark_mode</span>
                  <span className="font-manrope font-semibold text-[10px] uppercase tracking-wider">Dark</span>
                  {theme === 'dark' && <span className="material-symbols-outlined text-[14px] mt-1" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>}
                </button>
                <button 
                  onClick={() => onUpdateTheme('system')}
                  className={`flex flex-col items-center justify-center py-4 px-2 rounded-lg transition-all shadow-sm ${theme === 'system' ? 'bg-[#EBE7DD] border border-[#e9c349]/40 text-[#e9c349]' : 'hover:bg-[#EBE7DD]/50 text-[#004d40]/40'}`}
                >
                  <span className="material-symbols-outlined mb-1 text-[24px]">settings_brightness</span>
                  <span className="font-manrope font-semibold text-[10px] uppercase tracking-wider">System</span>
                  {theme === 'system' && <span className="material-symbols-outlined text-[14px] mt-1" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#e9c349] text-[20px]">text_fields</span>
            <h2 className="font-manrope font-semibold text-[#e9c349] uppercase tracking-[0.2em] text-[12px]">Typography</h2>
          </div>
          <div className="bg-[#F5F2EA] gold-rim-cream rounded-xl p-6 space-y-8">
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <label className="text-[#004d40] font-manrope font-semibold uppercase tracking-widest text-[11px] opacity-60">Font Size</label>
                <div className="flex items-center gap-8 text-[#004d40]/70">
                  <span className="font-serif text-[14px]">A</span>
                  <span className="font-serif text-[24px]">A</span>
                </div>
              </div>
              <div className="px-2">
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="custom-slider" 
                />
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-lg bg-[#EBE7DD] border border-[#004d40]/5 p-8 space-y-6">
              <div className="absolute -top-2 -right-2 p-2 opacity-[0.03]">
                <span className="material-symbols-outlined text-[100px]">format_quote</span>
              </div>
              <div className="space-y-6 text-center relative z-10">
                <p 
                  className="font-arabic text-[#004d40] leading-relaxed transition-all duration-300" 
                  style={{ fontSize: `${24 + (fontSize * 4)}px` }}
                  dir="rtl"
                >
                  بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                </p>
                <div className="w-12 h-[1px] bg-[#e9c349]/30 mx-auto"></div>
                <p 
                  className="font-manrope text-[#004d40]/70 italic font-medium leading-relaxed transition-all duration-300"
                  style={{ fontSize: `${14 + (fontSize * 2)}px` }}
                >
                  "In the name of Allah, the Entirely Merciful, the Especially Merciful."
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
