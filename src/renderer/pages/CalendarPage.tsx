import React, { useState } from 'react'
import { Calendar, dateFnsLocalizer, SlotInfo, Event } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { SessionModal } from '../components/SessionModal'
import { useCoachingStore } from '../store/coachingStore'
import { TrainingSession } from '../types'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales: { 'en-US': enUS },
})

interface CalendarEvent extends Event {
  resource: TrainingSession
}

export const CalendarPage: React.FC = () => {
  const { sessions } = useCoachingStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null)
  const [slotDate, setSlotDate] = useState<string>('')

  const events: CalendarEvent[] = sessions.map((s) => ({
    id: s.id,
    title: s.title,
    start: new Date(s.date),
    end: new Date(s.date),
    resource: s,
  }))

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedSession(event.resource)
    setSlotDate('')
    setModalOpen(true)
  }

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setSelectedSession(null)
    setSlotDate(new Date(slotInfo.start).toISOString())
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedSession(null)
    setSlotDate('')
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border shrink-0">
        <h1 className="font-serif text-2xl text-foreground">Calendar</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Click a date to schedule a session. Click an event to edit.</p>
      </div>

      {/* Calendar */}
      <div className="flex-1 overflow-hidden px-6 py-5">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          views={['month', 'week', 'agenda']}
          defaultView="month"
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: (event as CalendarEvent).resource.isCompleted
                ? 'rgba(52, 211, 153, 0.15)'
                : 'rgba(0, 245, 212, 0.12)',
              borderColor: (event as CalendarEvent).resource.isCompleted
                ? 'rgba(52, 211, 153, 0.5)'
                : 'rgba(0, 245, 212, 0.4)',
              color: (event as CalendarEvent).resource.isCompleted
                ? 'rgb(52, 211, 153)'
                : 'hsl(173, 98%, 50%)',
              fontSize: '11px',
              borderRadius: '6px',
              border: '1px solid',
            },
          })}
        />
      </div>

      <SessionModal
        open={modalOpen}
        onClose={closeModal}
        session={selectedSession}
        initialDate={slotDate || undefined}
      />
    </div>
  )
}
