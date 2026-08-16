import React from 'react';
import { Button } from '@/components/ui/button';

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App crashed:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md w-full space-y-4 text-center">
            <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
            <p className="text-sm text-muted-foreground break-words">
              {this.state.error.message}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.location.reload()}>Reload</Button>
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/auth';
                }}
              >
                Reset & sign in again
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return <>{this.props.children}</>;
  }
}
