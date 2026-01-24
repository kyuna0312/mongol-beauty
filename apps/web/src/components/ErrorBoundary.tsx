import { Component, ReactNode, ErrorInfo } from 'react';
import { ErrorDisplay } from './ErrorDisplay';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorDisplay
          title="Уучлаарай, алдаа гарлаа!"
          message="Ямар нэгэн зүйл буруу болсон байна. Дахин оролдоно уу."
          actionLabel="Нүүр хуудас руу буцах"
          onAction={() => {
            this.setState({ hasError: false, error: undefined });
            window.location.href = '/';
          }}
          showRem={true}
          showRam={true}
        >
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4 text-left bg-gray-50 p-4 rounded-lg">
              <summary className="cursor-pointer text-sm text-gray-600 font-medium mb-2">
                🔧 Техникийн мэдээлэл (Development only)
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                {this.state.error.toString()}
                {this.state.error.stack && (
                  <>
                    {'\n\nStack Trace:\n'}
                    {this.state.error.stack}
                  </>
                )}
              </pre>
            </details>
          )}
        </ErrorDisplay>
      );
    }

    return this.props.children;
  }
}
