import { useState, useEffect, useRef } from 'react'
import { HEART_OPTIONS } from '../data/content'
import { MOOD_STICKERS } from '../assets/moodStickers'

const MOOD_BY_VALUE = Object.fromEntries(
  HEART_OPTIONS.map((o) => [String(o.value), o]),
)

/** Always render 6 weeks so card height never jumps between months. */
const WEEKS = 6
const CELLS = WEEKS * 7

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
 */
function tooltipClasses(colIndex) {
  if (colIndex <= 1) {
    return { box: 'left-0', caret: 'left-6' }
  }
  if (colIndex >= 5) {
    return { box: 'right-0', caret: 'right-6 left-auto' }
  }
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
    if (!open) return undefined
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
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

  if (d == null) {
    return <div className="min-h-0" aria-hidden />
  }

  if (!moodOption) {
    return (
      <div className="flex items-center justify-center min-h-0 h-full">
        <span className="font-manrope text-[11px] sm:text-xs font-medium text-[#004D40]/70 select-none">
          {d}
        </span>
      </div>
    )
  }

  return (
    <div ref={cellRef} className="flex items-center justify-center min-h-0 h-full relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-[90%] max-w-[3rem] aspect-square rounded-full flex items-center justify-center bg-gradient-to-br from-[#FFF0BE] via-[#E9C349] to-[#D4AF37] shadow-md hover:scale-105 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
        title={`${moodOption.label} - ${formatDateLabel(dateKey)}`}
      >
        <img
          src={MOOD_STICKERS[moodOption.stickerKey]}
          alt={moodOption.label}
          className="w-[88%] h-[88%] object-contain drop-shadow"
          draggable={false}
        />
      </button>

      {open && (
        <div
          className={`absolute bottom-full mb-2 z-40 w-52 bg-[#f9f7f2] rounded-2xl shadow-2xl border border-[#D4AF37]/25 p-4 flex flex-col items-center gap-2 ${box}`}
          style={{ animation: 'fadeSlideUp 0.18s ease-out' }}
        >
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
  const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0')

  /** Fixed 42-cell month grid (leading + days + trailing). */
  const cells = Array.from({ length: CELLS }, (_, i) => {
    const dayNum = i - firstDayOfWeek + 1
    if (dayNum < 1 || dayNum > daysInMonth) {
      return { key: `empty-${i}`, d: null, dateKey: null, moodOption: null, colIndex: i % 7 }
    }
    const dayStr = String(dayNum).padStart(2, '0')
    const dateKey = `${year}-${monthStr}-${dayStr}`
    const moodVal = moodHistory[dateKey]
    return {
      key: dateKey,
      d: dayNum,
      dateKey,
      moodOption: moodVal ? MOOD_BY_VALUE[String(moodVal)] : null,
      colIndex: i % 7,
    }
  })

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
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
          type="button"
          onClick={handleNextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#D4AF37]/10 text-[#004D40] transition active:scale-95"
          aria-label="Next month"
        >
          <span className="material-symbols-outlined text-sm translate-x-0.5">
            arrow_forward_ios
          </span>
        </button>
      </div>

      <div className="grid grid-cols-7 w-full gap-x-0 gap-y-0 mb-0.5">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={`dow-${i}`}
            className="font-manrope text-[10px] font-bold text-[#004D40]/60 uppercase py-1 text-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Fixed height: 6 equal rows — same size for Jul (5 weeks) and Aug (6 weeks) */}
      <div
        className="grid grid-cols-7 w-full gap-x-0 gap-y-0"
        style={{
          gridTemplateRows: `repeat(${WEEKS}, minmax(0, 1fr))`,
          height: '17.5rem',
        }}
      >
        {cells.map((cell) =>
          cell.d == null ? (
            <div key={cell.key} className="min-h-0" aria-hidden />
          ) : (
            <DayCell
              key={cell.key}
              d={cell.d}
              dateKey={cell.dateKey}
              moodOption={cell.moodOption}
              colIndex={cell.colIndex}
            />
          ),
        )}
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
