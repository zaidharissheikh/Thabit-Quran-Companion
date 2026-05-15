import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import AiReflectionSheet from './components/AiReflectionSheet'
import Toast from './components/Toast'
import { VERSES } from './data/content'
import HomePage from './pages/HomePage'
import JournalPage from './pages/JournalPage'
import LoginPage from './pages/LoginPage'
import MomentumPage from './pages/MomentumPage'
import PlaybackPage from './pages/PlaybackPage'
import ReaderPage from './pages/ReaderPage'
import SettingsPage from './pages/SettingsPage'
import GoalsPage from './pages/GoalsPage'
import DisplayPage from './pages/DisplayPage'
import SignupPage from './pages/SignupPage'
import SurahPage from './pages/SurahPage'
import ReturnPage from './pages/ReturnPage'
import { askClaude } from './utils/ai'

const STORAGE_KEY = 'thabit_v3'

const initialState = {
  name: 'Akhi',
  goal: 10,
  streak: 3,
  versesReadToday: 4,
  heartRating: 3,
  ramadanVerses: 18,
  sessions: [
    { date: 'Apr 11', verses: 12, heart: 4 },
    { date: 'Apr 12', verses: 8, heart: 3 },
    { date: 'Apr 13', verses: 15, heart: 5 },
    { date: 'Apr 14', verses: 6, heart: 2 },
    { date: 'Apr 15', verses: 10, heart: 4 },
    { date: 'Apr 16', verses: 14, heart: 5 },
    { date: 'Apr 17', verses: 4, heart: 3 },
  ],
  bookmarks: [],
  journals: [],
  audioPlaying: false,
  audioProgress: 0,
}

function getPersistedState() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return { state: initialState }
  }

  try {
    const parsed = JSON.parse(raw)
    return {
      state: { ...initialState, ...parsed },
    }
  } catch {
    return { state: initialState }
  }
}

function App() {
  const navigate = useNavigate()
  const audioTimer = useRef(null)
  const toastTimer = useRef(null)
  const persisted = useMemo(() => getPersistedState(), [])

  const [state, setState] = useState(persisted.state)
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('thabit_logged_in')))
  const [theme, setTheme] = useState(() => localStorage.getItem('thabit_theme') || 'system')
  const [nudge, setNudge] = useState('')
  const [reflectionQuestion, setReflectionQuestion] = useState('')
  const [returnMessage, setReturnMessage] = useState('')
  const [toast, setToast] = useState('')
  const [sheet, setSheet] = useState({ open: false, ref: '', body: '', loading: false })

  const todayVerse = useMemo(() => VERSES[new Date().getDay() % VERSES.length], [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (systemPrefersDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    } else if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('thabit_theme', theme)
  }, [theme])

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
    const timer = window.setTimeout(() => {
      generateNudge()
      generateReflectionQuestion()
    }, 0)

    return () => clearTimeout(timer)
  }, [generateNudge, generateReflectionQuestion])

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

  function updateGoal(newGoal) {
    setState((prev) => ({ ...prev, goal: Number(newGoal) }))
    showToast(`Goal updated to ${newGoal} verses 🎯`)
  }

  function updateRamadanVerses(newVerses) {
    setState((prev) => ({ ...prev, ramadanVerses: Number(newVerses) }))
    showToast(`Ramadan baseline updated to ${newVerses} verses`)
  }

  function handleLogin({ email, name }) {
    if (name) {
      setState((prev) => ({ ...prev, name }))
    }
    localStorage.setItem('thabit_logged_in', email)
    setIsLoggedIn(true)
    navigate('/')
  }

  function handleLogout() {
    localStorage.removeItem('thabit_logged_in')
    setIsLoggedIn(false)
    navigate('/login')
  }

  function markRead() {
    setState((prev) => {
      const addedVerses = 5
      const newVersesReadToday = prev.versesReadToday + addedVerses
      const justReachedGoal = prev.versesReadToday < prev.goal && newVersesReadToday >= prev.goal
      const streak = justReachedGoal ? prev.streak + 1 : prev.streak

      if (justReachedGoal) {
        showToast('🔥 MashaAllah! Streak updated!')
      } else {
        showToast(`✓ +${addedVerses} verses logged (${newVersesReadToday}/${prev.goal})`)
      }

      const newSessions = [...prev.sessions]
      if (newSessions.length > 0) {
        newSessions[newSessions.length - 1] = {
          ...newSessions[newSessions.length - 1],
          verses: newSessions[newSessions.length - 1].verses + addedVerses
        }
      }

      return { ...prev, versesReadToday: newVersesReadToday, streak, sessions: newSessions }
    })
  }

  function bookmarkTodayVerse(verse) {
    setState((prev) => {
      const alreadyBookmarked = prev.bookmarks.some((bookmark) => bookmark.ref === verse.ref)

      if (alreadyBookmarked) {
        showToast('Bookmark removed')
        return {
          ...prev,
          bookmarks: prev.bookmarks.filter((bookmark) => bookmark.ref !== verse.ref),
        }
      }

      showToast('Verse bookmarked 🔖')
      return { ...prev, bookmarks: [...prev.bookmarks, verse] }
    })
  }

  function bookmarkVerse(verse) {
    setState((prev) => {
      const alreadyBookmarked = prev.bookmarks.some((bookmark) => bookmark.num === verse.num)

      if (alreadyBookmarked) {
        showToast('Bookmark removed')
        return {
          ...prev,
          bookmarks: prev.bookmarks.filter((bookmark) => bookmark.num !== verse.num),
        }
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
        {!isLoggedIn ? (
          <>
            <Route path="/signup" element={<SignupPage onSignup={handleLogin} />} />
            <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
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
              path="/surah/:id"
              element={
                <SurahPage
                  state={state}
                  onBookmarkVerse={bookmarkVerse}
                  onReflectVerse={openReflection}
                  onPlayVerse={togglePlayVerse}
                />
              }
            />
            <Route path="/play/:surahId/:verseId" element={<PlaybackPage />} />
            <Route path="/settings" element={<SettingsPage state={state} onLogout={handleLogout} />} />
            <Route path="/settings/display" element={<DisplayPage theme={theme} onUpdateTheme={(t) => { setTheme(t); localStorage.setItem('thabit_theme', t) }} />} />
            <Route path="/goals" element={<GoalsPage state={state} onUpdateGoal={updateGoal} />} />
            <Route
              path="/momentum"
              element={
                <MomentumPage
                  state={state}
                  reflectionQuestion={reflectionQuestion}
                  onGenerateReflectionQuestion={generateReflectionQuestion}
                  onPostReflection={postReflection}
                  onRateHeart={rateHeart}
                  onUpdateRamadanVerses={updateRamadanVerses}
                />
              }
            />
            <Route
              path="/journal"
              element={
                <JournalPage
                  state={state}
                  reflectionQuestion={reflectionQuestion}
                  onGenerateReflectionQuestion={generateReflectionQuestion}
                  onPostReflection={postReflection}
                />
              }
            />
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
