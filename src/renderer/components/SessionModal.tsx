import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2 } from 'lucide-react'
import { GlowingCard } from './ui/GlowingCard'
import { useCoachingStore } from '../store/coachingStore'
import { TrainingSession, Exercise } from '../types'
import { cn } from '../lib/utils'

interface SessionModalProps {
  open: boolean
  onClose: () => void
  initialDate?: string
  session?: TrainingSession | null
}

let sesCounter = 200

function newSessionId() {
  return `ses-new-${++sesCounter}-${Date.now()}`
}

function newExercise(): Exercise {
  return { name: '', sets: 3, reps: '10' }
}

export const SessionModal: React.FC<SessionModalProps> = ({
  open,
  onClose,
  initialDate,
  session,
}) => {
  const { athletes, teams, addSession, updateSession } = useCoachingStore()

  const isEdit = Boolean(session)

  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [assignType, setAssignType] = useState<'athlete' | 'team'>('athlete')
  const [assignId, setAssignId] = useState('')
  const [mode, setMode] = useState<'structured' | 'freeform'>('structured')
  const [exercises, setExercises] = useState<Exercise[]>([newExercise()])
  const [freeformNotes, setFreeformNotes] = useState('')
  const [referenceVideoUrl, setReferenceVideoUrl] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const [postSessionNotes, setPostSessionNotes] = useState('')

  // Populate form on open
  useEffect(() => {
    if (!open) return
    if (session) {
      setTitle(session.title)
      setDate(session.date.slice(0, 16))
      setAssignType(session.assignedTo.type)
      setAssignId(session.assignedTo.id)
      setMode(session.mode)
      setExercises(session.exercises?.length ? session.exercises : [newExercise()])
      setFreeformNotes(session.freeformNotes ?? '')
      setReferenceVideoUrl(session.referenceVideoUrl ?? '')
      setIsCompleted(session.isCompleted)
      setPostSessionNotes(session.postSessionNotes ?? '')
    } else {
      setTitle('')
      setDate(initialDate ? initialDate.slice(0, 16) : new Date().toISOString().slice(0, 16))
      setAssignType('athlete')
      setAssignId(athletes[0]?.id ?? '')
      setMode('structured')
      setExercises([newExercise()])
      setFreeformNotes('')
      setReferenceVideoUrl('')
      setIsCompleted(false)
      setPostSessionNotes('')
    }
  }, [open, session, initialDate, athletes])

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
    if (!title.trim() || !assignId) return

    const sessionData: TrainingSession = {
      id: session?.id ?? newSessionId(),
      title: title.trim(),
      date,
      mode,
      exercises: mode === 'structured' ? exercises.filter((ex) => ex.name.trim()) : undefined,
      freeformNotes: mode === 'freeform' ? freeformNotes : undefined,
      referenceVideoUrl: referenceVideoUrl.trim() || undefined,
      isCompleted,
      postSessionNotes: isCompleted && postSessionNotes.trim() ? postSessionNotes.trim() : undefined,
      assignedTo: { type: assignType, id: assignId },
    }

    if (isEdit && session) {
      updateSession(session.id, sessionData)
    } else {
      addSession(sessionData)
    }
    onClose()
  }

  const addExercise = () => setExercises((prev) => [...prev, newExercise()])
  const removeExercise = (i: number) =>
    setExercises((prev) => prev.filter((_, idx) => idx !== i))
  const updateExercise = (i: number, updates: Partial<Exercise>) =>
    setExercises((prev) => prev.map((ex, idx) => (idx === i ? { ...ex, ...updates } : ex)))

  const assignOptions =
    assignType === 'athlete'
      ? athletes.map((a) => ({ id: a.id, label: a.name }))
      : teams.map((t) => ({ id: t.id, label: t.name }))

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
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <GlowingCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl text-foreground">
                  {isEdit ? 'Edit Session' : 'New Session'}
                </h2>
                <button className="btn-ghost p-1.5 rounded-lg" onClick={onClose}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Session Title *
                  </label>
                  <input
                    className="input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Sprint Mechanics — Block Start"
                    required
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Date & Time
                  </label>
                  <input
                    className="input"
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                {/* Assign To */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    Assign To
                  </label>
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      className={cn('chip flex-1', assignType === 'athlete' ? 'chip-active' : 'chip-inactive')}
                      onClick={() => { setAssignType('athlete'); setAssignId(athletes[0]?.id ?? '') }}
                    >
                      Athlete
                    </button>
                    <button
                      type="button"
                      className={cn('chip flex-1', assignType === 'team' ? 'chip-active' : 'chip-inactive')}
                      onClick={() => { setAssignType('team'); setAssignId(teams[0]?.id ?? '') }}
                    >
                      Team
                    </button>
                  </div>
                  <select
                    className="input"
                    value={assignId}
                    onChange={(e) => setAssignId(e.target.value)}
                  >
                    {assignOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mode Toggle */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    Session Type
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={cn('chip flex-1', mode === 'structured' ? 'chip-active' : 'chip-inactive')}
                      onClick={() => setMode('structured')}
                    >
                      Structured
                    </button>
                    <button
                      type="button"
                      className={cn('chip flex-1', mode === 'freeform' ? 'chip-active' : 'chip-inactive')}
                      onClick={() => setMode('freeform')}
                    >
                      Free-form
                    </button>
                  </div>
                </div>

                {/* Structured: exercises */}
                {mode === 'structured' && (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-2">
                      Exercises
                    </label>
                    <div className="space-y-2">
                      {exercises.map((ex, i) => (
                        <div key={i} className="flex gap-2 items-start">
                          <input
                            className="input flex-[3]"
                            placeholder="Exercise name"
                            value={ex.name}
                            onChange={(e) => updateExercise(i, { name: e.target.value })}
                          />
                          <input
                            className="input w-16"
                            type="number"
                            min="1"
                            placeholder="Sets"
                            value={ex.sets}
                            onChange={(e) => updateExercise(i, { sets: parseInt(e.target.value) || 1 })}
                          />
                          <input
                            className="input w-20"
                            placeholder="Reps"
                            value={ex.reps}
                            onChange={(e) => updateExercise(i, { reps: e.target.value })}
                          />
                          <button
                            type="button"
                            className="btn-ghost p-2 shrink-0 text-destructive hover:text-red-400"
                            onClick={() => removeExercise(i)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="btn-ghost mt-2 text-xs gap-1.5"
                      onClick={addExercise}
                    >
                      <Plus size={13} />
                      Add Exercise
                    </button>
                  </div>
                )}

                {/* Freeform notes */}
                {mode === 'freeform' && (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Session Notes
                    </label>
                    <textarea
                      className="input resize-none"
                      rows={5}
                      value={freeformNotes}
                      onChange={(e) => setFreeformNotes(e.target.value)}
                      placeholder="Describe the session plan, focus areas, or specific instructions…"
                    />
                  </div>
                )}

                {/* Reference Video */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Reference Video URL
                  </label>
                  <input
                    className="input"
                    value={referenceVideoUrl}
                    onChange={(e) => setReferenceVideoUrl(e.target.value)}
                    placeholder="Paste a video link for reference…"
                  />
                </div>

                {/* Mark Completed */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCompleted((v) => !v)}
                    className={cn(
                      'relative w-10 h-5 rounded-full border transition-colors duration-200',
                      isCompleted ? 'bg-accent/20 border-accent/50' : 'bg-muted border-border'
                    )}
                    aria-label="Toggle completed"
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200',
                        isCompleted ? 'left-5 bg-accent' : 'left-0.5 bg-muted-foreground'
                      )}
                    />
                  </button>
                  <label className="text-sm text-foreground cursor-pointer" onClick={() => setIsCompleted((v) => !v)}>
                    Mark as Completed
                  </label>
                </div>

                {/* Post-session notes — only if completed */}
                {isCompleted && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Post-Session Notes
                    </label>
                    <textarea
                      className="input resize-none"
                      rows={3}
                      value={postSessionNotes}
                      onChange={(e) => setPostSessionNotes(e.target.value)}
                      placeholder="How did the session go? Key observations…"
                    />
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button type="button" className="btn-ghost flex-1" onClick={onClose}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    {isEdit ? 'Update Session' : 'Save Session'}
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
