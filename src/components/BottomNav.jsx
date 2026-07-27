import { Link } from 'react-router-dom'
import { SIDEBAR_NAV_ITEMS } from '../assets/navIcons'

export default function BottomNav({ active }) {
  return (
    <nav
      className="fixed md:hidden bottom-0 left-0 right-0 z-50 bg-[var(--app-nav-bg)] backdrop-blur-2xl border-t border-[var(--app-border)] px-6 pt-3 max-w-[430px] mx-auto"
      style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))' }}
    >
      <div className="flex justify-between items-center">
        {SIDEBAR_NAV_ITEMS.map((item) => {
          const isActive = active === item.to

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1 transition-all min-w-[44px] ${
                isActive ? '' : 'opacity-40 hover:opacity-100'
              }`}
            >
              {isActive ? (
                <div className="bg-[var(--app-accent)] p-2.5 rounded-full shadow-inner ring-1 ring-[var(--app-accent-text)]/30 text-[var(--app-bg)] flex items-center justify-center">
                  <i className={`fa-solid ${item.fa} text-[1.05rem]`} aria-hidden />
                </div>
              ) : (
                <div className="text-[var(--app-text)] flex items-center justify-center h-10 w-10">
                  <i className={`fa-solid ${item.fa} text-[1.15rem]`} aria-hidden />
                </div>
              )}
              <span
                className={`text-[9px] font-bold uppercase tracking-[0.2em] leading-none ${
                  isActive ? 'text-[var(--app-accent)]' : 'text-[var(--app-text)]'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
