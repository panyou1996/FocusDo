import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ClientTasksProvider } from '@/components/client-tasks-provider';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-body',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'AquaDo',
  description: 'A modern task management app by AquaDo',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-body antialiased`}>
        <ClientTasksProvider>
          {children}
        </ClientTasksProvider>
        <Toaster />
      </body>
    </html>
  );
}
