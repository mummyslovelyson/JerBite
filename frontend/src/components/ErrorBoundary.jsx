import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('Unhandled Application Render Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-ink-50 px-4 py-12 text-ink-900 antialiased">
          <div className="w-full max-w-lg rounded-3xl border border-ink-200 bg-white p-8 shadow-2xl text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-inner">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-ink-900">
                Something went wrong
              </h1>
              <p className="text-sm text-ink-500 leading-relaxed">
                An unexpected error occurred while displaying this page. You can reload the page or return to the homepage.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left rounded-xl bg-ink-100 p-3.5 text-xs text-ink-700 font-mono overflow-x-auto max-h-36 border border-ink-200">
                <span className="font-bold text-rose-600 block mb-1">
                  {this.state.error.name}: {this.state.error.message}
                </span>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-[10px] text-ink-500 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack.slice(0, 300)}...
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="btn-primary w-full sm:w-auto px-6 py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" /> Reload Page
              </button>
              <a
                href="/"
                className="btn-ghost w-full sm:w-auto px-6 py-2.5 text-xs font-bold flex items-center justify-center gap-2 border border-ink-200 cursor-pointer"
              >
                <Home className="h-4 w-4" /> Back to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
