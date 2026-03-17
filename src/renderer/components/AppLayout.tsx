import React from 'react'
import { MainSidebar, AppPage } from './MainSidebar'

interface AppLayoutProps {
  activePage: AppPage
  onNavigate: (page: AppPage) => void
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ activePage, onNavigate, children }) => (
  <div className="flex h-screen w-screen overflow-hidden bg-background">
    <MainSidebar activePage={activePage} onNavigate={onNavigate} />
    <main className="flex-1 overflow-hidden flex flex-col">
      {children}
    </main>
  </div>
)
