import { useState } from 'react'
import { Link } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { FATIHA } from '../data/content'

export default function ReaderPage({ state, onBookmarkVerse, onReflectVerse, onPlayVerse }) {
  const [audioOpen, setAudioOpen] = useState(false)

  return (
    <div className="min-h-screen bg-surface pattern-bg">
      <header className="fixed top-0 z-50 flex h-20 w-full max-w-[430px] items-center justify-between border-b border-outline-variant/20 bg-[#FFF9EF]/92 px-6 backdrop-blur-md">
        <Link to="/" className="material-symbols-outlined text-primary transition hover:opacity-70">
          arrow_back
        </Link>
        <h1 className="font-serif text-xl font-bold text-primary">ثابت</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAudioOpen((open) => !open)}
            className="material-symbols-outlined text-primary transition hover:opacity-70"
          >
            headphones
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/20 bg-surface-container-high text-sm font-bold text-primary">
            {state.name[0].toUpperCase()}
          </div>
        </div>
      </header>

      <main className="noscroll mx-auto max-h-[100dvh] max-w-2xl overflow-y-auto px-6 pb-40 pt-24">
        <section className="mb-16 text-center">
          <span className="mb-2 block text-[10px] font-medium uppercase tracking-[.2em] text-secondary">The Opening</span>
          <h2 className="font-serif text-5xl font-bold tracking-tight text-primary">Al-Fatiha</h2>
          <div className="mt-6 flex items-center justify-center gap-6">
            <div className="h-px w-12 bg-outline-variant/30" />
            <span className="material-symbols-outlined text-4xl text-primary/30">settings_input_component</span>
            <div className="h-px w-12 bg-outline-variant/30" />
          </div>
        </section>

        <div className="space-y-16">
          {FATIHA.map((verse) => {
            const bookmarked = state.bookmarks.some((bookmark) => bookmark.num === verse.num)

            return (
              <article key={verse.num} className="group flex flex-col items-center text-center">
                <div className="relative mb-6 w-full border-b border-outline-variant/15 pb-8">
                  <div className="absolute -right-1 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-surface-container-lowest text-xs font-medium text-primary shadow-sm">
                    {verse.num}
                  </div>
                  <p className="arabic-text mb-5 pr-10 text-4xl leading-relaxed text-on-surface" dir="rtl">
                    {verse.ar}
                  </p>
                  <p className="mb-5 text-base font-light italic leading-relaxed text-on-surface-variant/80">{verse.en}</p>
                  <div className="flex justify-center gap-5 transition-all duration-500 md:opacity-0 md:group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => onBookmarkVerse(verse)}
                      className="flex items-center gap-1.5 text-sm text-primary/50 transition hover:text-primary"
                    >
                      <span className={`material-symbols-outlined text-lg ${bookmarked ? 'fill-icon text-primary' : ''}`}>bookmark</span>
                      {bookmarked ? 'Saved' : 'Bookmark'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onReflectVerse({
                          ref: `Al-Fatiha verse ${verse.num}`,
                          prompt: `User read: "${verse.ar}" meaning "${verse.en}". Write a warm 2-sentence reflection to apply today.`,
                        })
                      }
                      className="flex items-center gap-1.5 text-sm text-primary/50 transition hover:text-primary"
                    >
                      <span className="material-symbols-outlined text-lg">auto_awesome</span>
                      Reflect
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAudioOpen(true)
                        onPlayVerse(verse.num)
                      }}
                      className="flex items-center gap-1.5 text-sm text-primary/50 transition hover:text-primary"
                    >
                      <span className="material-symbols-outlined text-lg">play_circle</span>
                      Listen
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </main>

      <div className={`${audioOpen ? '' : 'hidden'} fixed bottom-[72px] left-0 right-0 z-40 mx-auto max-w-[430px] px-4`}>
        <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-inverse-surface/95 p-4 shadow-2xl backdrop-blur-xl">
          <button
            type="button"
            onClick={onPlayVerse}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed"
          >
            <span className="material-symbols-outlined fill-icon text-lg">{state.audioPlaying ? 'pause' : 'play_arrow'}</span>
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-inverse-on-surface">Mishary Rashid Alafasy</p>
            <p className="text-[10px] text-inverse-on-surface/50">Al-Fatiha</p>
          </div>
          <div className="h-1 flex-1 rounded-full bg-white/20">
            <div className="h-full rounded-full bg-primary-fixed-dim transition-all" style={{ width: `${state.audioProgress}%` }} />
          </div>
          <button type="button" onClick={() => setAudioOpen(false)} className="material-symbols-outlined text-sm text-white/40">
            close
          </button>
        </div>
      </div>

      <BottomNav active="/reader" />
    </div>
  )
}
