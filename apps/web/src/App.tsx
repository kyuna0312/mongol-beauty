import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppRoutes } from '@/app/routes';
import { GET_SITE_SETTINGS } from '@/graphql/queries';

export default function App() {
  const { data: settingsData } = useQuery(GET_SITE_SETTINGS);

  useEffect(() => {
    const color = settingsData?.siteSettings?.primaryColor;
    if (color) {
      document.documentElement.style.setProperty('--color-primary', color);
    }
  }, [settingsData?.siteSettings?.primaryColor]);

  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
}
