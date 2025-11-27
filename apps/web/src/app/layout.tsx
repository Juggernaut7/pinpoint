import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import dynamic from 'next/dynamic';
import { Navbar } from '@/components/navbar';
import { MobileNav } from '@/components/mobile-nav';

const WalletProvider = dynamic(() => import('@/components/wallet-provider').then(mod => ({ default: mod.WalletProvider })), {
  ssr: false,
});

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'pinpoint',
  description: 'a mobile-first, P2E reaction game that uses MiniPay for micro-payments and micro-rewards.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Navbar is included on all pages */}
        <div className="relative flex min-h-screen flex-col bg-background">
          <WalletProvider>
            <Navbar />
            <main className="flex-1 pb-24">
              {children}
            </main>
            <MobileNav />
          </WalletProvider>
        </div>
      </body>
    </html>
  );
}
