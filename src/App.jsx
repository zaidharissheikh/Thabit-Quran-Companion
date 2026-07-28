import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import DesktopSidebar from './components/DesktopSidebar'
import { resolveAvatarId } from './assets/avatars'
import AiReflectionSheet from './components/AiReflectionSheet'
import Toast from './components/Toast'
import LoadingDots from './components/LoadingDots'
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
import BookmarksPage from './pages/BookmarksPage'
import ReturnPage from './pages/ReturnPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import { askAi } from './utils/ai'
import {
  ApiError,
  authApi,
  bookmarksApi,
  notesApi,
  progressApi,
} from './lib/api'
import {
  findBookmark,
  normalizeBookmark,
  parseRefIds,
  payloadFromSurahVerse,
  payloadFromTodayVerse,
} from './lib/bookmarks'
import { createDailyAiGate } from './lib/dailyAiGate'
import {
  applyAbsoluteVerseCount,
  computeStreakFromSessions,
  localDateKey,
} from './lib/localDay'
import {
  claimVerseReadToday,
  collectLocalReadLogs,
  getReadVerseKeysForDay,
  hydrateLocalReadLogs,
  mergeReadLogs,
  mergeSessionsWithReadLogs,
} from './lib/verseRead'
import { sendStreakReminder } from './lib/notifications'

const emptyProgress = {
  goal: 10,
  streak: 0,
  versesReadToday: 0,
  lastReadDate: localDateKey(),
  heartRating: 3,
  ramadanVerses: 0,
  sessions: [],
  moodHistory: {},
  readLogs: {},
  preferences: {},
  dailyNudge: { date: null, text: '' },
  dailyReflection: { date: null, text: '' },
}

