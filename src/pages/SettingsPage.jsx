import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AVATAR_OPTIONS, AvatarBadge, resolveAvatarId } from '../assets/avatars'
import {
  requestNotificationPermission,
  hasNotificationPermission,
} from '../lib/notifications'

export default function SettingsPage({
  state,
  user,
  avatarId,
  onAvatarChange,
  onLogout,
}) {
  const navigate = useNavigate()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [soonToast, setSoonToast] = useState('')
  const [notifsEnabled, setNotifsEnabled] = useState(hasNotificationPermission())
  const [notifsMuted, setNotifsMuted] = useState(() => localStorage.getItem('thabit_notifications_muted') === 'true')

  const userEmail = user?.email || 'Not set'
  const activeAvatar = resolveAvatarId(avatarId)

  async function handleToggleNotifications() {
    if (!hasNotificationPermission()) {
      const granted = await requestNotificationPermission()
      setNotifsEnabled(granted)
      if (!granted) {
        setSoonToast('Please enable notifications in your browser settings')
        window.setTimeout(() => setSoonToast(''), 3000)
      } else {
        setNotifsMuted(false)
        localStorage.setItem('thabit_notifications_muted', 'false')
      }
    } else {
      const newMuted = !notifsMuted
      setNotifsMuted(newMuted)
      localStorage.setItem('thabit_notifications_muted', newMuted.toString())
    }
  }

  return (
    <div className="bg-[var(--app-bg)] font-manrope text-[var(--app-text)] selection:bg-[#e9c349] selection:text-[#3c2f00] min-h-screen md:pl-[256px] overflow-x-hidden app-shell">
      <header className="fixed md:hidden top-0 w-full z-50 flex items-center px-6 h-16 bg-[var(--app-nav-bg)] border-b border-[var(--app-border)] max-w-[430px] mx-auto">
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="tap-highlight-transparent active:scale-95 hover:opacity-80 transition-colors text-[var(--app-accent)]"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-serif text-center uppercase tracking-widest text-[var(--app-accent)] text-lg font-medium">
            Settings
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="pt-24 pb-28 px-6 max-w-[430px] mx-auto space-y-8 relative md:pt-16 md:px-12 md:max-w-3xl md:mx-auto">
        <div className="fixed inset-0 subtle-pattern pointer-events-none" />

        <section className="relative z-10">
          <div
            className="rounded-xl p-6 flex items-center space-x-6 bg-[#e5e2db]"
            style={{
              border: '1px solid transparent',
              background:
                'linear-gradient(#e5e2db, #e5e2db) padding-box, linear-gradient(135deg, #af8d11 0%, #ffe088 50%, #af8d11 100%) border-box',
            }}
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#e9c349] flex items-center justify-center bg-emerald-900">
                <AvatarBadge id={activeAvatar} className="w-full h-full" />
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="absolute bottom-0 right-0 w-6 h-6 brushed-gold rounded-full flex items-center justify-center text-[#3c2f00] shadow-lg"
                aria-label="Choose avatar"
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-headline tracking-tight text-emerald-950 text-2xl font-semibold truncate">
                {state.name}
              </h2>
              <p className="font-manrope opacity-80 text-emerald-900/80 text-sm font-medium truncate">
                {userEmail}
              </p>

              <div className="mt-2 inline-flex items-center space-x-1 text-[12px] font-manrope font-semibold px-2 py-0.5 rounded-full text-emerald-950 bg-emerald-900/10">
                <span
                  className="material-symbols-outlined text-[14px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
                <span>Premium Momin</span>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-4 relative z-10">
          <div className="app-panel-muted rounded-lg p-1 border border-[var(--app-border)]">
            <button
              type="button"
              onClick={() => navigate('/goals')}
              className="cursor-pointer w-full flex items-center justify-between p-4 hover:opacity-90 transition-all group rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-[var(--app-surface)] flex items-center justify-center text-[var(--app-accent)] border border-[var(--app-border)]">
                  <span className="material-symbols-outlined">auto_stories</span>
                </div>
                <div className="text-left">
                  <span className="block font-manrope font-semibold text-[var(--app-text)] text-sm">
                    Spiritual Goals
                  </span>
                  <span className="block text-[12px] text-[var(--app-text-muted)]">
                    Daily Quran & Dhikr targets
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined transition-colors text-[var(--app-accent)]">
                chevron_right
              </span>
            </button>
          </div>

          <div className="app-panel-muted rounded-lg p-1 border border-[var(--app-border)]">
            <button
              type="button"
              onClick={handleToggleNotifications}
              className="w-full flex items-center justify-between p-4 hover:opacity-90 transition-all group rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-[var(--app-surface)] flex items-center justify-center text-[var(--app-accent)] border border-[var(--app-border)]">
                  <span className="material-symbols-outlined">notifications_active</span>
                </div>
                <div className="text-left">
                  <span className="block font-manrope font-semibold text-[var(--app-text)] text-sm">
                    Notifications
                  </span>
                  <span className="block text-[12px] text-[var(--app-text-muted)]">
                    Prayer times & daily reminders
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-[var(--app-accent)] font-semibold uppercase tracking-wide">
                  {!notifsEnabled ? 'Click to Enable' : notifsMuted ? 'Muted' : 'Enabled'}
                </span>
                <div
                  className={`relative w-10 h-5 flex items-center rounded-full transition-colors duration-300 ${
                    notifsEnabled && !notifsMuted ? 'bg-[var(--app-accent)]' : 'bg-[var(--app-text-muted)] opacity-50'
                  }`}
                >
                  <div
                    className={`absolute left-0.5 w-4 h-4 bg-[var(--app-bg)] rounded-full shadow-md transition-transform duration-300 ease-in-out ${
                      notifsEnabled && !notifsMuted ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </button>
          </div>

          <div className="flex items-center justify-center py-4">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
            <span
              className="material-symbols-outlined text-[#e9c349] mx-4 text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
          </div>

          <div className="app-panel-muted rounded-lg p-1 border border-[var(--app-border)]">
            <button
              type="button"
              onClick={() => navigate('/settings/display')}
              className="cursor-pointer w-full flex items-center justify-between p-4 hover:opacity-90 transition-all group rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-[var(--app-surface)] flex items-center justify-center text-[var(--app-accent)] border border-[var(--app-border)]">
                  <span className="material-symbols-outlined">palette</span>
                </div>
                <div className="text-left">
                  <span className="block font-manrope font-semibold text-[var(--app-text)] text-sm">
                    Display
                  </span>
                  <span className="block text-[12px] text-[var(--app-text-muted)]">
                    Theme and ayah typography
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined transition-colors text-[var(--app-accent)]">
                chevron_right
              </span>
            </button>
          </div>

          <div className="app-panel-muted rounded-lg p-1 border border-[var(--app-border)]">
            <button
              type="button"
              onClick={() => navigate('/settings/help')}
              className="cursor-pointer w-full flex items-center justify-between p-4 hover:opacity-90 transition-all group rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-[var(--app-surface)] flex items-center justify-center text-[var(--app-accent)] border border-[var(--app-border)]">
                  <span className="material-symbols-outlined">help_center</span>
                </div>
                <div className="text-left">
                  <span className="block font-manrope font-semibold text-[var(--app-text)] text-sm">
                    Help & Support
                  </span>
                  <span className="block text-[12px] text-[var(--app-text-muted)]">
                    FAQs and contact us
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined transition-colors text-[var(--app-accent)]">
                chevron_right
              </span>
            </button>
          </div>
        </div>

        <div className="pt-8 relative z-10">
          <button
            type="button"
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

      {pickerOpen ? (
        <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#f9f7f2] text-[#004d40] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline text-xl font-semibold">Choose your avatar</h3>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="p-1 rounded-full hover:bg-[#004d40]/10"
                aria-label="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-sm text-[#004d40]/70 mb-5 font-manrope">
              Pick a profile picture for your Thabit companion.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {AVATAR_OPTIONS.map((opt) => {
                const selected = activeAvatar === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onAvatarChange(opt.id)
                      setPickerOpen(false)
                    }}
                    className={`rounded-xl p-3 border-2 transition-all ${
                      selected
                        ? 'border-[#c5a059] bg-[#e9d19b]/25'
                        : 'border-transparent bg-[#004d40]/5 hover:border-[#c5a059]/40'
                    }`}
                  >
                    <div className="w-16 h-16 mx-auto rounded-full overflow-hidden mb-2 border border-[#004d40]/15">
                      <AvatarBadge id={opt.id} className="w-full h-full" alt={opt.label} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wide">{opt.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}

      {soonToast ? (
        <div className={`toast ${soonToast ? 'show' : ''}`} style={{ bottom: '2rem' }}>
          {soonToast}
        </div>
      ) : null}
    </div>
  )
}
