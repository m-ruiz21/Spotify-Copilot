import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { NextAuthProvider } from './next-auth-provider'
import type { Session } from 'next-auth'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Spotify Copilot',
  description: 'Generate Your Dream Playlist',
}

export default function RootLayout({
  children,
  session
}:{
  children: React.ReactNode,
  session: Session 
}) {
  return (
    <html lang="en">
        <NextAuthProvider session={session}>
          <body className={inter.className}>{children}</body>
        </NextAuthProvider> 
    </html>
  )
}
