import React, { useState, useEffect } from 'react'
import { Particles } from '../components/ui/Particles'
import rabbitLogo from '../assets/rabbit-logo.png'
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react'

interface AuthPageProps {
  onAuth: () => void
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuth }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAuth()
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background flex items-center justify-center">

      {/* Particle field */}
      <Particles
        color="#22d3ee"
        quantity={120}
        ease={20}
        staticity={40}
        className="absolute inset-0 z-0"
      />

      {/* Mouse-tracking radial glow */}
      <div
        className="pointer-events-none absolute z-10 transition-opacity duration-300"
        style={{
          left: mousePos.x,
          top: mousePos.y,
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, rgba(59,130,246,0.06) 40%, transparent 70%)',
          borderRadius: '50%',
        }}
      />

      {/* Static ambient corner glows */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl translate-y-1/2" />
      </div>

      {/* Auth card */}
      <div className="relative z-20 w-full max-w-sm mx-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8">

          {/* Logo + brand */}
          <div className="flex flex-col items-center text-center mb-8">
            <img src={rabbitLogo} alt="Momentum" style={{ height: 96, width: 'auto' }} className="mb-3 drop-shadow-lg" />
            <h1 className="font-serif text-2xl text-foreground tracking-tight leading-none">Momentum</h1>
            <p className="text-xs text-muted-foreground mt-1">Coach Edition</p>
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-lg border border-white/10 bg-white/5 p-1 mb-6">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-all duration-200 ${mode === 'signin' ? 'bg-accent text-accent-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-all duration-200 ${mode === 'signup' ? 'bg-accent text-accent-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Create Account
            </button>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="font-serif text-xl text-foreground">
              {mode === 'signin' ? 'Welcome back' : 'Get started'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === 'signin' ? 'Sign in to your coaching hub' : 'Create your Momentum account'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-all"
                />
              </div>
            )}

            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-all"
              />
            </div>

            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-accent/20"
            >
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Footer note */}
          <p className="text-xs text-muted-foreground text-center mt-6">
            Your data stays on your device. No cloud required.
          </p>
        </div>
      </div>
    </div>
  )
}
