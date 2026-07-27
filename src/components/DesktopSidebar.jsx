import { Link, useLocation } from 'react-router-dom'
import { AvatarBadge } from '../assets/avatars'
import { SIDEBAR_NAV_ITEMS } from '../assets/navIcons'

export default function DesktopSidebar({ avatarId, userName = '' }) {
  const location = useLocation()
  const active = location.pathname

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-[var(--app-nav-bg)] backdrop-blur-3xl border-r border-[var(--app-border)] z-50 shadow-2xl">
      <div className="px-6 pt-8 pb-6 flex items-center gap-3 border-b border-[var(--app-border)]">
        <img
          src="/logo.png"
          alt="Thabit"
          className="w-12 h-12 object-contain shrink-0"
        />
        <div className="min-w-0">
          <p className="text-[var(--app-text)] font-playfair text-xl tracking-[0.18em] uppercase leading-none">
            Thabit
          </p>
          <p className="font-arabic text-[var(--app-accent)] text-lg leading-none mt-1">ثابت</p>
        </div>
      </div>

      <nav className="flex-1 py-6 px-6 space-y-3">
        {SIDEBAR_NAV_ITEMS.map((item) => {
          const isActive =
            item.to === '/'
              ? active === '/'
              : active === item.to || active.startsWith(`${item.to}/`)

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
                isActive
                  ? 'bg-[color-mix(in_srgb,var(--app-accent)_12%,transparent)] border border-[var(--app-border)]'
                  : 'hover:bg-[color-mix(in_srgb,var(--app-accent)_6%,transparent)] border border-transparent'
              }`}
            >
              <i
                className={`fa-solid ${item.fa} text-[1.25rem] w-6 text-center transition-colors duration-300 ${
                  isActive
                    ? 'text-[var(--app-sidebar-active)]'
                    : 'text-[var(--app-sidebar-text)] group-hover:text-[var(--app-sidebar-active)]'
                }`}
                aria-hidden
              />
              <span
                className={`text-sm font-bold uppercase tracking-[0.25em] transition-colors ${
                  isActive
                    ? 'text-[var(--app-sidebar-active)]'
                    : 'text-[var(--app-sidebar-text)] group-hover:text-[var(--app-sidebar-active)]'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="p-6 border-t border-[var(--app-border)]">
        <Link
          to="/settings"
          className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-colors group border ${
            active.startsWith('/settings')
              ? 'bg-[color-mix(in_srgb,var(--app-accent)_12%,transparent)] border-[var(--app-border)]'
              : 'border-transparent hover:bg-[color-mix(in_srgb,var(--app-accent)_10%,transparent)] hover:border-[var(--app-border)]'
          }`}
        >
          <div className="w-11 h-11 rounded-full overflow-hidden border border-[var(--app-accent)] shrink-0">
            <AvatarBadge id={avatarId} className="w-full h-full" alt={userName || 'Profile'} />
          </div>
          <div className="min-w-0">
            <p className="text-[var(--app-text)] font-manrope text-sm font-semibold truncate">
              Settings
            </p>
            <p className="text-[var(--app-text-muted)] text-xs font-manrope leading-snug">
              Profile, avatar & preferences
            </p>
          </div>
        </Link>
      </div>
    </aside>
  )
}
