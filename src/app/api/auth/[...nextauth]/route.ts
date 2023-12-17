import NextAuth from 'next-auth'
import SpotifyProvider from 'next-auth/providers/spotify'
import { AUTH_URL } from '../utils/spotify-auth'
import { AdapterUser } from 'next-auth/adapters'
import { Session } from 'next-auth'
import { JWT } from 'next-auth/jwt'

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
        async jwt({token, user, account, profile }) { 
            if (account && user){
                token.accessToken = account?.access_token as string
            }

            return token;
        },

        async session({ session, token, user} : { session: Session, token: JWT, user: AdapterUser}) {
            session.accessToken = token.accessToken;
            return session;
    },
    }
})

export { handler as GET, handler as POST }