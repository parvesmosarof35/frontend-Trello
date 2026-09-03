import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/ui/Navbar';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Mini Trello - Modern Kanban Project Management',
  description: 'Manage tasks, organize workflows, and collaborate with your team seamlessly.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-blue-500 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#0f172a',
                color: '#f8fafc',
                border: '1px solid rgba(51, 65, 85, 0.6)',
                borderRadius: '16px',
                fontSize: '13px',
                padding: '12px 16px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
