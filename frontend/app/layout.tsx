import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'CampusCart - Institution-Based Marketplace',
  description: 'Buy and sell products within your institution community',
  keywords: 'marketplace, campus, college, university, buy, sell, student',
  authors: [{ name: 'CampusCart Team' }],
  creator: 'CampusCart',
  publisher: 'CampusCart',
  openGraph: {
    title: 'CampusCart - Institution-Based Marketplace',
    description: 'Buy and sell products within your institution community',
    url: 'https://campuscart.com',
    siteName: 'CampusCart',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CampusCart - Institution-Based Marketplace',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CampusCart - Institution-Based Marketplace',
    description: 'Buy and sell products within your institution community',
    images: ['/images/twitter-image.jpg'],
    creator: '@campuscart',
  },
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0057B7' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
} 