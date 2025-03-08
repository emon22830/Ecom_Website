'use client';

import { ThemeProvider } from 'next-themes';
import { Provider as ReduxProvider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from '@/store/store';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-color)',
              borderRadius: '8px',
              padding: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#27AE60',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#E74C3C',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
        {children}
      </ThemeProvider>
    </ReduxProvider>
  );
} 