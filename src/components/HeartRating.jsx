import { HEART_OPTIONS } from '../data/content'

export default function HeartRating({ value, onChange }) {
  return (
    <div className="flex items-center justify-center gap-3">
      {HEART_OPTIONS.map((option) => {
        const selected = value === option.value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value, option.label)}
            className="group flex flex-col items-center gap-2 transition-transform duration-300 hover:scale-110"
          >
            <div
              className={`hicon flex h-[50px] w-[50px] items-center justify-center rounded-full text-2xl transition-all ${
                selected
                  ? 'scale-110 border border-primary/20 bg-primary-fixed/20 grayscale-0'
                  : 'bg-surface-container grayscale hover:grayscale-0'
              }`}
            >
              {option.emoji}
            </div>
            <span
              className={`text-[9px] transition-opacity ${
                selected ? 'font-bold text-primary opacity-100' : 'text-on-surface-variant opacity-0 group-hover:opacity-100'
              }`}
            >
              {option.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