function App() {
  const navigate = useNavigate()
  const audioTimer = useRef(null)
  const toastTimer = useRef(null)
  /** Invalidates in-flight loadUserData when remounting / logging out. */
  const dataLoadIdRef = useRef(0)
  const dailyAiGateRef = useRef(createDailyAiGate())
  const favoritePersistTimer = useRef(null)
  const favoriteIdsRef = useRef([])

  const [authChecking, setAuthChecking] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [dataLoading, setDataLoading] = useState(false)
  const [progress, setProgress] = useState(emptyProgress)
  const [bookmarks, setBookmarks] = useState([])
  const [notes, setNotes] = useState([])
  const [notesTotal, setNotesTotal] = useState(0)
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [audioProgress, setAudioProgress] = useState(0)
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('thabit_theme')
    if (stored === 'light' || stored === 'dark') return stored
    return 'dark'
  })
  const [fontSize, setFontSize] = useState(() => {
    const n = Number(localStorage.getItem('thabit_font_size') || 3)
    return Number.isFinite(n) && n >= 1 && n <= 5 ? n : 3
  })
  const [avatarId, setAvatarId] = useState(() =>
    resolveAvatarId(localStorage.getItem('thabit_avatar') || 'pfp1'),
  )
  const [nudge, setNudge] = useState('')
  const [reflectionQuestion, setReflectionQuestion] = useState('')
  const [returnMessage, setReturnMessage] = useState('')
  const [toast, setToast] = useState('')
  const [sheet, setSheet] = useState({ open: false, ref: '', body: '', loading: false })

  const todayVerse = useMemo(() => VERSES[new Date().getDay() % VERSES.length], [])

  const state = useMemo(
    () => ({
      name: user?.name || 'Friend',
      ...progress,
      bookmarks,
      journals: notes,
      notesTotal,
      audioPlaying,
      audioProgress,
    }),
    [user, progress, bookmarks, notes, notesTotal, audioPlaying, audioProgress],
  )

  const showToast = useCallback((message) => {
    setToast(message)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 2600)
  }, [])

  const showApiError = useCallback(
    (err, fallback = 'Something went wrong') => {
      if (err instanceof ApiError) {
        if (err.isRateLimited) {
          showToast('Too many requests - try again shortly')
          return
        }
        showToast(err.message || fallback)
        return
      }
      showToast(fallback)
    },
    [showToast],
  )

  const loadUserData = useCallback(async () => {
    const loadId = ++dataLoadIdRef.current
    setDataLoading(true)
    try {
      const [progressRes, bookmarksRes, notesRes] = await Promise.all([
        progressApi.get(),
        bookmarksApi.list(1, 100),
        notesApi.list(1, 50),
      ])
      if (loadId !== dataLoadIdRef.current) return

      const p = progressRes.progress || emptyProgress
      const dailyNudge = p.dailyNudge || { date: null, text: '' }
      const dailyReflection = p.dailyReflection || { date: null, text: '' }

      // Mongo readLogs are the source of truth; localStorage is a cache.
      hydrateLocalReadLogs(p.readLogs || {})
      const readLogs = mergeReadLogs(p.readLogs || {}, collectLocalReadLogs())
      hydrateLocalReadLogs(readLogs)

      const todayKey = localDateKey()
      const sessions = mergeSessionsWithReadLogs(p.sessions || [], readLogs)
      const versesReadToday = (readLogs[todayKey] || []).length
      const streak = computeStreakFromSessions(sessions)
      const lastReadDate =
        versesReadToday > 0
          ? todayKey
          : sessions.length
            ? sessions[sessions.length - 1].date
            : p.lastReadDate || null

      const prefs = p.preferences || {}
      if (prefs.avatarId) setAvatarId(resolveAvatarId(prefs.avatarId))
      if (prefs.theme === 'light' || prefs.theme === 'dark') setTheme(prefs.theme)
      if (prefs.fontSize >= 1 && prefs.fontSize <= 5) setFontSize(prefs.fontSize)
      favoriteIdsRef.current = Array.isArray(prefs.favoriteSurahIds)
        ? prefs.favoriteSurahIds.map(Number)
        : []

      setProgress({
        goal: p.goal ?? 10,
        streak,
        versesReadToday,
        lastReadDate,
        heartRating: p.heartRating ?? 3,
        ramadanVerses: p.ramadanVerses ?? 0,
        sessions,
        readLogs,
        preferences: prefs,
        dailyNudge,
        dailyReflection,
        moodHistory: p.moodHistory || {},
      })

      const shouldPersist =
        streak !== (p.streak ?? 0) ||
        versesReadToday !== (p.versesReadToday ?? 0) ||
        lastReadDate !== (p.lastReadDate || null) ||
        JSON.stringify(sessions) !== JSON.stringify(p.sessions || []) ||
        JSON.stringify(readLogs) !== JSON.stringify(p.readLogs || {})

      if (shouldPersist) {
        try {
          await progressApi.patch({
            streak,
            versesReadToday,
            sessions,
            lastReadDate,
            readLogs,
          })
        } catch {
          /* keep local synced view */
        }
      }

      const gate = dailyAiGateRef.current
      if (gate.syncFromCache('nudge', dailyNudge)) {
        setNudge(dailyNudge.text)
      }
      if (gate.syncFromCache('reflection', dailyReflection)) {
        setReflectionQuestion(dailyReflection.text)
      }

      setBookmarks((bookmarksRes.bookmarks || []).map(normalizeBookmark))
      const noteList = notesRes.notes || []
      setNotes(
        noteList.map((n) => ({
          id: n.id,
          text: n.text,
          verse: n.verseLabel || n.verseRef || '',
          verseLabel: n.verseLabel,
          verseRef: n.verseRef,
          date: n.createdAt
            ? new Date(n.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
              })
            : '',
          createdAt: n.createdAt,
        })),
      )
      setNotesTotal(notesRes.total ?? noteList.length)
    } catch (err) {
      if (loadId !== dataLoadIdRef.current) return
      showApiError(err, 'Could not load your data')
      throw err
    } finally {
      if (loadId === dataLoadIdRef.current) {
        setDataLoading(false)
      }
    }
  }, [showApiError])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setAuthChecking(true)
      try {
        const { user: me } = await authApi.me()
        if (cancelled) return
        setUser(me)
        setIsLoggedIn(true)
        await loadUserData()
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiError && err.isUnauthorized) {
          setUser(null)
          setIsLoggedIn(false)
        } else {
          showApiError(err, 'Could not check session')
          setIsLoggedIn(false)
        }
      } finally {
        if (!cancelled) setAuthChecking(false)
      }
    })()
    return () => {
      cancelled = true
      // Invalidate any in-flight loadUserData so it cannot apply state / flip dataLoading.
      dataLoadIdRef.current += 1
    }
  }, [loadUserData, showApiError])

  useEffect(() => {
    const root = window.document.documentElement
    const resolved = theme === 'light' ? 'light' : 'dark'
    root.setAttribute('data-theme', resolved)
    root.classList.toggle('dark', resolved === 'dark')
    localStorage.setItem('thabit_theme', resolved)
  }, [theme])

  useEffect(() => {
    const root = window.document.documentElement
    root.setAttribute('data-font-size', String(fontSize))
    localStorage.setItem('thabit_font_size', String(fontSize))
  }, [fontSize])

  useEffect(() => {
    localStorage.setItem('thabit_avatar', avatarId)
  }, [avatarId])

  // Persist display preferences to Mongo so they follow the account across devices.
  useEffect(() => {
    if (!isLoggedIn || dataLoading || authChecking) return undefined
    const prev = progress.preferences || {}
    const prefs = {
      avatarId,
      theme,
      fontSize,
      favoriteSurahIds: Array.isArray(prev.favoriteSurahIds)
        ? prev.favoriteSurahIds
        : [],
    }
    if (
      prev.avatarId === prefs.avatarId &&
      prev.theme === prefs.theme &&
      prev.fontSize === prefs.fontSize
    ) {
      return undefined
    }
    const t = window.setTimeout(() => {
      progressApi
        .patch({ preferences: prefs })
        .then((res) => {
          if (res?.progress?.preferences) {
            setProgress((p) => ({
              ...p,
              preferences: {
                ...(p.preferences || {}),
                ...res.progress.preferences,
              },
            }))
          }
        })
        .catch(() => {})
    }, 400)
    return () => window.clearTimeout(t)
  }, [
    isLoggedIn,
    dataLoading,
    authChecking,
    avatarId,
    theme,
    fontSize,
    progress.preferences,
  ])

  // Re-check streak / daily counters when the local calendar day changes (midnight).
  useEffect(() => {
    if (!isLoggedIn) return undefined

    const tick = () => {
      setProgress((prev) => {
        const todayKey = localDateKey()
        const readLogs = mergeReadLogs(prev.readLogs || {}, collectLocalReadLogs())
        hydrateLocalReadLogs(readLogs)
        const sessions = mergeSessionsWithReadLogs(prev.sessions || [], readLogs)
        const versesReadToday = (readLogs[todayKey] || []).length
        const streak = computeStreakFromSessions(sessions)
        const lastReadDate =
          versesReadToday > 0
            ? todayKey
            : sessions.length
              ? sessions[sessions.length - 1].date
              : prev.lastReadDate || null
        const unchanged =
          versesReadToday === (prev.versesReadToday ?? 0) &&
          streak === (prev.streak ?? 0) &&
          lastReadDate === (prev.lastReadDate || null) &&
          JSON.stringify(sessions) === JSON.stringify(prev.sessions || []) &&
          JSON.stringify(readLogs) === JSON.stringify(prev.readLogs || {})
        if (unchanged) return prev
        const patch = { sessions, versesReadToday, streak, lastReadDate, readLogs }
        progressApi.patch(patch).catch(() => {})
        return { ...prev, ...patch }
      })
    }

    const id = window.setInterval(tick, 60_000)
    window.addEventListener('focus', tick)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('focus', tick)
    }
  }, [isLoggedIn])

  useEffect(() => {
    return () => {
      if (audioTimer.current) clearInterval(audioTimer.current)
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  const persistProgress = useCallback(
    async (patch, optimistic) => {
      if (optimistic) setProgress((prev) => ({ ...prev, ...optimistic }))
      try {
        const res = await progressApi.patch(patch)
        const p = res.progress
        setProgress({
          goal: p.goal,
          streak: p.streak,
          versesReadToday: p.versesReadToday,
          lastReadDate: p.lastReadDate,
          heartRating: p.heartRating,
          ramadanVerses: p.ramadanVerses,
          sessions: p.sessions || [],
          readLogs: p.readLogs || {},
          preferences: p.preferences || {},
          dailyNudge: p.dailyNudge || { date: null, text: '' },
          dailyReflection: p.dailyReflection || { date: null, text: '' },
          moodHistory: p.moodHistory || {},
        })
        if (p.readLogs) hydrateLocalReadLogs(p.readLogs)
        return p
      } catch (err) {
        showApiError(err, 'Could not save progress')
        await loadUserData().catch(() => {})
        throw err
      }
    },
    [loadUserData, showApiError],
  )

  const generateNudge = useCallback(
    async (force = false) => {
      const today = localDateKey()
      const hasCachedToday =
        progress.dailyNudge?.date === today && Boolean(progress.dailyNudge?.text)

      await dailyAiGateRef.current.run('nudge', {
        force,
        hasCachedToday,
        onUseCache: () => setNudge(progress.dailyNudge.text),
        execute: async () => {
          const text = await askAi(
            `You are Thabit, a warm Islamic companion. User ${user?.name || 'Friend'} has a ${progress.streak}-day Quran reading streak. Write a short heartfelt 1 to 1.5-sentence daily reminder. Warm, not guilt-tripping. No greetings.`,
            {
              name: user?.name,
              streak: progress.streak,
              versesReadToday: progress.versesReadToday,
              heartRating: progress.heartRating,
            },
            60,
          )
          setNudge(text)
          try {
            await persistProgress(
              { dailyNudge: { date: today, text } },
              { dailyNudge: { date: today, text } },
            )
          } catch {
            /* toast already shown */
          }
        },
      })
    },
    [progress, user, persistProgress],
  )

  const generateReflectionQuestion = useCallback(
    async (force = false) => {
      const today = localDateKey()
      const hasCachedToday =
        progress.dailyReflection?.date === today &&
        Boolean(progress.dailyReflection?.text)

      await dailyAiGateRef.current.run('reflection', {
        force,
        hasCachedToday,
        onUseCache: () => setReflectionQuestion(progress.dailyReflection.text),
        execute: async () => {
          const sessions = progress.sessions || []
          const total = sessions.reduce((sum, session) => sum + session.verses, 0)
          const avgHeart = (
            sessions.reduce((sum, session) => sum + (session.heart || 3), 0) /
            Math.max(sessions.length, 1)
          ).toFixed(1)
          const question = await askAi(
            `A Muslim tracked spiritual state: avg heart ${avgHeart}/5, total verses ${total}. Write one gentle reflection question (under 2 sentences) to deepen Quran connection. Meaningful, spiritual.`,
            {
              name: user?.name,
              streak: progress.streak,
              versesReadToday: progress.versesReadToday,
              heartRating: progress.heartRating,
            },
            70,
          )
          setReflectionQuestion(question)
          try {
            await persistProgress(
              { dailyReflection: { date: today, text: question } },
              { dailyReflection: { date: today, text: question } },
            )
          } catch {
            /* toast already shown */
          }
        },
      })
    },
    [progress, user, persistProgress],
  )

  useEffect(() => {
    if (!isLoggedIn || dataLoading || authChecking) return
    generateNudge()
    generateReflectionQuestion()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, dataLoading, authChecking])

  async function openReflection({ ref, prompt }) {
    setSheet({ open: true, ref, body: '', loading: true })
    const body = await askAi(
      prompt,
      {
        name: user?.name,
        streak: progress.streak,
        versesReadToday: progress.versesReadToday,
        heartRating: progress.heartRating,
      },
      100,
    )
    setSheet({ open: true, ref, body, loading: false })
  }

  async function showReturnPage() {
    navigate('/return')
    setReturnMessage('')
    const text = await askAi(
      `Write a 2-sentence compassionate welcome-back message for a Muslim named ${user?.name || 'Friend'} who missed their Quran streak. Reference Allah's mercy. Warm, hopeful, non-guilt-tripping.`,
      {
        name: user?.name,
        streak: progress.streak,
        versesReadToday: progress.versesReadToday,
        heartRating: progress.heartRating,
      },
      70,
    )
    setReturnMessage(text)
  }

  async function updateGoal(newGoal) {
    const goal = Number(newGoal)
    try {
      await persistProgress({ goal }, { goal })
      showToast(`Goal updated to ${newGoal} verses`)
    } catch {
      /* handled */
    }
  }

  async function updateRamadanVerses(newVerses) {
    const ramadanVerses = Number(newVerses)
    try {
      await persistProgress({ ramadanVerses }, { ramadanVerses })
      showToast(`Ramadan baseline updated to ${newVerses} verses`)
    } catch {
      /* handled */
    }
  }

  async function handleLogin({ email, password }) {
    const res = await authApi.login(email, password)
    setUser(res.user)
    setIsLoggedIn(true)
    await loadUserData()
    navigate('/')
    return res.user
  }

  async function handleSignup({ name, email, password, dateOfBirth }) {
    const res = await authApi.register(name, email, password, dateOfBirth)
    setUser(res.user)
    setIsLoggedIn(true)
    await loadUserData()
    navigate('/')
    return res.user
  }

  async function handleLogout() {
    try {
      await authApi.logout()
    } catch (err) {
      showApiError(err, 'Logout failed')
    }
    dataLoadIdRef.current += 1
    dailyAiGateRef.current.reset()
    setUser(null)
    setIsLoggedIn(false)
    setProgress(emptyProgress)
    setBookmarks([])
    setNotes([])
    setNotesTotal(0)
    setNudge('')
    setReflectionQuestion('')
    navigate('/login')
  }

  /**
   * Count a verse only when the user actually reads it (play finished / mark on surah).
   * Same ayah is only counted once per local day.
   */
  const recordVerseRead = useCallback(
    async (surahId, ayahNumber) => {
      if (!claimVerseReadToday(surahId, ayahNumber)) {
        return
      }

      const before = progress.versesReadToday ?? 0
      const todayKey = localDateKey()
      const todayKeys = getReadVerseKeysForDay(todayKey)
      const readLogs = mergeReadLogs(progress.readLogs || {}, {
        [todayKey]: todayKeys,
      })
      const count = todayKeys.length
      const base = {
        ...progress,
        sessions: mergeSessionsWithReadLogs(progress.sessions || [], readLogs),
        readLogs,
      }
      const result = applyAbsoluteVerseCount(base, count)
      const reachedGoal =
        before < progress.goal && result.versesReadToday >= progress.goal

      const patch = {
        versesReadToday: result.versesReadToday,
        streak: result.streak,
        sessions: result.sessions,
        lastReadDate: result.lastReadDate,
        readLogs,
      }

      try {
        await persistProgress(patch, patch)
        if (reachedGoal) {
          showToast(`MashaAllah! Daily goal met - ${result.streak}-day streak`)
        } else {
          showToast(
            `Ayah ${surahId}:${ayahNumber} counted (${result.versesReadToday}/${progress.goal})`,
          )
        }
      } catch {
        /* handled - read log already claimed; next load will resync */
      }
    },
    [progress, persistProgress, showToast],
  )

  async function bookmarkTodayVerse(verse) {
    let payload
    try {
      payload = payloadFromTodayVerse(verse)
    } catch (err) {
      showToast(err.message || 'Could not bookmark verse')
      return
    }
    const existing = findBookmark(bookmarks, payload)
    if (existing) {
      try {
        await bookmarksApi.remove(existing.id)
        setBookmarks((prev) => prev.filter((b) => b.id !== existing.id))
        showToast('Bookmark removed')
      } catch (err) {
        showApiError(err, 'Could not remove bookmark')
      }
      return
    }
    try {
      const res = await bookmarksApi.create(payload)
      setBookmarks((prev) => [normalizeBookmark(res.bookmark), ...prev])
      showToast('Verse bookmarked')
    } catch (err) {
      if (err instanceof ApiError && err.code === 'BOOKMARK_EXISTS') {
        showToast('Already bookmarked')
        return
      }
      showApiError(err, 'Could not bookmark')
    }
  }

  async function bookmarkSurahVerse(verse, surah) {
    const payload = payloadFromSurahVerse(verse, surah)
    const existing = findBookmark(bookmarks, payload)
    if (existing) {
      try {
        await bookmarksApi.remove(existing.id)
        setBookmarks((prev) => prev.filter((b) => b.id !== existing.id))
        showToast('Bookmark removed')
      } catch (err) {
        showApiError(err, 'Could not remove bookmark')
      }
      return
    }
    try {
      const res = await bookmarksApi.create(payload)
      setBookmarks((prev) => [normalizeBookmark(res.bookmark), ...prev])
      showToast('Verse bookmarked')
    } catch (err) {
      if (err instanceof ApiError && err.code === 'BOOKMARK_EXISTS') {
        showToast('Already bookmarked')
        return
      }
      showApiError(err, 'Could not bookmark')
    }
  }

  const toggleFavoriteSurah = useCallback(
    (surahNum) => {
      const n = Number(surahNum)
      if (!Number.isFinite(n) || n < 1 || n > 114) return

      const prev = Array.isArray(favoriteIdsRef.current)
        ? favoriteIdsRef.current
        : []
      const set = new Set(prev.map(Number))
      const adding = !set.has(n)
      if (adding) set.add(n)
      else set.delete(n)
      const favoriteSurahIds = [...set].sort((a, b) => a - b)
      favoriteIdsRef.current = favoriteSurahIds

      setProgress((p) => ({
        ...p,
        preferences: { ...(p.preferences || {}), favoriteSurahIds },
      }))
      showToast(adding ? 'Added to favorites' : 'Removed from favorites')

      if (favoritePersistTimer.current) {
        window.clearTimeout(favoritePersistTimer.current)
      }
      favoritePersistTimer.current = window.setTimeout(() => {
        progressApi
          .patch({ preferences: { favoriteSurahIds: favoriteIdsRef.current } })
          .catch(() => {
            showToast('Could not sync favorites')
          })
      }, 450)
    },
    [showToast],
  )

  async function rateHeart(heartRating, label) {
    try {
      const today = localDateKey()
      const newMoodHistory = { ...progress.moodHistory, [today]: heartRating }
      await persistProgress(
        { heartRating, moodHistory: newMoodHistory },
        { heartRating, moodHistory: newMoodHistory }
      )
      showToast(`Heart: ${label}`)
    } catch {
      /* handled */
    }
  }

  async function postReflection(text, meta = {}) {
    if (!text.trim()) {
      showToast('Write something first')
      return
    }

    const hasMeta = Object.prototype.hasOwnProperty.call(meta, 'verseLabel')
      || Object.prototype.hasOwnProperty.call(meta, 'verseRef')

    let verseLabel = null
    let verseRef = null
    if (hasMeta) {
      verseLabel = meta.verseLabel ?? null
      verseRef = meta.verseRef ?? null
    }

    const body = {
      text: text.trim(),
      verseLabel,
      verseRef,
    }
    try {
      const res = await notesApi.create(body)
      const n = res.note
      const entry = {
        id: n.id,
        text: n.text,
        verse: n.verseLabel || n.verseRef || '',
        verseLabel: n.verseLabel,
        verseRef: n.verseRef,
        date: n.createdAt
          ? new Date(n.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
            })
          : '',
        createdAt: n.createdAt,
      }
      setNotes((prev) => [entry, ...prev])
      setNotesTotal((t) => t + 1)
      showToast('Saved to journal')
    } catch (err) {
      showApiError(err, 'Could not save reflection')
      throw err
    }
  }

  function togglePlayVerse(verseNum) {
    if (verseNum) showToast(`Playing verse ${verseNum}`)

    setAudioPlaying((prev) => !prev)

    if (audioTimer.current) {
      clearInterval(audioTimer.current)
      audioTimer.current = null
    }

    setTimeout(() => {
      setAudioPlaying((playing) => {
        if (!playing) return playing
        audioTimer.current = setInterval(() => {
          setAudioProgress((inner) => {
            const next = Math.min(100, inner + 0.4)
            if (next >= 100 && audioTimer.current) {
              clearInterval(audioTimer.current)
              audioTimer.current = null
              setAudioPlaying(false)
              return 0
            }
            return next
          })
        }, 200)
        return playing
      })
    }, 0)
  }

  // --- Background Notification Checker ---
  useEffect(() => {
    // Check every 10 minutes
    const interval = setInterval(() => {
      if (!progress) return
      
      const hours = new Date().getHours()
      const versesToday = progress.versesReadToday || 0
      const streak = progress.streak || 0

      // If user has a streak, hasn't read today, and it's past 8:00 PM (20:00)
      if (streak > 0 && versesToday === 0 && hours >= 20) {
        sendStreakReminder(streak)
      }
    }, 10 * 60 * 1000)

    return () => clearInterval(interval)
  }, [progress])

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#002B24] text-[#c8ae6d]">
        <div className="flex flex-col items-center gap-4">
          <LoadingDots />
          <p className="font-manrope text-sm tracking-wide">Checking session…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full min-h-screen relative app-shell">
      {isLoggedIn && (
        <DesktopSidebar avatarId={avatarId} userName={user?.name || 'Friend'} />
      )}
      <div className="flex-1 w-full relative">
        {isLoggedIn && dataLoading && (
          <div className="fixed top-0 left-0 right-0 z-[60] flex justify-center pt-3 pointer-events-none">
            <div className="bg-[var(--app-surface)] text-[var(--app-accent-text)] text-xs font-manrope px-4 py-2 rounded-full border border-[var(--app-border)]">
              Loading your progress…
            </div>
          </div>
        )}
        <Routes>
          {!isLoggedIn ? (
            <>
              <Route path="/signup" element={<SignupPage onSignup={handleSignup} />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
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
                    avatarId={avatarId}
                    onBookmarkTodayVerse={bookmarkTodayVerse}
                    onRateHeart={rateHeart}
                    onVerseReflection={openReflection}
                    onShowReturn={showReturnPage}
                    onPostReflection={postReflection}
                  />
                }
              />
              <Route
                path="/reader"
                element={
                  <ReaderPage
                    state={state}
                    onToggleFavoriteSurah={toggleFavoriteSurah}
                  />
                }
              />
              <Route path="/bookmarks" element={<BookmarksPage state={state} />} />
              <Route
                path="/surah/:id"
                element={
                  <SurahPage
                    state={state}
                    onBookmarkVerse={bookmarkSurahVerse}
                    onReflectVerse={openReflection}
                    onPostReflection={postReflection}
                    onVerseRead={recordVerseRead}
                  />
                }
              />
              <Route
                path="/play/:surahId/:verseId"
                element={<PlaybackPage onVerseRead={recordVerseRead} />}
              />
              <Route
                path="/settings"
                element={
                  <SettingsPage
                    state={state}
                    user={user}
                    avatarId={avatarId}
                    onAvatarChange={setAvatarId}
                    onLogout={handleLogout}
                  />
                }
              />
              <Route
                path="/settings/display"
                element={
                  <DisplayPage
                    theme={theme}
                    fontSize={fontSize}
                    onUpdateTheme={setTheme}
                    onUpdateFontSize={setFontSize}
                  />
                }
              />
              <Route path="/goals" element={<GoalsPage state={state} onUpdateGoal={updateGoal} />} />
              <Route
                path="/momentum"
                element={
                  <MomentumPage
                    state={state}
                    avatarId={avatarId}
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
                    avatarId={avatarId}
                    todayVerse={todayVerse}
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
      </div>
    </div>
  )
}

export default App
