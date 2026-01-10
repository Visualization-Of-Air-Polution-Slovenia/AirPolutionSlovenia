import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import { ApiError } from './Services/api.ts';

// Global styles
import './index.css';
import '@/ui/buttons.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry logic for 503 (backend cold start can take 50+ seconds on free tier)
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status === 503) {
          // Backend is starting up - retry up to 12 times (~60+ seconds total)
          return failureCount < 12;
        }
        // Other errors - retry once
        return failureCount < 1;
      },
      // Retry every 5 seconds for cold start, gives ~60 seconds total wait time
      retryDelay: (attemptIndex, error) => {
        if (error instanceof ApiError && error.status === 503) {
          return (attemptIndex + 1 + Math.random()) * 5000; // Fixed 5 second delay between retries
        }
        return 1000;
      },
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
