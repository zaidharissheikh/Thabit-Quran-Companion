import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FATIHA, SURAHS } from '../data/content'
import { ayahAudioUrl, formatAudioTime } from '../lib/quranAudio'

const RING_R = 46
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R

export default function PlaybackPage({ onVerseRead }) {
  const { surahId, verseId } = useParams()
  const navigate = useNavigate()
  const countedRef = useRef(false)

  const surahNum = Number(surahId)
  const verseNum = Number(verseId)

  const surah = SURAHS.find((s) => s.num === surahNum) || SURAHS[0]
  const verses = surahNum === 1 ? FATIHA : []
  const verse = verses.find((v) => v.num === verseNum) || verses[0]
  const maxVerse = surah.verses || verses.length || 1

  const audioRef = useRef(null)
  const autoPlayAfterLoad = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loadError, setLoadError] = useState('')

  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress)

  const stopAndReset = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    setPlaying(false)
    setCurrentTime(0)
  }, [])

  useEffect(() => {
    countedRef.current = false
  }, [surahNum, verseNum])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return undefined

    const url = ayahAudioUrl(surahNum, verseNum)
    setLoadError('')
    setPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    audio.src = url
    audio.load()

    const onLoaded = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
      if (autoPlayAfterLoad.current) {
        autoPlayAfterLoad.current = false
        audio.play().catch(() => {
          setLoadError('Playback was blocked. Tap play again.')
        })
      }
    }
    const onTime = () => setCurrentTime(audio.currentTime || 0)
    const onEnded = () => {
      setPlaying(false)
      setCurrentTime(audio.duration || 0)
      if (!repeat && !countedRef.current && typeof onVerseRead === 'function') {
        countedRef.current = true
        onVerseRead(surahNum, verseNum)
      }
    }
    const onError = () => {
      setPlaying(false)
      setLoadError('Could not load this ayah audio.')
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)

    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('durationchange', onLoaded)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)

    return () => {
      audio.pause()
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('durationchange', onLoaded)
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
    }
  }, [surahNum, verseNum, repeat, onVerseRead])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) audio.loop = repeat
  }, [repeat])

  async function togglePlay() {
    const audio = audioRef.current
    if (!audio) return

    if (playing) {
      audio.pause()
      return
    }

    // Restart if finished
    if (duration > 0 && currentTime >= duration - 0.05) {
      audio.currentTime = 0
      setCurrentTime(0)
    }

    try {
      await audio.play()
    } catch {
      setLoadError('Playback was blocked. Tap play again.')
      setPlaying(false)
    }
  }

  function goToVerse(next, { autoPlay = false } = {}) {
    if (next < 1 || next > maxVerse) return
    autoPlayAfterLoad.current = autoPlay
    stopAndReset()
    navigate(`/play/${surahNum}/${next}`)
  }

  function shuffleVerse() {
    if (maxVerse <= 1) return
    let next = verseNum
    let guard = 0
    while (next === verseNum && guard < 20) {
      next = 1 + Math.floor(Math.random() * maxVerse)
      guard += 1
    }
    goToVerse(next, { autoPlay: true })
  }

  const remaining = Math.max(0, (duration || 0) - (currentTime || 0))

  return (
    <div className="bg-[var(--app-bg)] text-[var(--app-text)] font-manrope min-h-screen selection:bg-[#ebc349] selection:text-[#3d2f00] relative overflow-x-hidden app-shell md:pl-[256px]">
      <audio ref={audioRef} preload="auto" />

      <div className="absolute top-0 left-0 md:left-[256px] p-6 z-50">
        <button
          type="button"
          onClick={() => {
            stopAndReset()
            navigate(-1)
          }}
          className="flex items-center justify-center text-[var(--app-accent)] hover:opacity-80 transition-opacity active:scale-95"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
      </div>

      <main className="px-6 flex flex-col items-center pt-16 relative z-10 max-w-[430px] mx-auto">
        <div className="text-center mb-6 w-full">
          <h1 className="font-headline text-3xl font-bold text-[var(--app-accent)] uppercase tracking-wider">
            {surah.name}
          </h1>
        </div>

        <section className="relative flex justify-center items-center my-8">
          <div className="absolute w-72 h-72 rounded-full bg-[var(--app-accent)]/10 blur-3xl" />

          <div className="relative w-[280px] h-[280px] flex items-center justify-center p-4">
            <div className="absolute inset-0 rounded-full border-4 border-[var(--app-border)]" />

            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                fill="none"
                r={RING_R}
                stroke="url(#goldGradient)"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                strokeWidth="4"
                className="transition-[stroke-dashoffset] duration-150 ease-linear"
              />
              <defs>
                <linearGradient id="goldGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#c5a059" stopOpacity={1} />
                  <stop offset="100%" stopColor="#8e6e33" stopOpacity={1} />
                </linearGradient>
              </defs>
            </svg>

            <div className="relative z-10 w-48 h-48 rounded-full shadow-[0_10px_30px_-10px_rgba(0,0,0,0.12)] flex flex-col items-center justify-center overflow-hidden bg-[var(--app-surface)] border-2 border-[var(--app-accent)]/40">
              <span className="font-headline text-[48px] text-[var(--app-accent)] relative z-20 font-bold leading-none mb-1">
                {verseNum}
              </span>
              <span className="font-manrope text-sm text-[var(--app-accent)] tracking-widest uppercase relative z-20 font-semibold">
                Ayah
              </span>
            </div>
          </div>
        </section>

        <section className="w-full max-w-lg space-y-6 text-center mt-4 pb-48">
          <div className="relative py-6 px-4 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-sm">
            <div className="flex items-center justify-center space-x-4 mb-6 opacity-70">
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[var(--app-accent)]" />
              <span
                className="material-symbols-outlined text-[var(--app-accent)] text-xs"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[var(--app-accent)]" />
            </div>

            <h2 className="ayah-arabic text-[var(--app-text)] mb-6 px-4" dir="rtl">
              {verse ? verse.ar : 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ'}
            </h2>

            <p className="ayah-translation text-[var(--app-text)] max-w-sm mx-auto opacity-80">
              &quot;
              {verse
                ? verse.en
                : 'In the name of Allah, the Entirely Merciful, the Especially Merciful.'}
              &quot;
            </p>

            {loadError ? (
              <p className="mt-4 text-sm text-[var(--app-danger)] font-manrope">{loadError}</p>
            ) : null}

            <div className="flex items-center justify-center space-x-4 mt-6 opacity-70">
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[var(--app-accent)]" />
              <span
                className="material-symbols-outlined text-[var(--app-accent)] text-xs"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[var(--app-accent)]" />
            </div>
          </div>
        </section>
      </main>

      <section className="fixed bottom-10 left-0 md:left-[256px] right-0 px-6 z-40">
        <div className="max-w-[400px] mx-auto bg-[var(--app-surface)] backdrop-blur-md rounded-2xl p-6 shadow-xl flex flex-col gap-6 border border-[var(--app-border)]">
          <div className="flex justify-between items-center px-2">
            <span className="text-[10px] font-manrope font-semibold text-[var(--app-text-muted)] uppercase tracking-wider">
              {formatAudioTime(currentTime)}
            </span>
            <span className="text-[10px] font-manrope font-semibold text-[var(--app-text-muted)] uppercase tracking-wider">
              -{formatAudioTime(remaining)}
            </span>
          </div>

          <div className="flex items-center justify-between px-2">
            <button
              type="button"
              onClick={shuffleVerse}
              disabled={maxVerse <= 1}
              className={`transition-colors ${
                maxVerse > 1
                  ? 'text-[var(--app-accent)] active:scale-95'
                  : 'text-[var(--app-accent)]/30 cursor-not-allowed'
              }`}
              aria-label="Shuffle to a random ayah"
              title="Play a random ayah in this surah"
            >
              <span className="material-symbols-outlined">shuffle</span>
            </button>
            <div className="flex items-center gap-8">
              <button
                type="button"
                onClick={() => goToVerse(verseNum - 1)}
                className={`transition-transform ${
                  verseNum > 1
                    ? 'text-[var(--app-accent)] active:scale-90'
                    : 'text-[var(--app-accent)]/30'
                }`}
                disabled={verseNum <= 1}
                aria-label="Previous ayah"
              >
                <span
                  className="material-symbols-outlined text-3xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  skip_previous
                </span>
              </button>
              <button
                type="button"
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ffe088] to-[#af8d11] shadow-lg flex items-center justify-center text-[#241a00] active:scale-95 transition-all"
                aria-label={playing ? 'Pause' : 'Play'}
              >
                <span
                  className="material-symbols-outlined text-4xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {playing ? 'pause' : 'play_arrow'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => goToVerse(verseNum + 1)}
                className={`transition-transform ${
                  verseNum < maxVerse
                    ? 'text-[var(--app-accent)] active:scale-90'
                    : 'text-[var(--app-accent)]/30'
                }`}
                disabled={verseNum >= maxVerse}
                aria-label="Next ayah"
              >
                <span
                  className="material-symbols-outlined text-3xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  skip_next
                </span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setRepeat((prev) => !prev)}
              className={`transition-colors ${
                repeat
                  ? 'text-[var(--app-accent)]'
                  : 'text-[var(--app-accent)]/60 active:text-[var(--app-accent)]'
              }`}
              aria-label={repeat ? 'Repeat on' : 'Repeat off'}
              aria-pressed={repeat}
              title={repeat ? 'Repeat this ayah: on' : 'Repeat this ayah: off'}
            >
              <span
                className="material-symbols-outlined"
                style={repeat ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                repeat
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
