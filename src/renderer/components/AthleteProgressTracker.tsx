import React, { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { TrendingUp, Plus, X } from 'lucide-react'
import { GlowingEffect } from './ui/GlowingEffect'
import { InteractiveHoverButton } from './ui/InteractiveHoverButton'
import { useCoachingStore } from '../store/coachingStore'
import { useToast } from '../context/ToastContext'
import { cn } from '../lib/utils'

interface AthleteProgressTrackerProps {
  athleteId: string
}

export const AthleteProgressTracker: React.FC<AthleteProgressTrackerProps> = ({ athleteId }) => {
  const { athletes, addProgressEntry } = useCoachingStore()
  const { show } = useToast()
  const athlete = athletes.find((a) => a.id === athleteId)

  const allEntries = athlete?.progressEntries ?? []
  const metrics = useMemo(() => [...new Set(allEntries.map((e) => e.metric))], [allEntries])

  const [selectedMetric, setSelectedMetric] = useState<string>(metrics[0] ?? '')
  const [showForm, setShowForm] = useState(false)
  const [formMetric, setFormMetric] = useState('')
  const [formValue, setFormValue] = useState('')
  const [formUnit, setFormUnit] = useState('')
  const [formNotes, setFormNotes] = useState('')

  const filteredEntries = useMemo(
    () =>
      allEntries
        .filter((e) => e.metric === selectedMetric)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((e) => ({
          ...e,
          label: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        })),
    [allEntries, selectedMetric]
  )

  const unit = filteredEntries[0]?.unit ?? ''

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formMetric.trim() || !formValue.trim() || !formUnit.trim()) return
    addProgressEntry(athleteId, {
      id: `pe-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      metric: formMetric.trim(),
      value: parseFloat(formValue),
      unit: formUnit.trim(),
      notes: formNotes.trim() || undefined,
    })
    show(`Progress logged: ${formMetric}`)
    setFormMetric('')
    setFormValue('')
    setFormUnit('')
    setFormNotes('')
    setShowForm(false)
    if (!metrics.includes(formMetric.trim())) setSelectedMetric(formMetric.trim())
  }

  return (
    <div className="relative rounded-2xl border border-border bg-muted/80 backdrop-blur-[20px] p-6">
      <GlowingEffect spread={40} proximity={64} inactiveZone={0.01} borderWidth={2} disabled={false} />

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-accent" />
          <h3 className="font-serif text-lg text-foreground">Progress Tracking</h3>
        </div>
        <InteractiveHoverButton
          text="Log Progress"
          variant="accent"
          className="text-xs px-4 py-1.5"
          onClick={() => setShowForm((v) => !v)}
        />
      </div>

      {/* Metric pills */}
      {metrics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {metrics.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMetric(m)}
              className={cn(
                'chip text-xs transition-all',
                selectedMetric === m ? 'chip-active' : 'chip-inactive'
              )}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      {/* Chart */}
      {filteredEntries.length > 0 ? (
        <div className="h-48 w-full mb-5">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredEntries} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'hsl(var(--foreground))',
                }}
                formatter={(v: number) => [`${v} ${unit}`, selectedMetric]}
                labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#00f5d4"
                strokeWidth={2}
                dot={{ fill: '#00f5d4', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#00f5d4' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-32 flex items-center justify-center text-muted-foreground text-sm mb-5">
          {metrics.length === 0 ? 'No progress entries yet. Log your first entry below.' : 'No data for this metric.'}
        </div>
      )}

      {/* Inline form */}
      {showForm && (
        <div className="border border-border rounded-xl p-4 bg-background/40 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">New Entry</p>
            <button className="btn-ghost p-1" onClick={() => setShowForm(false)}><X size={13} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-3 relative">
                <input
                  className="input text-sm"
                  placeholder="Metric name (e.g. Vertical Jump)"
                  value={formMetric}
                  onChange={(e) => setFormMetric(e.target.value)}
                  list="metric-suggestions"
                  required
                />
                <datalist id="metric-suggestions">
                  {metrics.map((m) => <option key={m} value={m} />)}
                </datalist>
              </div>
              <input
                className="input text-sm"
                type="number"
                step="any"
                placeholder="Value"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                required
              />
              <input
                className="input text-sm col-span-2"
                placeholder="Unit (e.g. inches)"
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value)}
                required
              />
            </div>
            <input
              className="input text-sm"
              placeholder="Notes (optional)"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
            />
            <button type="submit" className="btn-primary w-full text-xs gap-1.5">
              <Plus size={13} />
              Save Entry
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
