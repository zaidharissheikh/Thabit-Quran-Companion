import { HEART_OPTIONS } from '../data/content'
import { getMoodStickers } from '../assets/moodStickers'

export default function HeartRating({ value, onChange, stickerPack }) {
  const stickers = getMoodStickers(stickerPack)

  return (
    // gap-2 on mobile (5×60 + 4×8 = 332px ✓), gap-3 on lg (5×76 + 4×12 = 428px ✓)
    <div className="flex items-center justify-center gap-2 lg:gap-3">
      {HEART_OPTIONS.map((option) => {
        const selected = value === option.value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value, option.label)}
            className="group flex flex-col items-center gap-1.5 transition-transform duration-300 hover:scale-110 min-w-0"
          >
            <div
              className={`hicon flex items-center justify-center transition-all duration-200
                h-[60px] w-[60px] lg:h-[76px] lg:w-[76px]
                ${selected
                  ? 'scale-110'
                  : 'grayscale hover:grayscale-0 opacity-80 hover:opacity-100'
                }`}
            >
              <img
                src={stickers[option.stickerKey] || `/assets/${option.stickerKey}.png`}
                alt={option.label}
                className="w-12 h-12 lg:w-[4.25rem] lg:h-[4.25rem] object-contain drop-shadow-sm"
                draggable={false}
              />
            </div>
            <span
              className={`text-[9px] font-bold uppercase tracking-wide transition-all duration-200 leading-none ${
                selected
                  ? 'text-[#004D40] opacity-100'
                  : 'text-[#004D40]/50 opacity-0 group-hover:opacity-100'
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
