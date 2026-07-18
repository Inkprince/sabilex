import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppShell from '@/components/AppShell';
import { ChatProvider } from '@/context/ChatContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SabiLex — Know Your Constitutional Rights',
  description: 'AI-powered legal search and rights advisor for Nigerian constitutional law.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className={inter.className}>
        <ChatProvider>
          <AppShell>
            {children}
          </AppShell>
        </ChatProvider>
      </body>
    </html>
  );
}
