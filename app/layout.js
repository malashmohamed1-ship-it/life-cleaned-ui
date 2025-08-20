import '../styles/globals.css'
import { Inter } from 'next/font/google'
import Navbar from '../components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'LIFE',
  description: 'Your AI Life Assistant',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        {/* subtle gradient bg + center column */}
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-50">
          <div className="max-w-3xl mx-auto px-4 py-6">
            <Navbar />
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
