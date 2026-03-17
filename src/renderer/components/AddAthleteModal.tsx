import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { GlowingCard } from './ui/GlowingCard'
import { useCoachingStore } from '../store/coachingStore'
import { Athlete } from '../types'

interface AddAthleteModalProps {
  open: boolean
  onClose: () => void
}

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Elite']

let idCounter = 100

function newId() {
  return `ath-new-${++idCounter}-${Date.now()}`
}

export const AddAthleteModal: React.FC<AddAthleteModalProps> = ({ open, onClose }) => {
  const { addAthlete } = useCoachingStore()

  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [sport, setSport] = useState('')
  const [level, setLevel] = useState('Intermediate')
  const [goals, setGoals] = useState('')

  // Reset form when opened
  useEffect(() => {
    if (open) {
      setName('')
      setAge('')
      setWeight('')
      setHeight('')
      setSport('')
      setLevel('Intermediate')
      setGoals('')
    }
  }, [open])

  // Escape to close
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !sport.trim()) return

    const avatarIndex = Math.floor(Math.random() * 70) + 1
    const newAthlete: Athlete = {
      id: newId(),
      name: name.trim(),
      avatarUrl: `https://i.pravatar.cc/150?img=${avatarIndex}`,
      age: parseInt(age) || 18,
      weight: parseFloat(weight) || 150,
      height: parseFloat(height) || 68,
      sport: sport.trim(),
      level,
      goals: goals.trim(),
      notes: [],
      compilationUrls: [],
      teamIds: [],
    }

    addAthlete(newAthlete)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-lg"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <GlowingCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl text-foreground">Add Athlete</h2>
                <button className="btn-ghost p-1.5 rounded-lg" onClick={onClose}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Full Name *
                  </label>
                  <input
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jordan Smith"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Age</label>
                    <input
                      className="input"
                      type="number"
                      min="10"
                      max="50"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="18"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Weight (lbs)
                    </label>
                    <input
                      className="input"
                      type="number"
                      min="50"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="150"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Height (in)
                    </label>
                    <input
                      className="input"
                      type="number"
                      min="40"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="68"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Sport *
                    </label>
                    <input
                      className="input"
                      value={sport}
                      onChange={(e) => setSport(e.target.value)}
                      placeholder="e.g. Basketball"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Level</label>
                    <select
                      className="input"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                    >
                      {LEVELS.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Goals
                  </label>
                  <textarea
                    className="input resize-none"
                    rows={3}
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    placeholder="What does this athlete want to achieve?"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" className="btn-ghost flex-1" onClick={onClose}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    Add Athlete
                  </button>
                </div>
              </form>
            </GlowingCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
