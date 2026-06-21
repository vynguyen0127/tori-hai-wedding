import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Tori & Hai · June 5, 2027',
  description: 'Join us to celebrate our wedding!',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app">
          <Navbar />
          <main>{children}</main>
          <footer className="footer">
            <p>Made with ♡ for Tori &amp; Hai · June 5, 2027</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
