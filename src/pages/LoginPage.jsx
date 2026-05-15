import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email.trim() && password.trim()) {
      onLogin({ email: email.trim() })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#002B24] selection:bg-[#c8ae6d] selection:text-[#342800]">
      {/* Geometric Pattern Overlay */}
      <div className="fixed inset-0 geometric-pattern-dark pointer-events-none opacity-40" />

      {/* Ambient Light Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#004d40]/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-[#c8ae6d]/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 w-full max-w-md px-6 py-12">
        {/* Logo & Branding */}
        <div className="afu flex flex-col items-center mb-12 text-center">
          <div className="w-40 h-40 mb-4 flex items-center justify-center relative">
            <img
              alt="Thaabit Logo"
              className="w-40 h-40 object-contain z-10"
              src="/favicon.jpg"
            />
          </div>
          <h1 className="font-headline text-[40px] leading-[48px] font-bold tracking-widest uppercase text-[#c8ae6d] mb-1">
            THAABIT
          </h1>
          <p className="font-manrope text-lg italic text-[#c8ae6d]">
            A Journey into Divine Wisdom
          </p>
        </div>

        {/* Login Form Card */}
        <section className="afu2 bg-[#20201c]/60 backdrop-blur-md rounded-xl p-6 border border-[#c8ae6d]/20 shadow-2xl">
          {/* Card Header */}
          <div className="text-center mb-6">
            <h2 className="font-headline text-2xl font-semibold text-[#c8ae6d]">Welcome Back</h2>
            <div className="flex items-center justify-center mt-2">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#c8ae6d]/50" />
              <span
                className="material-symbols-outlined fill-icon text-[#c8ae6d] text-sm mx-2"
              >
                star
              </span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#c8ae6d]/50" />
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Field */}
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
                  placeholder="royal@heirloom.com"
                  className="w-full bg-[#001F1A] border-b-2 border-[#c8ae6d]/30 focus:border-[#c8ae6d] text-[#e5e2db] placeholder:text-[#bfc9c4]/30 px-12 py-4 rounded-t-lg transition-all outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
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
                  placeholder="••••••••"
                  className="w-full bg-[#001F1A] border-b-2 border-[#c8ae6d]/30 focus:border-[#c8ae6d] text-[#e5e2db] placeholder:text-[#bfc9c4]/30 px-12 py-4 rounded-t-lg transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#c8ae6d]/50 text-xl cursor-pointer hover:text-[#c8ae6d] transition-colors"
                >
                  {showPassword ? 'visibility_off' : 'visibility'}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                className="font-manrope text-sm font-semibold tracking-[0.05em] text-[#c8ae6d] hover:text-[#ffe08b] transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Sign In Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full gold-gradient py-4 rounded-full font-manrope text-sm font-bold tracking-widest uppercase text-[#342800] shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                <span>Sign In</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </form>
        </section>

        {/* Footer Links */}
        <div className="afu3 mt-12 text-center space-y-2">
          <p className="font-manrope text-base text-[#94d3c1]/60">
            New to the spiritual journey?{' '}
            <Link to="/signup" className="text-[#c8ae6d] font-bold hover:underline ml-1">
              Create Account
            </Link>
          </p>
          <div className="pt-6 flex justify-center gap-6">
            <a className="text-xs text-[#c8ae6d]/40 hover:text-[#c8ae6d] transition-colors uppercase tracking-widest" href="#">
              Privacy Policy
            </a>
            <a className="text-xs text-[#c8ae6d]/40 hover:text-[#c8ae6d] transition-colors uppercase tracking-widest" href="#">
              Terms of Service
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
