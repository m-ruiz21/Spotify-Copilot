import NextAuth from 'next-auth'
import SpotifyProvider from 'next-auth/providers/spotify'
import { AUTH_URL } from '../utils/spotify-auth'
import { getUser, createUser } from '@auth/utils/prisma-utils'

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

const handler = NextAuth({
    providers: [
        SpotifyProvider({
            clientId: SPOTIFY_CLIENT_ID!, 
            clientSecret: SPOTIFY_CLIENT_SECRET!,
            authorization: AUTH_URL
        })
    ],
    callbacks: {        
        async signIn({user, account, profile}) {
            const dbUser = await getUser(user?.id as string);
            if (!dbUser) {       
                createUser({
                    id: user?.id as string,
                    email: user?.email as string, 
                    lastUpdated: null,
                })
            }

            return true;    // bool representing user allowed to sign in 
        },
    }
})

export { handler as GET, handler as POST }