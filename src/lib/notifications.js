import { localDateKey } from './localDay'

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notification')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

export function hasNotificationPermission() {
  if (!('Notification' in window)) return false
  return Notification.permission === 'granted'
}

export function areNotificationsMuted() {
  return localStorage.getItem('thabit_notifications_muted') === 'true'
}

export function sendStreakReminder(streakCount) {
  if (!hasNotificationPermission()) return
  if (areNotificationsMuted()) return

  const today = localDateKey()
  const lastRemindedDate = localStorage.getItem('thabit_streak_reminder')

  // Only remind once per day
  if (lastRemindedDate === today) return

  const title = "Keep your streak alive! 🌙"
  const body = `You have a ${streakCount}-day streak! Read your verses today to keep it going.`

  const notification = new Notification(title, {
    body,
    icon: '/vite.svg', // A placeholder icon, you might want to use a real app icon if available
  })

  notification.onclick = () => {
    window.focus()
    notification.close()
  }

  localStorage.setItem('thabit_streak_reminder', today)
}
