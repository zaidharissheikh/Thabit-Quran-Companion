import { Link } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: 'home_max' },
  { to: '/reader', label: 'Read', icon: 'menu_book' },
  { to: '/momentum', label: 'Momentum', icon: 'query_stats' },
  { to: '/journal', label: 'Journal', icon: 'auto_stories' },
]

export default function BottomNav({ active, dark = false }) {
  const containerClass = dark
    ? 'border-[#755B00]/10 bg-[#0D2B1F]/90 text-[#FFF9EF]/40'
    : 'border-[#755B00]/10 bg-[#FFF9EF]/90 text-[#865139]/60'

  const activeClass = dark ? 'text-[#C9A84C] scale-110' : 'text-[#755B00] scale-110'
  const hoverClass = dark ? 'hover:text-[#C9A84C]' : 'hover:text-[#755B00]'

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 mx-auto flex w-full max-w-[430px] items-center justify-around border-t px-4 pb-7 pt-3 backdrop-blur-xl ${containerClass}`}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.to
        const iconClass = isActive ? 'fill-icon' : ''

        return (
          <Link
            key={item.to}
            to={item.to}
            className={`flex cursor-pointer flex-col items-center gap-1 transition ${isActive ? activeClass : hoverClass}`}
          >
            <span className={`material-symbols-outlined ${iconClass}`}>{item.icon}</span>
            <span className="text-[10px] font-medium tracking-widest">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
