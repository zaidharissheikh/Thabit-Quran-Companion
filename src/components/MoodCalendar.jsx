import { useState, useEffect, useRef } from 'react'
import { HEART_OPTIONS } from '../data/content'
import { MOOD_STICKERS } from '../assets/moodStickers'

const MOOD_BY_VALUE = Object.fromEntries(
  HEART_OPTIONS.map((o) => [String(o.value), o])
)

function formatDateLabel(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * colIndex: 0 = Sunday … 6 = Saturday
 * Returns Tailwind classes for the tooltip box and caret so edge columns
 * don't clip off-screen.
 */
function tooltipClasses(colIndex) {
  if (colIndex <= 1) {
    // Left-edge columns - align tooltip to the left of the cell
    return {
      box: 'left-0',
      caret: 'left-6',
    }
  }
  if (colIndex >= 5) {
    // Right-edge columns - align tooltip to the right
    return {
      box: 'right-0',
      caret: 'right-6 left-auto',
    }
  }
  // Middle columns - center
  return {
    box: 'left-1/2 -translate-x-1/2',
    caret: 'left-1/2 -translate-x-1/2',
  }
}

function DayCell({ d, dateKey, moodOption, colIndex = 3 }) {
  const [open, setOpen] = useState(false)
  const cellRef = useRef(null)
  const { box, caret } = tooltipClasses(colIndex)

  useEffect(() => {
    if (!open) return
    function onKey(e) { if (e.key === 'Escape') setOpen(false) }
    function onOutside(e) {
      if (cellRef.current && !cellRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onOutside)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onOutside)
    }
  }, [open])

  if (!moodOption) {
    return (
      <div className="flex items-center justify-center h-12">
        <span className="font-manrope text-[11px] font-medium text-[#004D40]/70 select-none">
          {d}
        </span>
      </div>
    )
  }

  return (
    <div ref={cellRef} className="flex items-center justify-center h-12 relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-[#FFF0BE] via-[#E9C349] to-[#D4AF37] shadow-md hover:scale-110 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
        title={`${moodOption.label} - ${formatDateLabel(dateKey)}`}
      >
        <img
          src={MOOD_STICKERS[moodOption.stickerKey]}
          alt={moodOption.label}
          className="w-10 h-10 object-contain drop-shadow"
          draggable={false}
        />
      </button>

      {/* Tooltip - anchored above THIS sticker, edge-aware */}
      {open && (
        <div
          className={`absolute bottom-full mb-3 z-40 w-52 bg-[#f9f7f2] rounded-2xl shadow-2xl border border-[#D4AF37]/25 p-4 flex flex-col items-center gap-2 ${box}`}
          style={{ animation: 'fadeSlideUp 0.18s ease-out' }}
        >
          {/* Caret */}
          <div
            className={`absolute -bottom-2 w-4 h-4 bg-[#f9f7f2] border-r border-b border-[#D4AF37]/25 rotate-45 ${caret}`}
          />

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-2 right-2 text-[#004D40]/40 hover:text-[#004D40]/80 transition"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>

          <img
            src={MOOD_STICKERS[moodOption.stickerKey]}
            alt={moodOption.label}
            className="w-14 h-14 object-contain drop-shadow-md"
            draggable={false}
          />
          <p className="font-manrope text-xs text-[#004D40]/60 text-center leading-tight">
            {formatDateLabel(dateKey)}
          </p>
          <p className="font-headline text-sm font-semibold text-[#004D40] text-center">
            You were feeling{' '}
            <span className="text-[#8e6e33]">{moodOption.label}</span> on this day
          </p>
        </div>
      )}
    </div>
  )
}

export default function MoodCalendar({ moodHistory = {} }) {
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })

  const handlePrevMonth = () =>
    setCurrentDate((prev) => {
      const next = new Date(prev)
      next.setMonth(prev.getMonth() - 1)
      return next
    })

  const handleNextMonth = () =>
    setCurrentDate((prev) => {
      const next = new Date(prev)
      next.setMonth(prev.getMonth() + 1)
      return next
    })

  const monthName = currentDate.toLocaleString('default', { month: 'short' })
  const year = currentDate.getFullYear()
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, currentDate.getMonth(), 1).getDay()
  const blanks = Array.from({ length: firstDayOfWeek }).map((_, i) => i)
  const days = Array.from({ length: daysInMonth }).map((_, i) => i + 1)
  const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0')

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          onClick={handlePrevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#D4AF37]/10 text-[#004D40] transition active:scale-95"
          aria-label="Previous month"
        >
          <span className="material-symbols-outlined text-sm">arrow_back_ios</span>
        </button>
        <h3 className="font-headline text-base font-bold text-[#004D40]">
          {monthName}, {year}
        </h3>
        <button
          onClick={handleNextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#D4AF37]/10 text-[#004D40] transition active:scale-95"
          aria-label="Next month"
        >
          <span className="material-symbols-outlined text-sm translate-x-0.5">
            arrow_forward_ios
          </span>
        </button>
      </div>

      {/* Grid - overflow-visible so tooltips don't clip, but columns tight */}
      <div className="grid grid-cols-7 gap-y-1 gap-x-0 text-center overflow-visible">
        {/* Day-of-week headers */}
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={`dow-${i}`}
            className="font-manrope text-[10px] font-bold text-[#004D40]/60 uppercase pb-1"
          >
            {day}
          </div>
        ))}

        {/* Blank cells */}
        {blanks.map((b) => (
          <div key={`blank-${b}`} className="h-12" />
        ))}

        {/* Day cells */}
        {days.map((d) => {
          const dayStr = String(d).padStart(2, '0')
          const dateKey = `${year}-${monthStr}-${dayStr}`
          const moodVal = moodHistory[dateKey]
          const moodOption = moodVal ? MOOD_BY_VALUE[String(moodVal)] : null
          // 0 = Sunday … 6 = Saturday
          const colIndex = (firstDayOfWeek + (d - 1)) % 7

          return (
            <DayCell
              key={dateKey}
              d={d}
              dateKey={dateKey}
              moodOption={moodOption}
              colIndex={colIndex}
            />
          )
        })}
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
