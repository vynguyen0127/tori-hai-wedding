import './globals.css';
import { Great_Vibes } from 'next/font/google';
import Navbar from '@/components/Navbar';

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-script',
  display: 'swap',
});

export const metadata = {
  title: 'Tori & Hai · May 29, 2027',
  description: 'Join us to celebrate our wedding!',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={greatVibes.variable}>
      <body>
        <div className="app">
          <Navbar />
          <main>{children}</main>
          <footer className="footer">
            <p>Made with ♡ for Tori &amp; Hai · May 29, 2027</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
