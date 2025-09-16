import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from '@/components/providers/Providers';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DeFi Token Suite - Public Airdrops',
  description: 'Claim tokens from public airdrop campaigns on multiple networks',
  keywords: ['DeFi', 'Token', 'Airdrop', 'Ethereum', 'Base', 'Web3', 'Crypto'],
  openGraph: {
    title: 'DeFi Token Suite - Public Airdrops',
    description: 'Claim tokens from public airdrop campaigns',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full dark" style={{colorScheme: 'dark'}}>
      <body className={`${inter.className} h-full antialiased`}>
        <Providers>
          <div className="min-h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {children}
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgb(15 23 42)', // slate-900
                color: 'rgb(248 250 252)', // slate-50
                border: '1px solid rgb(51 65 85)', // slate-600
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}