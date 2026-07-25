import { Link, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Home',
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    iconOutline: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    ),
  },
  {
    to: '/reader',
    label: 'Read',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    ),
    iconOutline: null,
  },
  {
    to: '/momentum',
    label: 'Stats',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    ),
    iconOutline: null,
  },
  {
    to: '/journal',
    label: 'Journal',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    ),
    iconOutline: null,
  },
]

export default function DesktopSidebar() {
  const location = useLocation()
  const active = location.pathname

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-[#062c21]/95 backdrop-blur-3xl border-r border-[#c5a059]/20 z-50 shadow-2xl">
      <div className="p-8 pb-12 flex items-center gap-4 border-b border-[#c5a059]/10 pt-12">
        <span className="text-5xl font-arabic text-[#c5a059] gold-text-glow">ثابت</span>
        <span className="text-[#e9d19b] font-playfair text-2xl tracking-widest uppercase">Thaabit</span>
      </div>

      <nav className="flex-1 py-10 px-6 space-y-4">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.to

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-[#c5a059]/10 border border-[#c5a059]/30 shadow-[0_0_20px_rgba(197,160,89,0.1)]' 
                  : 'hover:bg-[#c5a059]/5 border border-transparent'
              }`}
            >
              <div className={`transition-transform duration-500 ${isActive ? 'text-[#c5a059] scale-110' : 'text-[#e9d19b]/50 group-hover:text-[#c5a059]/80 group-hover:scale-105'}`}>
                {isActive ? item.icon : (item.iconOutline || item.icon)}
              </div>
              <span className={`text-sm font-bold uppercase tracking-[0.25em] transition-colors ${isActive ? 'text-[#c5a059]' : 'text-[#e9d19b]/50 group-hover:text-[#c5a059]/80'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="p-8 border-t border-[#c5a059]/10">
        <Link to="/settings" className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-[#c5a059]/10 transition-colors group border border-transparent hover:border-[#c5a059]/20">
          <div className="w-10 h-10 rounded-full border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059] bg-[#0a3d2e] shadow-inner group-hover:border-[#c5a059] transition-all">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="text-[#e9d19b]/70 group-hover:text-[#c5a059] font-playfair italic text-lg transition-colors">
            Settings
          </span>
        </Link>
      </div>
    </aside>
  )
}
