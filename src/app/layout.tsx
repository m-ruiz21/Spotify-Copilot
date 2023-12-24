import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { NextAuthProvider } from './next-auth-provider'
import type { Session } from 'next-auth'
import React from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Spotify Copilot',
  description: 'Generate Your Dream Playlist',
}

type RootLayoutProps = {
  children: React.ReactNode 
}

// NOTE: This is a hack to get around the fact that next build doesn't thing RootLayoutPropsExtended is a valid type
// session should always be there due to middleware
type RootLayoutPropsExtended = RootLayoutProps & { session: Session }
export default function RootLayout(props : RootLayoutProps | RootLayoutPropsExtended ) {

  const { children, session } = {
    ...props,
    session: undefined, 
  }

  return (
    <html lang="en">
        <NextAuthProvider session={session!}>
          <body className={inter.className}>{children}</body>
        </NextAuthProvider> 
    </html>
  )
}
