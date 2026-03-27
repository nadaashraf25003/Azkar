import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    message: '',
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'Unexpected application error',
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Azkar runtime error:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-(--bg) px-4 text-(--text)">
        <div className="w-full max-w-xl rounded-2xl border border-(--line) bg-(--panel) p-6 shadow-lg">
          <h1 className="mb-2 text-2xl font-bold text-(--text-strong)">
            Something went wrong while rendering Azkar.
          </h1>
          <p className="mb-3 text-sm text-(--muted)">
            Please refresh the page. If the problem continues, restart the dev server.
          </p>
          <p className="mb-4 rounded-lg bg-(--brand-100) p-3 text-sm text-(--text-strong)">
            Error: {this.state.message}
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="rounded-lg bg-(--brand-500) px-4 py-2 text-sm font-semibold text-white"
          >
            Reload
          </button>
        </div>
      </div>
    )
  }
}
