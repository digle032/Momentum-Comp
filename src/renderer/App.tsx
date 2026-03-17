import React, { useState } from 'react'
import { AppLayout } from './components/AppLayout'
import { AppPage } from './components/MainSidebar'
import { Dashboard } from './pages/Dashboard'
import { AthletesPage } from './pages/AthletesPage'
import { AthleteDetailPage } from './pages/AthleteDetailPage'
import { TeamsPage } from './pages/TeamsPage'
import { TeamDetailPage } from './pages/TeamDetailPage'
import { CalendarPage } from './pages/CalendarPage'
import { StudioPage } from './pages/StudioPage'
import { AddAthleteModal } from './components/AddAthleteModal'
import { SessionModal } from './components/SessionModal'
import { TrainingSession } from './types'

export default function App() {
  const [activePage, setActivePage] = useState<AppPage>('dashboard')

  // Sub-navigation for Athletes and Teams
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)

  // Modals
  const [addAthleteOpen, setAddAthleteOpen] = useState(false)
  const [sessionModalOpen, setSessionModalOpen] = useState(false)
  const [editSession, setEditSession] = useState<TrainingSession | null>(null)
  const [newSessionDate, setNewSessionDate] = useState<string>('')

  const handleNavigate = (page: AppPage) => {
    setActivePage(page)
    // Clear sub-navigation on page change
    if (page !== 'athletes') setSelectedAthleteId(null)
    if (page !== 'teams') setSelectedTeamId(null)
  }

  const handleViewAthlete = (id: string) => {
    setSelectedAthleteId(id)
    setActivePage('athletes')
  }

  const handleViewTeam = (id: string) => {
    setSelectedTeamId(id)
    setActivePage('teams')
  }

  const handleOpenSession = (session?: TrainingSession, date?: string) => {
    setEditSession(session ?? null)
    setNewSessionDate(date ?? '')
    setSessionModalOpen(true)
  }

  const handleCloseSession = () => {
    setSessionModalOpen(false)
    setEditSession(null)
    setNewSessionDate('')
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard
            onNavigate={handleNavigate}
            onAddAthlete={() => setAddAthleteOpen(true)}
            onNewSession={() => handleOpenSession()}
          />
        )

      case 'athletes':
        if (selectedAthleteId) {
          return (
            <AthleteDetailPage
              athleteId={selectedAthleteId}
              onBack={() => setSelectedAthleteId(null)}
              onNavigate={handleNavigate}
              onOpenSession={(s) => handleOpenSession(s)}
            />
          )
        }
        return (
          <AthletesPage
            onViewAthlete={handleViewAthlete}
            onAddAthlete={() => setAddAthleteOpen(true)}
          />
        )

      case 'teams':
        if (selectedTeamId) {
          return (
            <TeamDetailPage
              teamId={selectedTeamId}
              onBack={() => setSelectedTeamId(null)}
              onNavigate={handleNavigate}
              onOpenSession={(s) => handleOpenSession(s)}
            />
          )
        }
        return <TeamsPage onViewTeam={handleViewTeam} />

      case 'calendar':
        return <CalendarPage />

      case 'studio':
        return <StudioPage />

      default:
        return null
    }
  }

  return (
    <>
      <AppLayout activePage={activePage} onNavigate={handleNavigate}>
        {renderPage()}
      </AppLayout>

      <AddAthleteModal
        open={addAthleteOpen}
        onClose={() => setAddAthleteOpen(false)}
      />

      <SessionModal
        open={sessionModalOpen}
        onClose={handleCloseSession}
        session={editSession}
        initialDate={newSessionDate || undefined}
      />
    </>
  )
}
