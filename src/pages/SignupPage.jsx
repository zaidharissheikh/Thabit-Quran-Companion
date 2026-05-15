import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function SignupPage({ onSignup }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [dob, setDob] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim() && email.trim() && password.trim() && password === confirmPassword) {
      onSignup({ name: name.trim(), email: email.trim() })
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#00231e] p-6 text-[#e5e2db]">
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-64 h-64 border border-[#c6a34f]/10 rounded-full rotate-45" />
        <div className="absolute bottom-20 -left-20 w-96 h-96 border border-[#c6a34f]/10 rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center">
        {/* Logo & Brand */}
        <header className="afu text-center mb-10 space-y-2">
          <div className="w-40 h-40 mx-auto mb-6 flex items-center justify-center overflow-hidden">
            <img
              alt="THAABIT Brand Emblem"
              className="w-full h-full object-contain"
              src="/favicon.jpg"
            />
          </div>
          <h1 className="font-headline text-[40px] leading-[48px] font-bold tracking-wide uppercase text-[#c6a34f] gold-text-glow">
            THAABIT
          </h1>
          <p className="font-manrope text-sm font-semibold tracking-[0.05em] text-[#c6a34f]/70 italic">
            A Journey into Divine Wisdom
          </p>
        </header>

        {/* Form Card */}
        <main className="afu2 w-full metallic-border bg-[#00322b] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Decorative Medallion */}
          <div className="absolute -top-6 -left-6 opacity-20">
            <span className="material-symbols-outlined text-[120px] text-[#c6a34f]">flare</span>
          </div>

          <div className="relative z-10">
            <h2 className="font-headline text-[32px] leading-[40px] font-semibold text-[#c6a34f] text-center mb-8 border-b border-[#c6a34f]/20 pb-4">
              Create Account
            </h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="space-y-2">
                <label className="font-manrope text-sm font-semibold tracking-[0.05em] text-[#c6a34f]/80 ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-[#001f1b] border border-[#c6a34f]/30 rounded-lg py-3 px-11 text-[#e5e2db] focus:border-[#c6a34f] transition-all outline-none placeholder:text-[#c6a34f]/30"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-3 text-[#c6a34f]/70">person</span>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="font-manrope text-sm font-semibold tracking-[0.05em] text-[#c6a34f]/80 ml-1">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@wisdom.com"
                    className="w-full bg-[#001f1b] border border-[#c6a34f]/30 rounded-lg py-3 px-11 text-[#e5e2db] focus:border-[#c6a34f] transition-all outline-none placeholder:text-[#c6a34f]/30"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-3 text-[#c6a34f]/70">mail</span>
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="font-manrope text-sm font-semibold tracking-[0.05em] text-[#c6a34f]/80 ml-1">
                  Date of Birth
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    placeholder="mm/dd/yyyy"
                    className="w-full bg-[#001f1b] border border-[#c6a34f]/30 rounded-lg py-3 px-11 text-[#e5e2db] focus:border-[#c6a34f] transition-all outline-none placeholder:text-[#c6a34f]/30"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-3 text-[#c6a34f]/70">calendar_today</span>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="font-manrope text-sm font-semibold tracking-[0.05em] text-[#c6a34f]/80 ml-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#001f1b] border border-[#c6a34f]/30 rounded-lg py-3 px-11 text-[#e5e2db] focus:border-[#c6a34f] transition-all outline-none placeholder:text-[#c6a34f]/30"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-3 text-[#c6a34f]/70">lock</span>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="font-manrope text-sm font-semibold tracking-[0.05em] text-[#c6a34f]/80 ml-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#001f1b] border border-[#c6a34f]/30 rounded-lg py-3 px-11 text-[#e5e2db] focus:border-[#c6a34f] transition-all outline-none placeholder:text-[#c6a34f]/30"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-3 text-[#c6a34f]/70">verified_user</span>
                </div>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                className="w-full gold-gradient-btn text-[#241a00] font-manrope text-sm font-bold tracking-widest uppercase py-4 rounded-full shadow-lg active:scale-[0.98] transition-transform mt-4"
              >
                REGISTER
              </button>
            </form>
          </div>
        </main>

        {/* Footer */}
        <footer className="afu3 mt-8 text-center">
          <p className="font-manrope text-base text-[#e5e2db]/60">
            Already part of the journey?{' '}
            <Link to="/login" className="text-[#c6a34f] font-bold hover:underline ml-1">
              Sign In
            </Link>
          </p>
        </footer>
      </div>
    </div>
  )
}
