import { Component } from 'react';
import Navbar from './Navbar';
import SiteFooter from './SiteFooter';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isChunkLoadError: false,
    };
  }

  static getDerivedStateFromError(error) {
    // Check if it's a chunk loading error
    const isChunkError = error?.message?.includes('loading chunk') ||
                         error?.message?.includes('Failed to import');
    
    return {
      hasError: true,
      isChunkLoadError: isChunkError,
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    
    // Log error for debugging
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    // Hard refresh to reload chunks
    window.location.href = window.location.pathname;
  };

  render() {
    if (this.state.hasError) {
      const { isChunkLoadError, error } = this.state;

      return (
        <>
          <Navbar />
          <main className="flex min-h-screen items-center justify-center px-6">
            <div className="max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
              <div className="mb-6">
                <div className="mb-4 text-6xl">⚠️</div>
                <h1 className="mb-2 text-2xl font-bold text-red-600">
                  {isChunkLoadError ? 'Update Available' : 'Oops! Something went wrong'}
                </h1>
                <p className="text-slate-600">
                  {isChunkLoadError
                    ? 'A new version of this app is available. Please refresh to get the latest updates.'
                    : 'We encountered an unexpected error. Please try again.'}
                </p>
              </div>

              {!isChunkLoadError && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer font-medium text-slate-700 hover:text-slate-900">
                    Error Details
                  </summary>
                  <pre className="mt-3 overflow-auto rounded bg-slate-100 p-3 text-xs text-slate-800">
                    {error?.toString()}
                  </pre>
                </details>
              )}

              <button
                onClick={this.handleRetry}
                className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
              >
                {isChunkLoadError ? 'Refresh Page' : 'Try Again'}
              </button>
            </div>
          </main>
          <SiteFooter />
        </>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
