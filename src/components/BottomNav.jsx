import { Link } from 'react-router-dom'

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Home',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
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

export default function BottomNav({ active }) {
  return (
    <nav className="fixed md:hidden bottom-0 left-0 right-0 z-50 bg-[#062c21]/95 backdrop-blur-2xl border-t border-[#c5a059]/20 px-8 pb-8 pt-5 max-w-[430px] mx-auto">
      <div className="flex justify-between items-center">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.to

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1.5 transition-all ${
                isActive ? '' : 'opacity-40 hover:opacity-100'
              }`}
            >
              {isActive ? (
                <div className="bg-[#c5a059] p-2.5 rounded-full shadow-inner ring-1 ring-[#e9d19b]/30 text-[#062c21]">
                  {item.icon}
                </div>
              ) : (
                <div className="text-[#e9d19b]">
                  {item.iconOutline || item.icon}
                </div>
              )}
              <span className={`text-[9px] font-bold uppercase tracking-[0.2em] ${isActive ? 'text-[#c5a059]' : ''}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
