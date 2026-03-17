import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Dumbbell, Film } from 'lucide-react'
import AnimatedShaderBackground from '../components/ui/AnimatedShaderBackground'
import { GlowingEffect } from '../components/ui/GlowingEffect'
import { InteractiveHoverButton } from '../components/ui/InteractiveHoverButton'
import { useCoachingStore } from '../store/coachingStore'
import { cn } from '../lib/utils'

interface OnboardingPageProps {
  onComplete: () => void
}

const SPORTS = ['Basketball', 'Football', 'Swimming', 'Track & Field', 'Soccer', 'Gymnastics', 'Tennis', 'Other']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Elite'] as const

type Level = typeof LEVELS[number]

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const { addAthlete, setOnboardingStep, completeOnboarding } = useCoachingStore()
  const [step, setStep] = useState(0)
  const [sport, setSport] = useState('')
  const [athleteName, setAthleteName] = useState('')
  const [athleteAge, setAthleteAge] = useState('')
  const [athleteLevel, setAthleteLevel] = useState<Level>('Intermediate')

  const goNext = () => {
    setOnboardingStep(step + 1)
    setStep((s) => s + 1)
  }

  const handleAddAthlete = (e: React.FormEvent) => {
    e.preventDefault()
    if (!athleteName.trim()) return
    addAthlete({
      id: `ath-${Date.now()}`,
      name: athleteName.trim(),
      avatarUrl: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      age: parseInt(athleteAge) || 18,
      weight: 150,
      height: 68,
      sport: sport || 'Multi-Sport',
      level: athleteLevel,
      goals: '',
      notes: [],
      compilationUrls: [],
      teamIds: [],
      progressEntries: [],
      sessionClips: [],
    })
    goNext()
  }

  const handleComplete = () => {
    completeOnboarding()
    onComplete()
  }

  const steps = [
    // Step 0 — Welcome + Sport
    <motion.div
      key="step-0"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h1 className="font-serif text-4xl text-foreground">Welcome to Momentum.</h1>
        <p className="text-muted-foreground">Let&apos;s set up your coaching hub in 3 steps.</p>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-widest">Your primary sport</p>
        <div className="grid grid-cols-4 gap-2">
          {SPORTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSport(s)}
              className={cn(
                'chip text-sm py-2 transition-all',
                sport === s ? 'chip-active' : 'chip-inactive'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <InteractiveHoverButton text="Let's go" variant="accent" className="w-full" onClick={goNext} />
    </motion.div>,

    // Step 1 — Add first athlete
    <motion.div
      key="step-1"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5"
    >
      <div className="text-center">
        <h1 className="font-serif text-3xl text-foreground">Add your first athlete.</h1>
      </div>
      <form onSubmit={handleAddAthlete} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Full Name *</label>
          <input
            className="input"
            value={athleteName}
            onChange={(e) => setAthleteName(e.target.value)}
            placeholder="e.g. Marcus Johnson"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Age</label>
          <input
            className="input"
            type="number"
            value={athleteAge}
            onChange={(e) => setAthleteAge(e.target.value)}
            placeholder="18"
            min={8}
            max={60}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">Level</label>
          <div className="grid grid-cols-4 gap-2">
            {LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setAthleteLevel(l)}
                className={cn('chip text-xs py-1.5', athleteLevel === l ? 'chip-active' : 'chip-inactive')}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <InteractiveHoverButton text="Add Athlete & Continue" variant="accent" className="w-full" type="submit" />
      </form>
    </motion.div>,

    // Step 2 — Done
    <motion.div
      key="step-2"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      <div className="text-center">
        <h1 className="font-serif text-3xl text-foreground">You&apos;re all set, Coach.</h1>
        <p className="text-muted-foreground mt-2">Everything you need to build champions.</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: TrendingUp, title: 'Track Progress', desc: 'Log metrics and watch your athletes improve over time.' },
          { icon: Dumbbell, title: 'Log Sessions', desc: 'Tag clips, rate drills, and build the perfect compilation.' },
          { icon: Film, title: 'Share Highlights', desc: 'One-click export to Instagram. Let your work speak.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="relative rounded-xl border border-border bg-background/50 p-4 text-center">
            <GlowingEffect spread={30} proximity={48} inactiveZone={0.01} borderWidth={1.5} disabled={false} />
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-3">
              <Icon size={16} className="text-accent" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">{title}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
      <button className="btn-primary w-full" onClick={handleComplete}>
        Enter Momentum
      </button>
    </motion.div>,
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <AnimatedShaderBackground />
      <div className="relative z-10 w-full max-w-lg">
        <div className="relative rounded-3xl border border-border bg-card/80 backdrop-blur-[20px] p-10">
          <GlowingEffect spread={60} proximity={80} inactiveZone={0.01} borderWidth={2} disabled={false} />

          {/* Progress bar */}
          <div className="flex gap-1.5 mb-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'h-1 flex-1 rounded-full transition-all duration-500',
                  i <= step ? 'bg-accent' : 'bg-border'
                )}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {steps[step]}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
