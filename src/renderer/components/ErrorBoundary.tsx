import React from 'react'
import { GlassCard } from './GlassCard'
import MomentumLogo from './MomentumLogo'

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
          <GlassCard className="max-w-[400px] w-full text-center" style={{ padding: '2rem' }}>
            <div className="flex justify-center mb-4">
              <MomentumLogo size={40} />
            </div>
            <h2 className="font-serif text-2xl text-umber mb-2">Something went wrong</h2>
            <p className="font-sans text-sm text-umber/50 mb-6">
              An unexpected error occurred. Please reload the app.
            </p>
            <button className="btn-primary" onClick={() => window.location.reload()}>
              Reload
            </button>
          </GlassCard>
        </div>
      )
    }
    return this.props.children
  }
}
