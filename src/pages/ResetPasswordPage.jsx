import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError, authApi } from '../lib/api'
import { validateLoginPassword } from '../lib/formValidation'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState(false)

  const passwordError = validateLoginPassword(password)
  const confirmError = password !== confirmPassword ? 'Passwords do not match' : ''

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!token) {
      setFormError('Reset token is missing from the URL.')
      return
    }

    if (passwordError || confirmError) {
      setFormError('Please fix the highlighted fields before submitting.')
      return
    }

    setSubmitting(true)
    try {
      await authApi.resetPassword(token, password)
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message || 'Could not reset password')
      } else {
        setFormError('Could not reset password. Check your connection.')
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#002B24] selection:bg-[#c8ae6d] selection:text-[#342800]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#004d40]/20 blur-[120px] rounded-full" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-[#c8ae6d]/10 blur-[120px] rounded-full" />
        </div>
        <main className="relative z-10 w-full max-w-md px-6 py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full border-2 border-[#c8ae6d] flex items-center justify-center text-[#c8ae6d]">
            <span className="material-symbols-outlined text-4xl">check</span>
          </div>
          <h2 className="font-headline text-3xl font-semibold text-[#c8ae6d] mb-4">
            Password Reset
          </h2>
          <p className="font-manrope text-base text-[#e5e2db]/75 mb-8">
            Your password has been successfully reset. Redirecting you to login...
          </p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#002B24] selection:bg-[#c8ae6d] selection:text-[#342800]">
      <div className="fixed inset-0 geometric-pattern-dark pointer-events-none opacity-40" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#004d40]/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-[#c8ae6d]/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="afu flex flex-col items-center mb-8 text-center">
          <div className="w-24 h-24 mb-4 flex items-center justify-center relative">
            <img
              alt="Thaabit Logo"
              className="w-24 h-24 object-contain z-10"
              src="/logo.png"
            />
          </div>
          <h1 className="font-headline text-[32px] leading-[40px] font-bold tracking-widest uppercase text-[#c8ae6d] mb-1">
            Reset Password
          </h1>
          {email && (
            <p className="font-manrope text-sm text-[#94d3c1]/70">
              for {email}
            </p>
          )}
        </div>

        <section className="afu2 bg-[#20201c]/60 backdrop-blur-md rounded-xl p-6 border border-[#c8ae6d]/20 shadow-2xl">
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            
            <div className="space-y-1">
              <label
                className="block font-manrope text-sm font-semibold tracking-[0.05em] text-[#c8ae6d]/70 px-1"
                htmlFor="reset-password"
              >
                New Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#c8ae6d]/50 text-xl">
                  lock
                </span>
                <input
                  id="reset-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={inputClass(Boolean(password && passwordError))}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-[#c8ae6d]/50 hover:text-[#c8ae6d] hover:bg-[#c8ae6d]/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {password && passwordError ? (
                <p className="font-manrope text-xs text-red-300/90 px-1" role="alert">
                  {passwordError}
                </p>
              ) : null}
            </div>

            <div className="space-y-1">
              <label
                className="block font-manrope text-sm font-semibold tracking-[0.05em] text-[#c8ae6d]/70 px-1"
                htmlFor="confirm-password"
              >
                Confirm Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#c8ae6d]/50 text-xl">
                  lock_reset
                </span>
                <input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={inputClass(Boolean(confirmPassword && confirmError))}
                />
              </div>
              {confirmPassword && confirmError ? (
                <p className="font-manrope text-xs text-red-300/90 px-1" role="alert">
                  {confirmError}
                </p>
              ) : null}
            </div>

            {formError ? (
              <p className="font-manrope text-sm text-red-300/90 px-1 pt-2" role="alert">
                {formError}
              </p>
            ) : null}

            <div className="pt-6">
              <button
                type="submit"
                disabled={submitting || !password || !confirmPassword || Boolean(passwordError) || Boolean(confirmError)}
                className="w-full gold-gradient py-4 rounded-full font-manrope text-sm font-bold tracking-widest uppercase text-[#342800] shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <span>{submitting ? 'Resetting…' : 'Reset Password'}</span>
                <span className="material-symbols-outlined text-lg">check</span>
              </button>
            </div>
            
          </form>
        </section>
      </main>
    </div>
  )
}
