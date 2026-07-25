import { useNavigate } from 'react-router-dom'

export default function SettingsPage({ state, onLogout }) {
  const navigate = useNavigate()
  
  // Construct a mock email based on user name, e.g. "Ahmed" -> "ahmed@email.com"
  const userEmail = `${state.name.toLowerCase().replace(/\s+/g, '.')}@email.com`

  return (
    <div className="bg-emerald-950 font-manrope text-[#e5e2db] selection:bg-[#e9c349] selection:text-[#3c2f00] min-h-screen md:pl-[256px] overflow-x-hidden">
      {/* TopAppBar */}
      <header className="fixed md:hidden top-0 w-full z-50 flex items-center px-6 h-16 bg-emerald-950 border-b border-amber-500/30 max-w-[430px] mx-auto">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate(-1)}
              className="tap-highlight-transparent active:scale-95 hover:text-amber-400 transition-colors text-[#ffe088]"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          </div>
          <h1 className="font-serif text-center uppercase tracking-widest text-[#ffe088] text-lg font-medium">Settings</h1>
          <div className="w-10"></div> {/* Spacer for symmetry */}
        </div>
      </header>

      <main className="pt-24 pb-28 px-6 max-w-[430px] mx-auto space-y-8 relative md:pt-16 md:px-12 md:max-w-3xl md:mx-auto">
        <div className="fixed inset-0 subtle-pattern pointer-events-none"></div>
        
        {/* Profile Card (Modern/Muted Approach) */}
        <section className="relative z-10">
          <div className="rounded-xl p-6 flex items-center space-x-6 bg-[#e5e2db]" style={{ border: '1px solid transparent', background: 'linear-gradient(#e5e2db, #e5e2db) padding-box, linear-gradient(135deg, #af8d11 0%, #ffe088 50%, #af8d11 100%) border-box' }}>
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#e9c349] p-1 flex items-center justify-center bg-emerald-900 text-[#e9c349]">
                <span className="font-headline text-4xl font-bold">{state.name[0].toUpperCase()}</span>
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6 brushed-gold rounded-full flex items-center justify-center text-[#3c2f00] shadow-lg">
                <span className="material-symbols-outlined text-[14px]">edit</span>
              </div>
            </div>
            
            <div className="flex-1">
              <h2 className="font-headline tracking-tight text-emerald-950 text-2xl font-semibold">{state.name}</h2>
              <p className="font-manrope opacity-80 text-emerald-900/80 text-sm font-medium">{userEmail}</p>
              
              <div className="mt-2 inline-flex items-center space-x-1 text-[12px] font-manrope font-semibold px-2 py-0.5 rounded-full text-emerald-950 bg-emerald-900/10">
                <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                <span>Premium Member</span>
              </div>
            </div>
          </div>
        </section>

        {/* Settings Groups */}
        <div className="space-y-4 relative z-10">
          
          {/* Spiritual Goals */}
          <div className="bg-[#1c1c18]/40 rounded-lg p-1 border border-amber-500/10">
            <button onClick={() => navigate('/goals')} className="cursor-pointer w-full flex items-center justify-between p-4 hover:bg-emerald-900/30 transition-all group rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-emerald-900/50 flex items-center justify-center text-[#e9c349] border border-[#e9c349]/20">
                  <span className="material-symbols-outlined">auto_stories</span>
                </div>
                <div className="text-left">
                  <span className="block font-manrope font-semibold text-[#e5e2db] text-sm">Spiritual Goals</span>
                  <span className="block text-[12px] text-[#bfc9c4]">Daily Quran & Dhikr targets</span>
                </div>
              </div>
              <span className="material-symbols-outlined transition-colors text-[#ffe088]">chevron_right</span>
            </button>
          </div>

          {/* Notifications */}
          <div className="bg-[#1c1c18]/40 rounded-lg p-1 border border-amber-500/10">
            <button className="w-full flex items-center justify-between p-4 hover:bg-emerald-900/30 transition-all group rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-emerald-900/50 flex items-center justify-center text-[#e9c349] border border-[#e9c349]/20">
                  <span className="material-symbols-outlined">notifications_active</span>
                </div>
                <div className="text-left">
                  <span className="block font-manrope font-semibold text-[#e5e2db] text-sm">Notifications</span>
                  <span className="block text-[12px] text-[#bfc9c4]">Prayer times & daily reminders</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[12px] text-[#94d3c1] font-semibold">On</span>
                <span className="material-symbols-outlined transition-colors text-[#ffe088]">chevron_right</span>
              </div>
            </button>
          </div>

          {/* Geometric Divider */}
          <div className="flex items-center justify-center py-4">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>
            <span className="material-symbols-outlined text-[#e9c349] mx-4 text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>
          </div>

          {/* Display */}
          <div className="bg-[#1c1c18]/40 rounded-lg p-1 border border-amber-500/10">
            <button onClick={() => navigate('/settings/display')} className="cursor-pointer w-full flex items-center justify-between p-4 hover:bg-emerald-900/30 transition-all group rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-emerald-900/50 flex items-center justify-center text-[#e9c349] border border-[#e9c349]/20">
                  <span className="material-symbols-outlined">palette</span>
                </div>
                <div className="text-left">
                  <span className="block font-manrope font-semibold text-[#e5e2db] text-sm">Display</span>
                  <span className="block text-[12px] text-[#bfc9c4]">Theme and font size</span>
                </div>
              </div>
              <span className="material-symbols-outlined transition-colors text-[#ffe088]">chevron_right</span>
            </button>
          </div>

          {/* Help & Support */}
          <div className="bg-[#1c1c18]/40 rounded-lg p-1 border border-amber-500/10">
            <button className="w-full flex items-center justify-between p-4 hover:bg-emerald-900/30 transition-all group rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-emerald-900/50 flex items-center justify-center text-[#e9c349] border border-[#e9c349]/20">
                  <span className="material-symbols-outlined">help_center</span>
                </div>
                <div className="text-left">
                  <span className="block font-manrope font-semibold text-[#e5e2db] text-sm">Help & Support</span>
                  <span className="block text-[12px] text-[#bfc9c4]">FAQs and contact us</span>
                </div>
              </div>
              <span className="material-symbols-outlined transition-colors text-[#ffe088]">chevron_right</span>
            </button>
          </div>
          
        </div>

        {/* Sign Out Button */}
        <div className="pt-8 relative z-10">
          <button 
            onClick={onLogout}
            className="w-full py-4 border border-[#ffb4ab]/30 text-[#ffb4ab] font-manrope font-semibold rounded-xl hover:bg-[#ffb4ab]/5 transition-colors active:scale-95 duration-200"
          >
            Sign Out
          </button>
          <p className="text-center text-[10px] text-[#bfc9c4] mt-6 opacity-40 font-manrope tracking-widest uppercase font-semibold">
            Version 2.4.0 • Royal Heritage Edition
          </p>
        </div>
      </main>
    </div>
  )
}
