import { useState } from 'react'
import { HEART_OPTIONS } from '../data/content'

const MOOD_EMOJIS = HEART_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.emoji
  return acc
}, {})

export default function MoodCalendar({ moodHistory = {} }) {
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date()
    d.setDate(1) // Avoid end-of-month bugs
    return d
  })

  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev)
      next.setMonth(prev.getMonth() - 1)
      return next
    })
  }

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev)
      next.setMonth(prev.getMonth() + 1)
      return next
    })
  }

  // Formatting for the header
  const monthName = currentDate.toLocaleString('default', { month: 'short' })
  const year = currentDate.getFullYear()

  // Generate calendar grid
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, currentDate.getMonth(), 1).getDay()

  const blanks = Array.from({ length: firstDayOfWeek }).map((_, i) => i)
  const days = Array.from({ length: daysInMonth }).map((_, i) => i + 1)

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-2">
        <button
          onClick={handlePrevMonth}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#D4AF37]/10 text-[#004D40] transition"
        >
          <span className="material-symbols-outlined text-xs">arrow_back_ios</span>
        </button>
        <h3 className="font-headline text-base font-bold text-[#004D40]">
          {monthName}, {year}
        </h3>
        <button
          onClick={handleNextMonth}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#D4AF37]/10 text-[#004D40] transition"
        >
          <span className="material-symbols-outlined text-xs translate-x-0.5">
            arrow_forward_ios
          </span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-center">
        {/* Days of week */}
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={`dow-${i}`}
            className="font-manrope text-xs font-bold text-[#004D40] uppercase"
          >
            {day}
          </div>
        ))}

        {/* Blank cells */}
        {blanks.map((b) => (
          <div key={`blank-${b}`} />
        ))}

        {/* Day cells */}
        {days.map((d) => {
          // Format date as YYYY-MM-DD
          const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0')
          const dayStr = String(d).padStart(2, '0')
          const dateKey = `${year}-${monthStr}-${dayStr}`
          const moodVal = moodHistory[dateKey]

          return (
            <div key={d} className="flex items-center justify-center h-8">
              {moodVal ? (
                <div
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-[#FFF0BE] via-[#E9C349] to-[#D4AF37] shadow-sm transform hover:scale-105 transition-transform"
                  title={`Mood: ${moodVal}`}
                >
                  <span className="text-[10px] sm:text-xs drop-shadow-md">
                    {MOOD_EMOJIS[moodVal]}
                  </span>
                </div>
              ) : (
                <span className="font-manrope text-[11px] font-medium text-[#004D40]/80">
                  {d}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
