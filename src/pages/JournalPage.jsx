import BottomNav from '../components/BottomNav'
import { Link } from 'react-router-dom'

export default function JournalPage({ journals }) {
  return (
    <div className="min-h-screen bg-surface">
      <header className="fixed top-0 z-50 flex h-20 w-full max-w-[430px] items-center justify-between border-b border-outline-variant/20 bg-[#FFF9EF]/92 px-6 backdrop-blur-md">
        <Link to="/" className="material-symbols-outlined text-primary transition hover:opacity-70">
          arrow_back
        </Link>
        <h1 className="font-serif text-xl font-bold text-primary">ثابت</h1>
        <span className="material-symbols-outlined text-primary">edit_note</span>
      </header>

      <main className="noscroll mx-auto max-h-[100dvh] max-w-lg space-y-5 overflow-y-auto px-5 pb-32 pt-24">
        <section className="space-y-2 pt-2 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[.2em] text-secondary">Your Reflections</p>
          <h2 className="font-serif text-3xl text-on-surface">Journal</h2>
        </section>

        {journals.length === 0 ? (
          <div className="py-14 text-center">
            <span className="material-symbols-outlined mb-3 block text-4xl text-on-surface-variant/30">auto_stories</span>
            <p className="text-sm text-on-surface-variant/50">
              No reflections yet.
              <br />
              Post one from Momentum.
            </p>
          </div>
        ) : (
          journals.map((journal, index) => (
            <article key={`${journal.date}-${index}`} className="mb-4 rounded-2xl border border-outline-variant/10 bg-surface-container-low p-5">
              <div className="mb-2 flex items-start justify-between">
                <span className="text-[10px] uppercase tracking-widest text-primary/60">{journal.verse || ''}</span>
                <span className="text-[10px] text-on-surface-variant/50">{journal.date}</span>
              </div>
              <p className="font-serif text-sm italic leading-relaxed text-on-surface/80">"{journal.text}"</p>
            </article>
          ))
        )}
      </main>

      <BottomNav active="/journal" />
    </div>
  )
}
