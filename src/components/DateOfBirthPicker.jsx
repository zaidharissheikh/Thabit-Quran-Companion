import { useEffect, useMemo, useRef, useState } from 'react'
import {
  formatDisplayDate,
  maxDobIsoForMinAge,
  toIsoDate,
} from '../lib/formValidation'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function parseIso(iso) {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

/**
 * Custom DOB calendar. Only dates that make the user at least `minAge` are selectable.
 */
export default function DateOfBirthPicker({
  value,
  onChange,
  minAge = 11,
  error = '',
  id = 'signup-dob',
}) {
  const maxIso = maxDobIsoForMinAge(minAge)
  const maxDate = parseIso(maxIso)
  const [open, setOpen] = useState(false)
  const initialView = parseIso(value) || maxDate || new Date()
  const [view, setView] = useState(startOfMonth(initialView))
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    function onDoc(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    if (open) {
      setView(startOfMonth(parseIso(value) || parseIso(maxIso) || new Date()))
    }
  }, [open, value, maxIso])

  const cells = useMemo(() => {
    const first = startOfMonth(view)
    const startPad = first.getDay()
    const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate()
    const items = []
    for (let i = 0; i < startPad; i += 1) items.push(null)
    for (let day = 1; day <= daysInMonth; day += 1) {
      items.push(new Date(view.getFullYear(), view.getMonth(), day))
    }
    return items
  }, [view])

  const years = useMemo(() => {
    const latest = maxDate?.getFullYear() ?? new Date().getFullYear() - minAge
    const earliest = latest - 100
    const list = []
    for (let y = latest; y >= earliest; y -= 1) list.push(y)
    return list
  }, [maxDate, minAge])

  function canSelect(date) {
    if (!maxDate) return true
    return date.getTime() <= maxDate.getTime()
  }

  function selectDay(date) {
    if (!canSelect(date)) return
    onChange(toIsoDate(date))
    setOpen(false)
  }

  function shiftMonth(delta) {
    setView((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }

  const display = formatDisplayDate(value) || 'mm/dd/yyyy'
  const selectedIso = value

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        id={id}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`w-full bg-[#001f1b] border rounded-lg py-3 pl-11 pr-11 text-left transition-all outline-none ${
          error
            ? 'border-red-400/70 focus:border-red-300'
            : 'border-[#c6a34f]/30 focus:border-[#c6a34f]'
        } ${value ? 'text-[#e5e2db]' : 'text-[#c6a34f]/30'}`}
      >
        {display}
      </button>
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#c6a34f]/70 pointer-events-none">
        calendar_today
      </span>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-[#c6a34f] hover:bg-[#c6a34f]/10 transition-colors"
        aria-label="Open calendar"
      >
        <span className="material-symbols-outlined text-[22px]">edit_calendar</span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Choose date of birth"
          className="absolute z-50 mt-2 left-0 right-0 rounded-xl border border-[#c6a34f]/35 bg-[#002822] shadow-2xl p-3"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="w-8 h-8 rounded-full text-[#c6a34f] hover:bg-[#c6a34f]/10"
              aria-label="Previous month"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <select
                value={view.getMonth()}
                onChange={(e) =>
                  setView(new Date(view.getFullYear(), Number(e.target.value), 1))
                }
                className="bg-[#001f1b] border border-[#c6a34f]/30 text-[#e5e2db] text-sm rounded-md px-2 py-1 outline-none"
              >
                {MONTHS.map((label, idx) => (
                  <option key={label} value={idx}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                value={view.getFullYear()}
                onChange={(e) =>
                  setView(new Date(Number(e.target.value), view.getMonth(), 1))
                }
                className="bg-[#001f1b] border border-[#c6a34f]/30 text-[#e5e2db] text-sm rounded-md px-2 py-1 outline-none max-w-[5.5rem]"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="w-8 h-8 rounded-full text-[#c6a34f] hover:bg-[#c6a34f]/10"
              aria-label="Next month"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="text-center text-[10px] font-manrope font-bold uppercase tracking-wide text-[#c6a34f]/55 py-1"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((date, idx) => {
              if (!date) {
                return <div key={`empty-${idx}`} className="h-9" />
              }
              const iso = toIsoDate(date)
              const disabled = !canSelect(date)
              const selected = selectedIso === iso
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectDay(date)}
                  className={`h-9 rounded-lg text-sm font-manrope transition-colors ${
                    selected
                      ? 'bg-[#c6a34f] text-[#241a00] font-bold'
                      : disabled
                        ? 'text-[#e5e2db]/20 cursor-not-allowed'
                        : 'text-[#e5e2db] hover:bg-[#c6a34f]/15'
                  }`}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>

          <p className="mt-3 text-[11px] font-manrope text-[#c6a34f]/65 text-center">
            You must be at least {minAge} years old
          </p>
        </div>
      ) : null}
    </div>
  )
}
