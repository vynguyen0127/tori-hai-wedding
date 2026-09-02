import './globals.css';
import { Great_Vibes, Playfair_Display } from 'next/font/google';
import Navbar from '@/components/Navbar';

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-script',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata = {
  title: 'Victoria & Hai · May 29, 2027',
  description: 'Join us to celebrate our wedding!',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${greatVibes.variable} ${playfair.variable}`}>
      <body>
        <div className="app">
          <Navbar />
          <main>{children}</main>
          <footer className="footer">
            <p>Made with ♡ for Victoria &amp; Hai · May 29, 2027</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
