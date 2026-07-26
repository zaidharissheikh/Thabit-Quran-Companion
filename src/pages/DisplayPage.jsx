import { useNavigate } from 'react-router-dom'

export default function DisplayPage({ theme, fontSize, onUpdateTheme, onUpdateFontSize }) {
  const navigate = useNavigate()
  const size = fontSize ?? 3
  const resolvedTheme = theme === 'light' ? 'light' : 'dark'

  return (
    <div className="min-h-screen text-[var(--app-text)] font-manrope selection:bg-[#e9c349]/30 pb-32 md:pl-[256px] overflow-x-hidden app-shell bg-[var(--app-bg)]">
      <header
        className="fixed md:hidden top-0 left-0 right-0 max-w-[430px] mx-auto z-50 h-16 flex items-center justify-between px-6 border-b border-[var(--app-border)] bg-[var(--app-nav-bg)]"
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="flex items-center justify-center w-10 h-10 text-[var(--app-accent)] hover:opacity-80 transition-opacity active:scale-95"
        >
          <span className="material-symbols-outlined text-[28px]">arrow_back</span>
        </button>
        <h1 className="text-[var(--app-accent)] font-serif uppercase tracking-[0.2em] font-medium text-[16px]">
          Display
        </h1>
        <div className="w-10" />
      </header>

      <main className="pt-24 px-6 max-w-[430px] mx-auto space-y-10 md:pt-16 md:px-12 md:max-w-2xl md:mx-auto">
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--app-accent)] text-[20px]">palette</span>
            <h2 className="font-manrope font-semibold text-[var(--app-accent)] uppercase tracking-[0.2em] text-[12px]">
              Appearance
            </h2>
          </div>
          <div className="app-card-theme rounded-xl p-6 border">
            <div className="flex flex-col gap-5">
              <label className="text-[var(--app-card-text)] font-manrope font-semibold uppercase tracking-widest text-[11px] opacity-60">
                Choose Theme
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'light', icon: 'light_mode', label: 'Light' },
                  { id: 'dark', icon: 'dark_mode', label: 'Dark' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onUpdateTheme(opt.id)}
                    className={`flex flex-col items-center justify-center py-5 px-2 rounded-lg transition-all shadow-sm ${
                      resolvedTheme === opt.id
                        ? 'bg-[color-mix(in_srgb,var(--app-accent)_14%,transparent)] border border-[var(--app-accent)] text-[var(--app-accent)]'
                        : 'border border-[var(--app-border)] text-[var(--app-card-text)]/75 hover:border-[var(--app-accent)]/50 hover:text-[var(--app-accent)] hover:bg-[color-mix(in_srgb,var(--app-accent)_10%,transparent)]'
                    }`}
                  >
                    <span className="material-symbols-outlined mb-1 text-[24px]">{opt.icon}</span>
                    <span className="font-manrope font-semibold text-[10px] uppercase tracking-wider">
                      {opt.label}
                    </span>
                    {resolvedTheme === opt.id ? (
                      <span
                        className="material-symbols-outlined text-[14px] mt-1"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[var(--app-card-text)]/55 font-manrope">
                Light uses cream/white pages; dark uses deep green. Both keep gold accents for contrast.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--app-accent)] text-[20px]">text_fields</span>
            <h2 className="font-manrope font-semibold text-[var(--app-accent)] uppercase tracking-[0.2em] text-[12px]">
              Typography
            </h2>
          </div>
          <div className="app-card-theme rounded-xl p-6 space-y-8 border">
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <label className="text-[var(--app-card-text)] font-manrope font-semibold uppercase tracking-widest text-[11px] opacity-60">
                  Ayah size & weight
                </label>
                <div className="flex items-center gap-8 text-[var(--app-card-text)]/70">
                  <span className="font-serif text-[14px]">A</span>
                  <span className="font-serif text-[24px]">A</span>
                </div>
              </div>
              <div className="px-2">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={size}
                  onChange={(e) => onUpdateFontSize(Number(e.target.value))}
                  className="custom-slider"
                  aria-label="Font size"
                />
              </div>
              <p className="text-[11px] text-[var(--app-card-text)]/55 font-manrope">
                Only changes ayah Arabic and translation on Home (Living Word), Surah reading, and
                Play — not menus or other pages.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-lg bg-[var(--app-bg)] border border-[var(--app-border)] p-8 space-y-6">
              <div className="space-y-6 text-center relative z-10">
                <p
                  className="ayah-arabic text-[var(--app-accent-text)] leading-relaxed transition-all duration-300"
                  style={{ fontSize: `${1.25 + size * 0.15}rem` }}
                  dir="rtl"
                >
                  بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                </p>
                <div className="w-12 h-[1px] bg-[var(--app-accent)]/40 mx-auto" />
                <p
                  className="ayah-translation text-[var(--app-text-muted)] font-medium leading-relaxed transition-all duration-300"
                  style={{ fontSize: `${0.85 + size * 0.08}rem` }}
                >
                  &quot;In the name of Allah, the Entirely Merciful, the Especially Merciful.&quot;
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
