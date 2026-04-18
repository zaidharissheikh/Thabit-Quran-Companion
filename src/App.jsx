import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import AiReflectionSheet from './components/AiReflectionSheet'
import Toast from './components/Toast'
import { VERSES } from './data/content'
import HomePage from './pages/HomePage'
import JournalPage from './pages/JournalPage'
import MomentumPage from './pages/MomentumPage'
import OnboardingPage from './pages/OnboardingPage'
import ReaderPage from './pages/ReaderPage'
import ReturnPage from './pages/ReturnPage'
import { askClaude } from './utils/ai'

const STORAGE_KEY = 'thabit_v3'

const initialState = {
  name: 'Friend',
  goal: 10,
  streak: 0,
  versesReadToday: 0,
  heartRating: 3,
  sessions: [],
  bookmarks: [],
  journals: [],
  audioPlaying: false,
  audioProgress: 0,
}

function getPersistedState() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return { state: initialState, isOnboarded: false }
  }

  try {
    const parsed = JSON.parse(raw)
    return {
      state: { ...initialState, ...parsed },
      isOnboarded: Boolean(parsed.name && parsed.name !== 'Friend'),
    }
  } catch {
    return { state: initialState, isOnboarded: false }
  }
}

function App() {
  const navigate = useNavigate()
  const audioTimer = useRef(null)
  const toastTimer = useRef(null)
  const persisted = useMemo(() => getPersistedState(), [])

  const [state, setState] = useState(persisted.state)
  const [isOnboarded, setIsOnboarded] = useState(persisted.isOnboarded)
  const [nudge, setNudge] = useState('')
  const [reflectionQuestion, setReflectionQuestion] = useState('')
  const [returnMessage, setReturnMessage] = useState('')
  const [toast, setToast] = useState('')
  const [sheet, setSheet] = useState({ open: false, ref: '', body: '', loading: false })

  const todayVerse = useMemo(() => VERSES[new Date().getDay() % VERSES.length], [])

  useEffect(() => {
    if (isOnboarded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  }, [state, isOnboarded])

  useEffect(() => {
    return () => {
      if (audioTimer.current) {
        clearInterval(audioTimer.current)
      }
      if (toastTimer.current) {
        clearTimeout(toastTimer.current)
      }
    }
  }, [])

  const showToast = useCallback((message) => {
    setToast(message)
    if (toastTimer.current) {
      clearTimeout(toastTimer.current)
    }
    toastTimer.current = window.setTimeout(() => setToast(''), 2600)
  }, [])

  const generateNudge = useCallback(async () => {
    const text = await askClaude(
      `You are Thabit, a warm Islamic companion. User ${state.name} has a ${state.streak}-day Quran reading streak. Write a short heartfelt 2-sentence daily reminder. Warm, not guilt-tripping. No greetings.`,
      state,
      140,
    )
    setNudge(text)
  }, [state])

  const generateReflectionQuestion = useCallback(async () => {
    const total = state.sessions.reduce((sum, session) => sum + session.verses, 0)
    const avgHeart = (
      state.sessions.reduce((sum, session) => sum + (session.heart || 3), 0) / Math.max(state.sessions.length, 1)
    ).toFixed(1)
    const question = await askClaude(
      `A Muslim tracked spiritual state: avg heart ${avgHeart}/5, total verses ${total}. Write one gentle reflection question (under 2 sentences) to deepen Quran connection. Meaningful, spiritual.`,
      state,
      100,
    )
    setReflectionQuestion(question)
  }, [state])

  useEffect(() => {
    if (isOnboarded) {
      const timer = window.setTimeout(() => {
        generateNudge()
        generateReflectionQuestion()
      }, 0)

      return () => clearTimeout(timer)
    }
    return undefined
  }, [isOnboarded, generateNudge, generateReflectionQuestion])

  async function openReflection({ ref, prompt }) {
    setSheet({ open: true, ref, body: '', loading: true })
    const body = await askClaude(prompt, state, 200)
    setSheet({ open: true, ref, body, loading: false })
  }

  async function showReturnPage() {
    navigate('/return')
    setReturnMessage('')
    const text = await askClaude(
      `Write a 2-sentence compassionate welcome-back message for a Muslim named ${state.name} who missed their Quran streak. Reference Allah's mercy. Warm, hopeful, non-guilt-tripping.`,
      state,
      150,
    )
    setReturnMessage(text)
  }

  function completeOnboarding({ name, goal }) {
    setState((prev) => ({
      ...prev,
      name,
      goal,
      streak: 3,
      versesReadToday: 4,
      sessions: [
        { date: 'Apr 11', verses: 12, heart: 4 },
        { date: 'Apr 12', verses: 8, heart: 3 },
        { date: 'Apr 13', verses: 15, heart: 5 },
        { date: 'Apr 14', verses: 6, heart: 2 },
        { date: 'Apr 15', verses: 10, heart: 4 },
        { date: 'Apr 16', verses: 14, heart: 5 },
        { date: 'Apr 17', verses: 4, heart: 3 },
      ],
    }))
    setIsOnboarded(true)
    navigate('/')
  }

  function markRead() {
    setState((prev) => {
      const versesReadToday = Math.min(prev.goal, prev.versesReadToday + 5)
      const streak = versesReadToday >= prev.goal ? prev.streak + 1 : prev.streak

      if (versesReadToday >= prev.goal) {
        showToast('🔥 MashaAllah! Streak updated!')
      } else {
        showToast(`✓ +5 verses logged (${versesReadToday}/${prev.goal})`)
      }

      return { ...prev, versesReadToday, streak }
    })
  }

  function bookmarkTodayVerse(verse) {
    setState((prev) => {
      if (prev.bookmarks.some((bookmark) => bookmark.ref === verse.ref)) {
        showToast('Already saved 🔖')
        return prev
      }

      showToast('Verse bookmarked 🔖')
      return { ...prev, bookmarks: [...prev.bookmarks, verse] }
    })
  }

  function bookmarkVerse(verse) {
    setState((prev) => {
      if (prev.bookmarks.some((bookmark) => bookmark.num === verse.num)) {
        showToast('Already saved')
        return prev
      }

      showToast('Verse bookmarked 🔖')
      return { ...prev, bookmarks: [...prev.bookmarks, { ...verse, surah: 'Al-Fatiha' }] }
    })
  }

  function rateHeart(heartRating, label) {
    setState((prev) => ({ ...prev, heartRating }))
    showToast(`Heart: ${label} 🤍`)
  }

  function postReflection(text) {
    if (!text.trim()) {
      showToast('Write something first')
      return
    }

    const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

    const entry = {
      text: text.trim(),
      date,
      verse: todayVerse.ref,
    }

    setState((prev) => ({ ...prev, journals: [entry, ...prev.journals] }))
    showToast('Reflection posted 🤍')
  }

  function togglePlayVerse(verseNum) {
    if (verseNum) {
      showToast(`▶ Playing verse ${verseNum}`)
    }

    setState((prev) => {
      const audioPlaying = !prev.audioPlaying
      return { ...prev, audioPlaying }
    })

    if (audioTimer.current) {
      clearInterval(audioTimer.current)
      audioTimer.current = null
    }

    setTimeout(() => {
      setState((current) => {
        if (!current.audioPlaying) {
          return current
        }

        audioTimer.current = setInterval(() => {
          setState((inner) => {
            const next = Math.min(100, inner.audioProgress + 0.4)
            if (next >= 100 && audioTimer.current) {
              clearInterval(audioTimer.current)
              audioTimer.current = null
              return { ...inner, audioPlaying: false, audioProgress: 0 }
            }
            return { ...inner, audioProgress: next }
          })
        }, 200)

        return current
      })
    }, 0)
  }

  return (
    <>
      <Routes>
        {!isOnboarded ? (
          <>
            <Route path="*" element={<OnboardingPage onComplete={completeOnboarding} />} />
          </>
        ) : (
          <>
            <Route
              path="/"
              element={
                <HomePage
                  state={state}
                  nudge={nudge}
                  onMarkRead={markRead}
                  onBookmarkTodayVerse={bookmarkTodayVerse}
                  onRateHeart={rateHeart}
                  onVerseReflection={openReflection}
                  onShowReturn={showReturnPage}
                />
              }
            />
            <Route
              path="/reader"
              element={
                <ReaderPage
                  state={state}
                  onBookmarkVerse={bookmarkVerse}
                  onReflectVerse={openReflection}
                  onPlayVerse={togglePlayVerse}
                />
              }
            />
            <Route
              path="/momentum"
              element={
                <MomentumPage
                  state={state}
                  reflectionQuestion={reflectionQuestion}
                  onGenerateReflectionQuestion={generateReflectionQuestion}
                  onPostReflection={postReflection}
                  onRateHeart={rateHeart}
                />
              }
            />
            <Route path="/journal" element={<JournalPage journals={state.journals} />} />
            <Route path="/return" element={<ReturnPage returnMessage={returnMessage} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>

      <AiReflectionSheet
        open={sheet.open}
        verseRef={sheet.ref}
        body={sheet.body}
        loading={sheet.loading}
        onClose={() => setSheet((prev) => ({ ...prev, open: false }))}
      />

      <Toast message={toast} />
    </>
  )
}

export default App
