/**
 * Global React Error Boundary
 *
 * Catches any unhandled render-time error thrown by child components and
 * shows a friendly recovery UI instead of a blank white screen.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 */
import { Component } from "react";
import { RefreshCw, ShieldAlert } from "lucide-react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console in development (never expose to production users)
    if (process.env.NODE_ENV !== "production") {
      console.error("[ErrorBoundary] Unhandled render error:", error, info.componentStack);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const isDev = process.env.NODE_ENV !== "production";

    return (
      <div
        role="alert"
        aria-live="assertive"
        className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-foreground"
      >
        <div className="panel w-full max-w-md space-y-5 p-8 text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-500" aria-hidden="true" />

          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              An unexpected error occurred in the app. No data was sent anywhere
              — everything stays in your browser.
            </p>
          </div>

          {isDev && this.state.error && (
            <pre className="rounded-md border border-red-500/30 bg-red-500/5 p-3 text-left font-mono text-xs text-red-700 dark:text-red-300 overflow-auto max-h-40">
              {this.state.error.message}
            </pre>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-500/25 dark:text-emerald-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Reload page
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground">
            If this keeps happening, try clearing your browser&apos;s localStorage
            for this site.
          </p>
        </div>
      </div>
    );
  }
}

