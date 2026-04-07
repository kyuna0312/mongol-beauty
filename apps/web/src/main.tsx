import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import App from './App';
import { apolloClient } from './lib/apollo';
import { AdminAuthProvider } from './hooks/useAdminAuth';
import { AuthProvider } from './hooks/useAuth';
import './index.css';

// Register service worker for PWA (optional)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js');
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider value={defaultSystem}>
      <ApolloProvider client={apolloClient}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AuthProvider>
            <AdminAuthProvider>
              <HelmetProvider>
                <App />
              </HelmetProvider>
            </AdminAuthProvider>
          </AuthProvider>
        </BrowserRouter>
      </ApolloProvider>
    </ChakraProvider>
  </React.StrictMode>,
);
