import { Fraunces, DM_Sans, Noto_Sans_Bengali } from 'next/font/google';
import './globals.css';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  display: 'swap',
  variable: '--font-noto-bengali',
  weight: ['400', '700'],
});

export const metadata = {
  title: 'Xakkhi সাক্ষী — Dibrugarh\'s Civic Eye',
  description:
    'Report civic issues in Dibrugarh anonymously. Garbage, potholes, drains, streetlights — track accountability ward by ward.',
  metadataBase: new URL('https://xakkhi.in'),
  openGraph: {
    title: 'Xakkhi সাক্ষী',
    description: 'Dibrugarh\'s Civic Eye — Report. Track. Resolve.',
    siteName: 'Xakkhi',
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${dmSans.variable} ${notoSansBengali.variable}`}
    >
      <body
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100dvh',
          overflow: 'hidden',
          background: '#FAFAF8',
        }}
      >
        <Header />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
