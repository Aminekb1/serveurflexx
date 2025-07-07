import {  Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './css/globals.css'
import App from './App.tsx'
import Spinner from './views/spinner/Spinner.tsx'
import React from 'react'


// ErrorBoundary pour gérer les erreurs globales
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    state = { hasError: false };
  
    static getDerivedStateFromError() {
      return { hasError: true };
    }
  
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  
    render() {
      if (this.state.hasError) {
        return (
          <div className="flex h-screen justify-center items-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-red-500">Something went wrong!</h1>
              <p className="text-lg mt-4">Please try refreshing the page or contact support.</p>
              <a href="/auth/login" className="text-primary mt-4 inline-block">
                Go to Login
              </a>
            </div>
          </div>
        );
      }
      return this.props.children;
    }
  }
createRoot(document.getElementById('root')!).render(
    <ErrorBoundary>
<Suspense fallback={<Spinner />}>
        <App />
    </Suspense>,
    </ErrorBoundary>
)
