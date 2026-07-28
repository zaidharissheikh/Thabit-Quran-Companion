import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, authApi } from '../lib/api'
import { validateEmail, validateLoginPassword } from '../lib/formValidation'

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotStatus, setForgotStatus] = useState('idle')
  const [forgotError, setForgotError] = useState('')
  const [touched, setTouched] = useState({ email: false, password: false })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleForgotSubmit = async (e) => {
    e.preventDefault()
    setForgotError('')
    const error = validateEmail(forgotEmail)
    if (error) {
      setForgotError(error)
      return
    }
    setForgotStatus('submitting')
    try {
      await authApi.forgotPassword(forgotEmail.trim())
      setForgotStatus('success')
    } catch (err) {
      if (err instanceof ApiError && err.isRateLimited) {
        setForgotError('Too many requests. Please try again later.')
      } else {
        setForgotError(err.message || 'Could not send reset link. Please try again.')
      }
      setForgotStatus('error')
    }
  }

  const fieldErrors = useMemo(
    () => ({
      email: validateEmail(email),
      password: validateLoginPassword(password),
    }),
    [email, password],
  )

  function markTouched(field) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  function showError(field) {
    return touched[field] ? fieldErrors[field] : ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setTouched({ email: true, password: true })

    if (fieldErrors.email || fieldErrors.password) {
      setFormError('Please fix the highlighted fields before signing in.')
      return
    }

    setSubmitting(true)
    try {
      await onLogin({ email: email.trim(), password })
    } catch (err) {
      if (err instanceof ApiError && err.isUnauthorized) {
        setFormError(err.message || 'Invalid email or password')
      } else if (err instanceof ApiError) {
        setFormError(err.message || 'Could not sign in')
      } else {
        setFormError('Could not sign in. Check your connection.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (hasError) =>
    `w-full bg-[#001F1A] border-b-2 text-[#e5e2db] placeholder:text-[#bfc9c4]/30 pl-12 pr-12 py-4 rounded-t-lg transition-all outline-none ${
      hasError
        ? 'border-red-400/70 focus:border-red-300'
        : 'border-[#c8ae6d]/30 focus:border-[#c8ae6d]'
    }`

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#002B24] selection:bg-[#c8ae6d] selection:text-[#342800]">
      <div className="fixed inset-0 geometric-pattern-dark pointer-events-none opacity-40" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#004d40]/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-[#c8ae6d]/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="afu flex flex-col items-center mb-12 text-center">
          <div className="w-40 h-40 mb-4 flex items-center justify-center relative">
            <img
              alt="Thaabit Logo"
              className="w-40 h-40 object-contain z-10"
              src="/logo.png"
            />
          </div>
          <h1 className="font-headline text-[40px] leading-[48px] font-bold tracking-widest uppercase text-[#c8ae6d] mb-1">
            THAABIT
          </h1>
          <p className="font-manrope text-lg italic text-[#c8ae6d]">
            A Journey into Divine Wisdom
          </p>
        </div>

        <section className="afu2 bg-[#20201c]/60 backdrop-blur-md rounded-xl p-6 border border-[#c8ae6d]/20 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="font-headline text-2xl font-semibold text-[#c8ae6d]">Welcome Back</h2>
            <div className="flex items-center justify-center mt-2">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#c8ae6d]/50" />
              <span className="material-symbols-outlined fill-icon text-[#c8ae6d] text-sm mx-2">
                star
              </span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#c8ae6d]/50" />
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="space-y-1">
              <label
                className="block font-manrope text-sm font-semibold tracking-[0.05em] text-[#c8ae6d]/70 px-1"
                htmlFor="login-email"
              >
                Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#c8ae6d]/50 text-xl">
                  mail
                </span>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => markTouched('email')}
                  placeholder="royal@heirloom.com"
                  autoComplete="email"
                  aria-invalid={Boolean(showError('email'))}
                  className={inputClass(Boolean(showError('email')))}
                />
              </div>
              {showError('email') ? (
                <p className="font-manrope text-xs text-red-300/90 px-1" role="alert">
                  {showError('email')}
                </p>
              ) : null}
            </div>

            <div className="space-y-1">
              <label
                className="block font-manrope text-sm font-semibold tracking-[0.05em] text-[#c8ae6d]/70 px-1"
                htmlFor="login-password"
              >
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#c8ae6d]/50 text-xl">
                  lock
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => markTouched('password')}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-invalid={Boolean(showError('password'))}
                  className={inputClass(Boolean(showError('password')))}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-[#c8ae6d]/50 hover:text-[#c8ae6d] hover:bg-[#c8ae6d]/10 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {showError('password') ? (
                <p className="font-manrope text-xs text-red-300/90 px-1" role="alert">
                  {showError('password')}
                </p>
              ) : null}
            </div>

            {formError ? (
              <p className="font-manrope text-sm text-red-300/90 px-1" role="alert">
                {formError}
              </p>
            ) : null}

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="font-manrope text-sm font-semibold tracking-[0.05em] text-[#c8ae6d] hover:text-[#ffe08b] transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full gold-gradient py-4 rounded-full font-manrope text-sm font-bold tracking-widest uppercase text-[#342800] shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <span>{submitting ? 'Signing in…' : 'Sign In'}</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </form>
        </section>

        <div className="afu3 mt-12 text-center">
          <p className="font-manrope text-base text-[#94d3c1]/60">
            New to the spiritual journey?{' '}
            <Link to="/signup" className="text-[#c8ae6d] font-bold hover:underline ml-1">
              Create Account
            </Link>
          </p>
        </div>
      </main>

      {forgotOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          role="presentation"
          onClick={() => {
            if (forgotStatus !== 'submitting') {
              setForgotOpen(false)
              setForgotStatus('idle')
              setForgotEmail('')
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="forgot-title"
            className="w-full max-w-sm rounded-2xl border border-[#c8ae6d]/35 bg-[#0a2f28] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-[#c8ae6d]/40 flex items-center justify-center text-[#c8ae6d]">
              <span className="material-symbols-outlined text-[28px]">lock_reset</span>
            </div>
            <h3
              id="forgot-title"
              className="font-headline text-xl font-semibold text-[#c8ae6d] mb-2 text-center"
            >
              Reset Password
            </h3>
            
            {forgotStatus === 'success' ? (
              <div className="text-center">
                <p className="font-manrope text-sm text-[#e5e2db]/75 leading-relaxed mb-6">
                  If an account exists with {forgotEmail}, we've sent a password reset link. Please check your inbox.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForgotOpen(false)
                    setForgotStatus('idle')
                    setForgotEmail('')
                  }}
                  className="w-full gold-gradient py-3 rounded-full font-manrope text-sm font-bold tracking-widest uppercase text-[#342800]"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} noValidate>
                <p className="font-manrope text-sm text-[#e5e2db]/75 leading-relaxed mb-4 text-center">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <div className="space-y-4 mb-6">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#c8ae6d]/50 text-xl">
                      mail
                    </span>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="royal@heirloom.com"
                      autoComplete="email"
                      className={`w-full bg-[#001F1A] border-b-2 text-[#e5e2db] placeholder:text-[#bfc9c4]/30 pl-12 pr-4 py-3 rounded-t-lg transition-all outline-none ${
                        forgotError
                          ? 'border-red-400/70 focus:border-red-300'
                          : 'border-[#c8ae6d]/30 focus:border-[#c8ae6d]'
                      }`}
                    />
                  </div>
                  {forgotError && (
                    <p className="font-manrope text-xs text-red-300/90 text-center" role="alert">
                      {forgotError}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotOpen(false)
                      setForgotStatus('idle')
                      setForgotEmail('')
                    }}
                    disabled={forgotStatus === 'submitting'}
                    className="flex-1 py-3 rounded-full border border-[#c8ae6d]/30 font-manrope text-sm font-bold tracking-widest uppercase text-[#c8ae6d] hover:bg-[#c8ae6d]/10 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotStatus === 'submitting' || !forgotEmail.trim()}
                    className="flex-1 gold-gradient py-3 rounded-full font-manrope text-sm font-bold tracking-widest uppercase text-[#342800] disabled:opacity-60 transition-opacity"
                  >
                    {forgotStatus === 'submitting' ? 'Sending…' : 'Send Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
