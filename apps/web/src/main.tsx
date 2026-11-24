import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { ToastProvider } from '@/components/ui/Toast/Toast';
import { ApiError } from '@/services/api/http';
import { OfflineError } from './lib/offline/layer';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { OfflineBanner } from '@/components/shared/OfflineBanner';
import { startStackTables } from './lib/stackTables';
import '@/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // With no internet the saved copy is shown (the api layer decides), instead of the query waiting for a connection.
      networkMode: 'always',
      staleTime: 30_000,
      // Coming back to the tab shows fresh data (status changes made by others).
      refetchOnWindowFocus: true,
      // Whatever is on screen refreshes by itself every 5 seconds (new items, notifications, status changes) while the page is
      // open and online; a query that sets its own interval keeps it. Paused in a background tab.
      refetchInterval: () => (typeof navigator !== 'undefined' && navigator.onLine === false ? false : 5_000),
      refetchOnReconnect: true,
      // Never retry auth/permission/validation failures.
      retry: (count, error) => !(error instanceof ApiError && error.status < 500) && !(error instanceof OfflineError) && count < 2,
    },
    mutations: { networkMode: 'always' },
  },
});

startStackTables();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <App />
          <OfflineBanner />
        </ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
