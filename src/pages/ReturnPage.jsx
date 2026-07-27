import { Link } from 'react-router-dom'
import LoadingDots from '../components/LoadingDots'

export default function ReturnPage({ returnMessage }) {
  return (
    <div className="geo-dot flex min-h-screen flex-col items-center justify-center bg-[#0D2B1F] px-8 py-16 text-center">
      <div style={{ animation: 'lanternSway 4s ease-in-out infinite' }} className="mb-8">
        <div className="mx-auto h-8 w-0.5 bg-[#C9A84C]/30" />
        <div className="relative flex h-24 w-16 items-center justify-center overflow-hidden rounded-xl border-2 border-[#C9A84C]/40 bg-[#C9A84C]/8 shadow-[0_0_30px_rgba(201,168,76,0.18)]">
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle,rgba(255,200,50,.2) 0%,transparent 70%)',
              animation: 'candleFlicker 2s ease-in-out infinite',
            }}
          />
          <span className="relative z-10 text-3xl">🕯️</span>
        </div>
      </div>

      <h1 className="mb-3 font-serif text-3xl text-[#FAF3E0]">Welcome back.</h1>
      <p className="mb-6 text-sm leading-relaxed text-[#7FA890]">
        Your streak ended. That's okay.
        <br />
        Every moment is a new beginning.
      </p>

      <div className="mb-5 w-full max-w-sm rounded-2xl border-l-2 border-[#C9A84C]/40 bg-white/5 p-5 text-left">
        <p className="font-serif text-base italic leading-relaxed text-[#FAF3E0]/80">
          "Indeed, Allah loves those who are constantly repentant and loves those who purify themselves."
        </p>
        <p className="mt-2 text-xs text-[#7FA890]">- Al-Baqarah 2:222</p>
      </div>

      <div className="mb-8 w-full max-w-sm rounded-2xl border border-[#C9A84C]/15 bg-white/5 p-5 text-left font-serif text-sm leading-relaxed text-[#FFF9EF]/80">
        {returnMessage || <LoadingDots />}
      </div>

      <Link
        to="/"
        className="rounded-xl bg-[#C9A84C] px-10 py-4 text-base font-bold tracking-wide text-[#241a00] transition hover:bg-[#e6c364] active:scale-[.98]"
      >
        Begin Again 🌱
      </Link>
      <Link to="/" className="mt-4 text-sm text-[#7FA890] transition hover:text-[#C9A84C]">
        ← Back to home
      </Link>
    </div>
  )
}
