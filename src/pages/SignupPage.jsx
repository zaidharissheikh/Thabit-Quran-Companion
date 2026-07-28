import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DateOfBirthPicker from '../components/DateOfBirthPicker'
import { ApiError } from '../lib/api'
import {
  PASSWORD_RULES,
  getPasswordChecks,
  passwordErrorMessage,
  validateConfirmPassword,
  validateDob,
  validateEmail,
  validateName,
} from '../lib/formValidation'

const EMPTY_TOUCHED = {
  name: false,
  email: false,
  dob: false,
  password: false,
  confirmPassword: false,
}

export default function SignupPage({ onSignup }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [dob, setDob] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [touched, setTouched] = useState(EMPTY_TOUCHED)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fieldErrors = useMemo(
    () => ({
      name: validateName(name),
      email: validateEmail(email),
      dob: validateDob(dob, 11),
      password: passwordErrorMessage(password),
      confirmPassword: validateConfirmPassword(password, confirmPassword),
    }),
    [name, email, dob, password, confirmPassword],
  )

  const passwordChecks = useMemo(() => getPasswordChecks(password), [password])
  const showPasswordRules = touched.password || password.length > 0

  function markTouched(field) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  function showError(field) {
    return touched[field] ? fieldErrors[field] : ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setTouched({
      name: true,
      email: true,
      dob: true,
      password: true,
      confirmPassword: true,
    })

    const firstError =
      fieldErrors.name ||
      fieldErrors.email ||
      fieldErrors.dob ||
      fieldErrors.password ||
      fieldErrors.confirmPassword

    if (firstError) {
      setFormError('Please fix the highlighted fields before continuing.')
      return
    }

    setSubmitting(true)
    try {
      await onSignup({
        name: name.trim(),
        email: email.trim(),
        password,
        dateOfBirth: dob,
      })
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message || 'Could not create account')
      } else {
        setFormError('Could not create account. Check your connection.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (hasError) =>
    `w-full bg-[var(--app-bg)] border rounded-lg py-3 pl-11 pr-11 text-[var(--app-text)] transition-all outline-none placeholder:text-[var(--app-text-muted)] ${
      hasError
        ? 'border-[var(--app-danger)] focus:border-[var(--app-danger)]'
        : 'border-[var(--app-border)] focus:border-[var(--app-accent)]'
    }`

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--app-bg)] p-6 text-[var(--app-text)]">
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center">
        <header className="afu text-center mb-10 space-y-2">
          <div className="w-40 h-40 mx-auto mb-6 flex items-center justify-center overflow-hidden">
            <img
              alt="THAABIT Brand Emblem"
              className="w-full h-full object-contain"
              src="/logo.png"
            />
          </div>
          <h1 className="font-headline text-[40px] leading-[48px] font-bold tracking-wide uppercase text-[var(--app-accent)]">
            THAABIT
          </h1>
          <p className="font-manrope text-sm font-semibold tracking-[0.05em] text-[var(--app-accent)]/80 italic">
            A Journey into Divine Wisdom
          </p>
        </header>

        <main className="afu2 w-full bg-[var(--app-surface)] rounded-2xl p-8 shadow-2xl relative overflow-hidden border border-[var(--app-border)]">
          <div className="absolute -top-6 -left-6 opacity-10">
            <span className="material-symbols-outlined text-[120px] text-[var(--app-accent)]">flare</span>
          </div>

          <div className="relative z-10">
            <h2 className="font-headline text-[32px] leading-[40px] font-semibold text-[var(--app-accent)] text-center mb-8 border-b border-[var(--app-border)] pb-4">
              Create Account
            </h2>

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2">
                <label
                  htmlFor="signup-name"
                  className="font-manrope text-sm font-semibold tracking-[0.05em] text-[var(--app-accent)]/80 ml-1"
                >
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="signup-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => markTouched('name')}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    aria-invalid={Boolean(showError('name'))}
                    className={inputClass(Boolean(showError('name')))}
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-accent)]/70">
                    person
                  </span>
                </div>
                {showError('name') ? (
                  <p className="text-xs text-[var(--app-danger)] font-manrope ml-1" role="alert">
                    {showError('name')}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="signup-email"
                  className="font-manrope text-sm font-semibold tracking-[0.05em] text-[var(--app-accent)]/80 ml-1"
                >
                  Email
                </label>
                <div className="relative">
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => markTouched('email')}
                    placeholder="Email address"
                    autoComplete="email"
                    aria-invalid={Boolean(showError('email'))}
                    className={inputClass(Boolean(showError('email')))}
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-accent)]/70">
                    mail
                  </span>
                </div>
                {showError('email') ? (
                  <p className="text-xs text-[var(--app-danger)] font-manrope ml-1" role="alert">
                    {showError('email')}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="signup-dob"
                  className="font-manrope text-sm font-semibold tracking-[0.05em] text-[var(--app-accent)]/80 ml-1"
                >
                  Date of Birth
                </label>
                <DateOfBirthPicker
                  id="signup-dob"
                  value={dob}
                  minAge={11}
                  error={showError('dob')}
                  onChange={(next) => {
                    setDob(next)
                    markTouched('dob')
                  }}
                />
                {showError('dob') ? (
                  <p className="text-xs text-[var(--app-danger)] font-manrope ml-1" role="alert">
                    {showError('dob')}
                  </p>
                ) : (
                  <p className="text-[11px] text-[var(--app-text-muted)] font-manrope ml-1">
                    Tap the calendar to choose your birthday (age 11+)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="signup-password"
                  className="font-manrope text-sm font-semibold tracking-[0.05em] text-[var(--app-accent)]/80 ml-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => markTouched('password')}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    aria-invalid={Boolean(showError('password'))}
                    className={inputClass(Boolean(showError('password')))}
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-accent)]/70">
                    lock
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-[var(--app-accent)]/70 hover:text-[var(--app-accent)] hover:bg-[var(--app-accent)]/10 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {showPasswordRules ? (
                  <ul className="space-y-1 ml-1 pt-1">
                    {PASSWORD_RULES.map((rule) => {
                      const ok = passwordChecks[rule.key]
                      return (
                        <li
                          key={rule.key}
                          className={`flex items-center gap-1.5 text-[11px] font-manrope ${
                            ok ? 'text-emerald-600' : 'text-[var(--app-text-muted)]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {ok ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                          {rule.label}
                        </li>
                      )
                    })}
                  </ul>
                ) : null}
                {showError('password') ? (
                  <p className="text-xs text-[var(--app-danger)] font-manrope ml-1" role="alert">
                    {showError('password')}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="signup-confirm"
                  className="font-manrope text-sm font-semibold tracking-[0.05em] text-[var(--app-accent)]/80 ml-1"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="signup-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => markTouched('confirmPassword')}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    aria-invalid={Boolean(showError('confirmPassword'))}
                    className={inputClass(Boolean(showError('confirmPassword')))}
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-accent)]/70">
                    verified_user
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-[var(--app-accent)]/70 hover:text-[var(--app-accent)] hover:bg-[var(--app-accent)]/10 transition-colors"
                    aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      {showConfirm ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {showError('confirmPassword') ? (
                  <p className="text-xs text-[var(--app-danger)] font-manrope ml-1" role="alert">
                    {showError('confirmPassword')}
                  </p>
                ) : null}
              </div>

              {formError ? (
                <p className="font-manrope text-sm text-[var(--app-danger)]" role="alert">
                  {formError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="w-full gold-gradient-btn text-[#241a00] font-manrope text-sm font-bold tracking-widest uppercase py-4 rounded-full shadow-lg active:scale-[0.98] transition-transform mt-2 disabled:opacity-60"
              >
                {submitting ? 'Creating…' : 'REGISTER'}
              </button>
            </form>
          </div>
        </main>

        <footer className="afu3 mt-8 text-center">
          <p className="font-manrope text-base text-[var(--app-text-muted)]">
            Already part of the journey?{' '}
            <Link to="/login" className="text-[var(--app-accent)] font-bold hover:underline ml-1">
              Sign In
            </Link>
          </p>
        </footer>
      </div>
    </div>
  )
}
