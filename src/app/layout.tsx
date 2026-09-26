import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'NetPulse — Internet Speed Test',
  description:
    'Measure your internet download speed, upload speed, latency, and network performance.',
  keywords: [
    'speed test',
    'internet speed test',
    'bandwidth test',
    'ping test',
    'jitter test',
    'network diagnostics',
    'latency test',
    'broadband speed',
  ],
  authors: [{ name: 'Amit Kumar' }],
  metadataBase: new URL('https://netpulse-speed-test.vercel.app'),
  openGraph: {
    title: 'NetPulse — Internet Speed Test',
    description:
      'Measure your internet download speed, upload speed, latency, and network performance.',
    url: 'https://netpulse-speed-test.vercel.app',
    siteName: 'NetPulse',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NetPulse — Internet Speed Test',
    description:
      'Measure your internet download speed, upload speed, latency, and network performance.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#070b14',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#070b14] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
