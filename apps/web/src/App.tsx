import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppRoutes } from '@/app/routes';

export default function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
}
