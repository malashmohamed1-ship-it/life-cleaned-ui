import '../styles/globals.css'
import { Inter } from 'next/font/google'
import Navbar from '../components/Navbar'          // 👈 add this

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'LIFE',
  description: 'Your AI Life Assistant',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 text-gray-900">
          <Navbar />                                {/* 👈 add this */}
          {children}
        </div>
      </body>
    </html>
  )
}
