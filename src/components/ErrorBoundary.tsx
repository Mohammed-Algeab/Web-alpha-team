// src/components/ErrorBoundary.tsx
// ponytail: React ErrorBoundary كلاسيكي — يحمي التطبيق من شاشة بيضاء

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // ponytail: لا نستخدم sentry/firebase — فقط console للتصحيح
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
        >
          <div className="text-center" style={{ maxWidth: 400, padding: '0 20px' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: 'rgba(200,80,60,0.12)',
                border: '1px solid rgba(200,80,60,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}
            >
              <span style={{ fontSize: 28 }}>⚠️</span>
            </div>
            <h2
              style={{
                fontFamily: 'Cairo, system-ui, sans-serif',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--bronze)',
                marginBottom: '0.5rem',
              }}
            >
              حدث خطأ غير متوقع
            </h2>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                marginBottom: '1.5rem',
              }}
            >
              {this.state.error?.message || 'يرجى إعادة تحميل الصفحة'}
            </p>
            <button
              onClick={this.handleRetry}
              className="btn-bronze"
              style={{ fontSize: '0.85rem' }}
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
