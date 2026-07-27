import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { SURAHS } from '../data/content'
import { formatAudioTime } from '../lib/quranAudio'
import { resolveAyahAudioUrl, cacheAyahAudio } from '../lib/ayahAudioCache'
import {
  getCachedVerse,
  hydrateChapterFromIdb,
  loadChapterVerses,
  prefetchAyahAudio,
} from '../lib/verseCache'

const RING_R = 46
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R

function emptyVerse(num) {
  return { num, ar: '', en: '' }
}

export default function PlaybackPage({ onVerseRead }) {
  const { surahId, verseId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const surahNum = Number(surahId)
  const verseNum = Number(verseId)
  const surah = SURAHS.find((s) => s.num === surahNum) || SURAHS[0]
  const maxVerse = surah.verses || 1

  const continuous = searchParams.get('mode') === 'surah'
  const autoStartedRef = useRef(false)
  const countedRef = useRef(false)
  const autoPlayAfterLoad = useRef(false)
  const continuousRef = useRef(continuous)
  const repeatRef = useRef(false)
  const onVerseReadRef = useRef(onVerseRead)
  const surahNumRef = useRef(surahNum)
  const verseNumRef = useRef(verseNum)
  const maxVerseRef = useRef(maxVerse)
  const navigateRef = useRef(navigate)

  const setContinuous = useCallback(
    (on) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (on) next.set('mode', 'surah')
          else next.delete('mode')
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  // Auto-start when opened via "Play entire surah"
  useEffect(() => {
    if (!continuous) {
      autoStartedRef.current = false
      return
    }
    if (!autoStartedRef.current) {
      autoStartedRef.current = true
      autoPlayAfterLoad.current = true
    }
  }, [continuous])

  continuousRef.current = continuous
  onVerseReadRef.current = onVerseRead
  surahNumRef.current = surahNum
  verseNumRef.current = verseNum
  maxVerseRef.current = maxVerse
  navigateRef.current = navigate

  const [verse, setVerse] = useState(
    () => getCachedVerse(surahNum, verseNum) || emptyVerse(verseNum),
  )
  const [textError, setTextError] = useState('')
  const [textLoading, setTextLoading] = useState(
    () => !getCachedVerse(surahNum, verseNum),
  )

  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [audioReady, setAudioReady] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loadError, setLoadError] = useState('')

  repeatRef.current = repeat

  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress)

  // Resolve ayah text from cache first; fetch chapter once if needed.
  useEffect(() => {
    let cancelled = false
    const cached = getCachedVerse(surahNum, verseNum)
    if (cached) {
      setVerse(cached)
      setTextError('')
      setTextLoading(false)
    } else {
      setVerse(emptyVerse(verseNum))
      setTextLoading(true)
      setTextError('')
    }

    ;(async () => {
      try {
        // Instant paint from IndexedDB if we've opened this chapter before
        if (!cached) {
          const hydrated = await hydrateChapterFromIdb(surahNum)
          if (cancelled) return
          const fromIdb = hydrated?.find((v) => v.num === verseNum)
          if (fromIdb) {
            setVerse(fromIdb)
            setTextLoading(false)
          }
        }

        const rows = await loadChapterVerses(surahNum)
        if (cancelled) return
        const found = rows.find((v) => v.num === verseNum)
        if (found) {
          setVerse(found)
          setTextError('')
        } else {
          setTextError('Could not load this ayah text.')
        }
      } catch {
        if (cancelled) return
        if (!getCachedVerse(surahNum, verseNum)) {
          setTextError('Could not load ayah text from the API.')
        }
      } finally {
        if (!cancelled) setTextLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [surahNum, verseNum])

  // Prefetch next ayah audio into Cache API
  useEffect(() => {
    if (verseNum < maxVerse) {
      prefetchAyahAudio(surahNum, verseNum + 1)
    }
    // Also ensure current ayah is cached after play starts
    void cacheAyahAudio(surahNum, verseNum)
  }, [surahNum, verseNum, maxVerse])

  useEffect(() => {
    countedRef.current = false
  }, [surahNum, verseNum])

  // Load audio for current ayah. Stable deps - use refs for flags/callbacks.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return undefined

    let cancelled = false
    setLoadError('')
    setPlaying(false)
    setAudioReady(false)
    setCurrentTime(0)
    setDuration(0)
    audio.pause()

    const markReady = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
      setAudioReady(true)
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

      const s = surahNumRef.current
      const v = verseNumRef.current
      const max = maxVerseRef.current

      if (!repeatRef.current && !countedRef.current && typeof onVerseReadRef.current === 'function') {
        countedRef.current = true
        onVerseReadRef.current(s, v)
      }

      if (repeatRef.current) return

      if (continuousRef.current && v < max) {
        autoPlayAfterLoad.current = true
        navigateRef.current(`/play/${s}/${v + 1}?mode=surah`, { replace: true })
        return
      }

      if (continuousRef.current && v >= max) {
        autoPlayAfterLoad.current = false
      }
    }

    const onError = () => {
      setPlaying(false)
      setAudioReady(false)
      setLoadError('Could not load this ayah audio.')
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)

    audio.addEventListener('loadedmetadata', markReady)
    audio.addEventListener('canplay', markReady)
    audio.addEventListener('durationchange', markReady)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)

    ;(async () => {
      try {
        const url = await resolveAyahAudioUrl(surahNum, verseNum)
        if (cancelled || !audioRef.current) return
        audio.src = url
        audio.load()
      } catch {
        if (!cancelled) setLoadError('Could not load this ayah audio.')
      }
    })()

    return () => {
      cancelled = true
      audio.pause()
      audio.removeEventListener('loadedmetadata', markReady)
      audio.removeEventListener('canplay', markReady)
      audio.removeEventListener('durationchange', markReady)
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
    }
  }, [surahNum, verseNum])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) audio.loop = repeat && !continuous
  }, [repeat, continuous])

  const stopAndReset = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    setPlaying(false)
    setCurrentTime(0)
  }, [])

  async function togglePlay() {
    const audio = audioRef.current
    if (!audio) return

    if (playing) {
      audio.pause()
      return
    }

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
    const qs = continuous ? '?mode=surah' : ''
    navigate(`/play/${surahNum}/${next}${qs}`)
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

  function toggleContinuous() {
    const next = !continuous
    setContinuous(next)
    if (next && !playing) {
      autoPlayAfterLoad.current = true
      const audio = audioRef.current
      if (audio && audioReady) {
        autoPlayAfterLoad.current = false
        audio.play().catch(() => {
          setLoadError('Playback was blocked. Tap play again.')
        })
      }
    }
  }

  const remaining = Math.max(0, (duration || 0) - (currentTime || 0))

  return (
    <div className="bg-[var(--app-bg)] text-[var(--app-text)] font-manrope min-h-screen selection:bg-[#ebc349] selection:text-[#3d2f00] relative overflow-x-hidden app-shell md:pl-[256px]">
      <audio ref={audioRef} preload="auto" playsInline />

      <header className="sticky top-0 z-50 flex items-center gap-3 px-4 py-3 md:px-8 bg-[var(--app-bg)]/90 backdrop-blur-sm border-b border-[var(--app-border)]/40">
        <button
          type="button"
          onClick={() => {
            stopAndReset()
            navigate(-1)
          }}
          className="flex items-center justify-center text-[var(--app-accent)] hover:opacity-80 transition-opacity active:scale-95 shrink-0"
          aria-label="Go back"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <div className="min-w-0 flex-1 text-center md:text-left pr-8 md:pr-0">
          <h1 className="font-headline text-xl md:text-2xl font-bold text-[var(--app-accent)] uppercase tracking-wider truncate">
            {surah.name}
          </h1>
          <p className="text-xs md:text-sm text-[var(--app-text-muted)] font-manrope truncate">
            Ayah {verseNum} of {maxVerse}
            {continuous ? ' · Playing surah' : ''}
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-6 md:px-10 lg:px-14 py-6 md:py-10 w-full max-w-5xl mx-auto flex flex-col gap-10 md:gap-14 pb-10">
        {/* Circle + verse: stacked on mobile, two columns on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 md:items-center">
          <section className="relative flex justify-center items-center order-1">
            <div className="absolute w-56 h-56 md:w-72 md:h-72 rounded-full bg-[var(--app-accent)]/10 blur-3xl pointer-events-none" />

            <div className="relative w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] md:w-[280px] md:h-[280px] flex items-center justify-center p-3 sm:p-4">
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

              <div className="relative z-10 w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full shadow-[0_10px_30px_-10px_rgba(0,0,0,0.12)] flex flex-col items-center justify-center overflow-hidden bg-[var(--app-surface)] border-2 border-[var(--app-accent)]/40">
                <span className="font-headline text-[40px] sm:text-[48px] text-[var(--app-accent)] relative z-20 font-bold leading-none mb-1">
                  {verseNum}
                </span>
                <span className="font-manrope text-xs sm:text-sm text-[var(--app-accent)] tracking-widest uppercase relative z-20 font-semibold">
                  Ayah
                </span>
              </div>
            </div>
          </section>

          <section className="order-2 w-full min-w-0">
            <div className="relative py-6 px-4 sm:px-6 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-sm text-center h-full flex flex-col justify-center min-h-[200px] md:min-h-[280px]">
              <div className="flex items-center justify-center space-x-4 mb-5 opacity-70">
                <div className="h-[1px] w-10 sm:w-12 bg-gradient-to-r from-transparent to-[var(--app-accent)]" />
                <span
                  className="material-symbols-outlined text-[var(--app-accent)] text-xs"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                <div className="h-[1px] w-10 sm:w-12 bg-gradient-to-l from-transparent to-[var(--app-accent)]" />
              </div>

              <h2 className="ayah-arabic text-[var(--app-text)] mb-5 px-2 min-h-[1.5em]" dir="rtl">
                {verse?.ar || (textLoading ? '…' : '')}
              </h2>

              <p className="ayah-translation text-[var(--app-text)] max-w-md mx-auto opacity-80 min-h-[2.5em]">
                {verse?.en
                  ? `“${verse.en}”`
                  : textLoading
                    ? 'Loading translation…'
                    : ''}
              </p>

              {textError ? (
                <p className="mt-3 text-sm text-[var(--app-danger)] font-manrope">{textError}</p>
              ) : null}
              {loadError ? (
                <p className="mt-3 text-sm text-[var(--app-danger)] font-manrope">{loadError}</p>
              ) : null}

              <div className="flex items-center justify-center space-x-4 mt-5 opacity-70">
                <div className="h-[1px] w-10 sm:w-12 bg-gradient-to-r from-transparent to-[var(--app-accent)]" />
                <span
                  className="material-symbols-outlined text-[var(--app-accent)] text-xs"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                <div className="h-[1px] w-10 sm:w-12 bg-gradient-to-l from-transparent to-[var(--app-accent)]" />
              </div>
            </div>
          </section>
        </div>

        {/* Playback controls - in document flow, never overlays the verse card */}
        <section className="order-3 w-full max-w-xl mx-auto">
          <div className="bg-[var(--app-surface)] rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col gap-4 border border-[var(--app-border)]">
            <button
              type="button"
              onClick={toggleContinuous}
              className={`w-full py-2.5 rounded-xl font-manrope text-sm font-semibold tracking-wide transition-colors ${
                continuous
                  ? 'bg-[#FFD700] text-[#062c21]'
                  : 'border border-[var(--app-accent)]/40 text-[var(--app-accent)] hover:bg-[var(--app-accent)]/10'
              }`}
              aria-pressed={continuous}
            >
              {continuous ? 'Playing entire surah' : 'Play entire surah'}
            </button>

            <div className="flex justify-between items-center px-1 sm:px-2">
              <span className="text-[10px] font-manrope font-semibold text-[var(--app-text-muted)] uppercase tracking-wider">
                {formatAudioTime(currentTime)}
              </span>
              <span className="text-[10px] font-manrope font-semibold text-[var(--app-text-muted)] uppercase tracking-wider">
                {!audioReady && !loadError ? 'Loading…' : `-${formatAudioTime(remaining)}`}
              </span>
            </div>

            <div className="flex items-center justify-between px-1 sm:px-2">
              <button
                type="button"
                onClick={shuffleVerse}
                disabled={maxVerse <= 1 || continuous}
                className={`transition-colors ${
                  maxVerse > 1 && !continuous
                    ? 'text-[var(--app-accent)] active:scale-95'
                    : 'text-[var(--app-accent)]/30 cursor-not-allowed'
                }`}
                aria-label="Shuffle to a random ayah"
              >
                <span className="material-symbols-outlined">shuffle</span>
              </button>
              <div className="flex items-center gap-5 sm:gap-8">
                <button
                  type="button"
                  onClick={() => goToVerse(verseNum - 1, { autoPlay: continuous || playing })}
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
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#ffe088] to-[#af8d11] shadow-lg flex items-center justify-center text-[#241a00] active:scale-95 transition-all"
                  aria-label={playing ? 'Pause' : 'Play'}
                >
                  <span
                    className="material-symbols-outlined text-3xl sm:text-4xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {playing ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => goToVerse(verseNum + 1, { autoPlay: continuous || playing })}
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
                disabled={continuous}
                className={`transition-colors ${
                  continuous
                    ? 'text-[var(--app-accent)]/30 cursor-not-allowed'
                    : repeat
                      ? 'text-[var(--app-accent)]'
                      : 'text-[var(--app-accent)]/60 active:text-[var(--app-accent)]'
                }`}
                aria-label={repeat ? 'Repeat on' : 'Repeat off'}
                aria-pressed={repeat}
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
      </main>
    </div>
  )
}
