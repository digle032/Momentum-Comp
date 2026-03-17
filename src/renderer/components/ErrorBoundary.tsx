import React from 'react'
import { GlowingCard } from './ui/GlowingCard'
import rabbitLogo from '../assets/rabbit-logo.png'

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen bg-background flex items-center justify-center">
          <GlowingCard className="max-w-[400px] w-full text-center p-8">
            <div className="flex justify-center mb-4">
              <img src={rabbitLogo} alt="Momentum" style={{ height: 40, width: 'auto' }} />
            </div>
            <h2 className="font-serif text-2xl text-foreground mb-2">Something went wrong</h2>
            <p className="font-sans text-sm text-muted-foreground mb-6">
              An unexpected error occurred. Please reload the app.
            </p>
            <button className="btn-primary" onClick={() => window.location.reload()}>
              Reload
            </button>
          </GlowingCard>
        </div>
      )
    }
    return this.props.children
  }
}
