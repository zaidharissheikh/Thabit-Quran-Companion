import { useState } from 'react'

export default function OnboardingPage({ onComplete }) {
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('10')

  return (
    <div className="geo-dot flex min-h-screen flex-col items-center justify-center bg-[#0D2B1F] px-8 py-16 text-center">
      <div className="afu">
        <div className="mb-2 font-serif text-6xl text-[#C9A84C]">ثابت</div>
        <h1 className="mb-3 font-serif text-3xl text-[#FFF9EF]">Thabit</h1>
        <p className="mb-10 text-sm leading-relaxed text-[#7FA890]">
          Your companion for staying steadfast
          <br />
          on your Quran journey, beyond Ramadan.
        </p>
      </div>
      <div className="mb-10 h-px w-12 bg-[#C9A84C] opacity-30" />
      <form
        className="afu2 flex w-full max-w-sm flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          onComplete({ name: name.trim() || 'Friend', goal: Number(goal) })
        }}
      >
        <div>
          <label className="mb-2 block text-left text-[10px] uppercase tracking-[.18em] text-[#7FA890]">Your Name</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            type="text"
            placeholder="e.g. Ibrahim"
            className="w-full rounded-xl border border-[#C9A84C]/20 bg-white/5 px-4 py-3.5 text-sm text-[#FAF3E0] outline-none transition placeholder:text-[#7FA890]/50 focus:border-[#C9A84C]/50"
          />
        </div>
        <div>
          <label className="mb-2 block text-left text-[10px] uppercase tracking-[.18em] text-[#7FA890]">Daily Verse Goal</label>
          <select
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            className="w-full rounded-xl border border-[#C9A84C]/20 bg-white/5 px-4 py-3.5 text-sm text-[#FAF3E0] outline-none transition focus:border-[#C9A84C]/50"
          >
            <option value="1" className="bg-[#0D2B1F]">
              1 verse - gentle start
            </option>
            <option value="5" className="bg-[#0D2B1F]">
              5 verses - steady
            </option>
            <option value="10" className="bg-[#0D2B1F]">
              10 verses - consistent
            </option>
            <option value="20" className="bg-[#0D2B1F]">
              20 verses - committed
            </option>
          </select>
        </div>
        <button
          type="submit"
          className="mt-2 w-full rounded-xl bg-[#C9A84C] py-4 text-base font-bold tracking-wide text-[#241a00] transition hover:bg-[#e6c364] active:scale-[.98]"
        >
          Begin My Journey →
        </button>
      </form>
    </div>
  )
}
